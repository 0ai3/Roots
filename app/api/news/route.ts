// app/api/news/route.ts - Fixed Gemini API endpoint
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { getDb } from "@/app/lib/mongo";
import { jsonrepair } from "jsonrepair";

const NEWS_COLLECTION = "cached_news";
const PROFILE_COLLECTION = "profiles";

// Cache news for 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;

type ProfileDoc = {
  _id?: ObjectId;
  userId?: string;
  profileId?: string;
  location?: string;
  homeCountry?: string;
};

function buildUserFilters(userId: string) {
  const filters: Record<string, unknown>[] = [];
  if (ObjectId.isValid(userId)) {
    filters.push({ _id: new ObjectId(userId) });
  }
  filters.push({ userId });
  filters.push({ profileId: userId });
  return filters;
}

function extractGeminiJson(raw: string) {
  let jsonText = raw.trim();
  const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (jsonMatch) {
    jsonText = jsonMatch[1].trim();
  }

  const jsonStart = jsonText.indexOf("{");
  const jsonEnd = jsonText.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
  }

  return jsonText;
}

function parseGeminiJson(raw: string) {
  const jsonText = extractGeminiJson(raw);

  try {
    return JSON.parse(jsonText);
  } catch (initialError) {
    try {
      const repaired = jsonrepair(jsonText);
      return JSON.parse(repaired);
    } catch (repairError) {
      console.error("Gemini JSON parse failed", {
        initialError,
        repairError,
        snippet: jsonText.slice(0, 2000),
      });
      throw new Error("Gemini returned malformed JSON");
    }
  }
}

async function fetchNewsFromGemini(location: string, homeCountry: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const prompt = `You are a travel news curator for "${location}". Generate today's cultural and entertainment news, plus important legal differences for travelers from "${homeCountry}".

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "location": "${location}",
  "date": "${new Date().toISOString()}",
  "culturalNews": [
    {
      "title": "News headline",
      "summary": "Brief summary",
      "category": "culture",
      "date": "November 15, 2025",
      "source": "Local News"
    }
  ],
  "importantLaws": [
    {
      "title": "Law title",
      "description": "What travelers need to know",
      "severity": "important",
      "comparison": "How this differs from ${homeCountry}"
    }
  ],
  "culturalTips": [
    "Quick cultural tip or etiquette note"
  ]
}

Include 4-6 cultural/entertainment news items and 3-5 important laws. Focus on:
- Current cultural events, festivals, exhibitions
- Entertainment and arts scene
- Laws about behavior, customs, prohibited items, driving, etc.
- Only laws that significantly differ from ${homeCountry}

Return ONLY the JSON object, no other text.`;

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

    return parseGeminiJson(text);
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
    let profile: ProfileDoc | null = null;
    
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
    const newsData = await fetchNewsFromGemini(location, homeCountry);

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