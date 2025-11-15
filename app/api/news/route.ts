// app/api/news/route.ts - Fixed Gemini API endpoint
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { getDb } from "../../../app/lib/mongo";

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

interface Profile {
  location?: string;
  homeCountry?: string;
}

interface ImportantLaw {
  title: string;
  description: string;
  severity: string;
  comparison: string;
  officialSource: string;
  sourceUrl: string;
}

interface NewsData {
  location: string;
  date: string;
  culturalNews: Array<{
    title: string;
    summary: string;
    category: string;
    date: string;
    source: string;
    url: string;
  }>;
  importantLaws: ImportantLaw[];
  culturalTips: string[];
}

async function fetchNewsFromGemini(location: string, homeCountry: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const prompt = `Generate cultural news and important laws for travelers visiting ${location}.

You are creating a travel guide. Generate REALISTIC and SPECIFIC information.

RESPOND WITH ONLY VALID JSON - NO MARKDOWN, NO CODE BLOCKS, NO EXPLANATIONS.

{
  "location": "${location}",
  "date": "${new Date().toISOString()}",
  "culturalNews": [
    {
      "title": "Specific event or attraction name",
      "summary": "2-3 sentences about the event or cultural attraction",
      "category": "culture",
      "date": "November 15, 2025",
      "source": "Local Tourism Board",
      "url": "https://example.com/article (real news source URL if possible, or official tourism website)"
    }
  ],
  "importantLaws": [
    {
      "title": "Specific law or regulation title",
      "description": "Clear explanation of the law and what travelers need to know. Be specific about fines, restrictions, or requirements.",
      "severity": "important",
      "comparison": "In ${homeCountry}, this is different because... (explain the key difference)",
      "officialSource": "Government ministry or official source name",
      "sourceUrl": "https://example.gov (official government or legal source URL)"
    }
  ],
  "culturalTips": [
    "Specific cultural etiquette tip or custom to follow"
  ]
}

IMPORTANT REQUIREMENTS:
1. Generate 5-7 culturalNews items about:
   - Current festivals, exhibitions, or events in ${location}
   - Popular cultural attractions or museums
   - Local entertainment and arts scene
   - Historical sites and their significance
   - Each news item MUST have a url field with a plausible news source or tourism website

2. Generate 4-6 importantLaws that are REAL and SPECIFIC to ${location}:
   - Alcohol consumption laws (where, when, age limits)
   - Dress code requirements (religious sites, public places)
   - Photography restrictions (government buildings, people, religious sites)
   - Traffic laws (speed limits, parking, pedestrian rules)
   - Drug and medication laws (even over-the-counter medicines)
   - Smoking and vaping regulations
   - Public behavior laws (PDA, noise, littering)
   - ONLY include laws that differ significantly from ${homeCountry}
   - Be SPECIFIC about fines, penalties, and enforcement
   - Each law MUST have officialSource and sourceUrl fields pointing to government or official legal sources

3. Generate 3-5 culturalTips that are actionable and specific

4. Use real information about ${location}
5. NO placeholders or generic advice like "research local laws" or "service unavailable"
6. Generate ONLY real, actionable laws with official sources
7. Ensure all JSON strings are properly escaped
8. Do NOT use line breaks inside string values
9. All URLs should be realistic (use actual domain patterns for that country)
10. Return ONLY the JSON object`;




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

export async function GET() {
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
    let profile: Profile | null = null;
    
    for (const filter of filters) {
      const doc = await db.collection(PROFILE_COLLECTION).findOne(filter, {
        projection: { location: 1, homeCountry: 1 },
      });
      if (doc) {
        profile = doc as Profile;
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
      
      // Validate that we got real data, not fallback-like content
      if (!newsData.importantLaws || newsData.importantLaws.length === 0) {
        throw new Error("No laws returned from API");
      }
      
      // Check if it looks like generic fallback content
      const hasGenericContent = newsData.importantLaws.some((law: ImportantLaw) => 
        law.title.includes("Research") || 
        law.title.includes("API Service") ||
        law.description.includes("recommend researching") ||
        law.description.includes("service issue")
      );
      
      if (hasGenericContent) {
        throw new Error("Received generic fallback content from API");
      }
      
    } catch (geminiError) {
      console.error("Gemini API failed:", geminiError);
      
      // Use a more informative fallback that still provides value
      newsData = {
        location,
        date: new Date().toISOString(),
        culturalNews: [
          {
            title: `Exploring ${location}`,
            summary: `${location} offers rich cultural experiences. Visit local tourist information centers for current events and exhibitions. Check official tourism websites for the latest festivals and cultural activities.`,
            category: "culture",
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            source: "Roots Travel",
            url: `https://www.google.com/search?q=${encodeURIComponent(location + ' tourism official website')}`
          },
          {
            title: "Local Museums and Heritage Sites",
            summary: `Research ${location}'s museums, galleries, and historical landmarks before your visit. Many offer guided tours and special exhibitions throughout the year.`,
            category: "culture",
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            source: "Roots Travel",
            url: `https://www.google.com/search?q=${encodeURIComponent(location + ' museums')}`
          }
        ],
        importantLaws: [
          {
            title: "Verify Local Regulations",
            description: `Laws in ${location} may differ from ${homeCountry}. Common areas to research: alcohol laws, dress codes, photography restrictions, traffic rules, and cultural customs. Contact your embassy or check official government travel advisories for detailed, up-to-date legal information.`,
            severity: "important",
            comparison: `Legal systems and enforcement vary between ${location} and ${homeCountry}. What's legal at home may not be abroad.`,
            officialSource: "Government Travel Advisory",
            sourceUrl: `https://www.google.com/search?q=${encodeURIComponent(location + ' travel advisory laws')}`
          }
        ],
        culturalTips: [
          `Learn basic phrases in the local language of ${location}`,
          "Research cultural norms and etiquette before visiting",
          "Respect local customs, especially regarding dress and behavior in religious or formal settings",
          "Check if tipping is customary and what percentage is appropriate"
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