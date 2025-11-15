// app/api/news/route.ts - Fixed Gemini API endpoint
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { getDb } from "@/app/lib/mongo";

const NEWS_COLLECTION = "cached_news";
const PROFILE_COLLECTION = "profiles";

// Cache news for 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;

function buildUserFilters(userId: string) {
  const filters: Record<string, unknown>[] = [];
  if (ObjectId.isValid(userId)) {
    filters.push({ _id: new ObjectId(userId) });
  }
  filters.push({ userId });
  filters.push({ profileId: userId });
  return filters;
}

async function fetchNewsFromGemini(location: string, homeCountry: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const prompt = `You are a travel news curator. Generate cultural news and legal information for travelers.

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no explanatory text.

Location: ${location}
Home Country: ${homeCountry}
Date: ${new Date().toISOString()}

Return this exact JSON structure:
{
  "location": "${location}",
  "date": "${new Date().toISOString()}",
  "culturalNews": [
    {
      "title": "string",
      "summary": "string (2-3 sentences)",
      "category": "culture",
      "date": "November 15, 2025",
      "source": "string"
    }
  ],
  "importantLaws": [
    {
      "title": "string",
      "description": "string (what travelers must know)",
      "severity": "important",
      "comparison": "string (how it differs from ${homeCountry})"
    }
  ],
  "culturalTips": [
    "string (brief cultural etiquette tip)"
  ]
}

Requirements:
- Include 4-6 culturalNews items about current events, festivals, arts, entertainment
- Include 3-5 importantLaws about behavior, customs, prohibited items, driving rules
- Include 2-4 culturalTips
- Only include laws that SIGNIFICANTLY differ from ${homeCountry}
- Keep all text concise and factual
- Ensure all strings are properly escaped for JSON
- Do NOT use newlines inside string values
- Return ONLY the JSON object, nothing else`;


  try {
    // Use the correct Gemini API v1 endpoint
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    console.log("Calling Gemini API...");
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error response:", errorData);
      throw new Error(`Gemini API returned ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    console.log("Gemini API response received");
    
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    console.log("Raw Gemini response:", text.substring(0, 500));

    // Extract JSON from markdown code blocks if present
    let jsonText = text.trim();
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }
    
    // Remove any leading/trailing non-JSON characters
    const jsonStart = jsonText.indexOf('{');
    const jsonEnd = jsonText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
    }
    
    // Fix common JSON issues from LLM responses
    jsonText = jsonText
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/\n/g, ' ') // Remove newlines that might break strings
      .replace(/\r/g, '') // Remove carriage returns
      .replace(/\t/g, ' '); // Replace tabs with spaces
    
    try {
      const parsed = JSON.parse(jsonText);
      return parsed;
    } catch (parseError) {
      console.error("JSON parsing failed. Attempted to parse:", jsonText.substring(0, 500));
      throw new Error(`Invalid JSON from Gemini: ${parseError instanceof Error ? parseError.message : 'Parse error'}`);
    }
  } catch (error) {
    console.error("Error fetching from Gemini:", error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("roots_user")?.value?.trim();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const db = await getDb();
    
    // Get user's profile using the same filter logic as profile API
    const filters = buildUserFilters(userId);
    let profile: any = null;
    
    for (const filter of filters) {
      const doc = await db.collection(PROFILE_COLLECTION).findOne(filter, {
        projection: { location: 1, homeCountry: 1 },
      });
      if (doc) {
        profile = doc;
        break;
      }
    }

    // Check if location is set
    if (!profile?.location || profile.location.trim().length === 0) {
      return NextResponse.json(
        { 
          error: "Please set your location in your profile to see personalized news.",
          needsSetup: true 
        },
        { status: 400 }
      );
    }

    const location = profile.location.trim();
    const homeCountry = (profile.homeCountry || "United States").trim();

    console.log(`Fetching news for location: ${location}, home country: ${homeCountry}`);

    // Check for cached news
    const cached = await db.collection(NEWS_COLLECTION).findOne({
      location,
      homeCountry,
      createdAt: { $gte: new Date(Date.now() - CACHE_DURATION) },
    });

    if (cached) {
      console.log("Returning cached news");
      return NextResponse.json({
        news: cached.data,
        cached: true,
        location,
        homeCountry,
      });
    }

    console.log("Fetching fresh news from Gemini...");

    // Fetch fresh news from Gemini
    let newsData;
    try {
      newsData = await fetchNewsFromGemini(location, homeCountry);
    } catch (geminiError) {
      console.error("Gemini API failed, using fallback news:", geminiError);
      
      // Fallback news data
      newsData = {
        location,
        date: new Date().toISOString(),
        culturalNews: [
          {
            title: "Welcome to " + location,
            summary: "News service is temporarily unavailable. Please check back later for cultural updates and local events.",
            category: "culture",
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            source: "Roots Travel"
          }
        ],
        importantLaws: [
          {
            title: "Research Local Laws",
            description: "We recommend researching local laws and customs before traveling. Check official government travel advisories for the most up-to-date information.",
            severity: "important",
            comparison: "Laws and customs may differ significantly from " + homeCountry
          }
        ],
        culturalTips: [
          "Always respect local customs and traditions",
          "Research dress codes and behavioral expectations before visiting religious sites"
        ]
      };
    }

    console.log("Successfully fetched news from Gemini");

    // Cache the results
    await db.collection(NEWS_COLLECTION).insertOne({
      location,
      homeCountry,
      data: newsData,
      createdAt: new Date(),
    });

    return NextResponse.json({
      news: newsData,
      cached: false,
      location,
      homeCountry,
    });
  } catch (error) {
    console.error("News API error:", error);
    
    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      { 
        error: `Unable to fetch news: ${errorMessage}`,
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}