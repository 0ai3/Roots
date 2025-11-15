// app/api/news/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/app/lib/mongo";

const NEWS_COLLECTION = "cached_news";
const PROFILE_COLLECTION = "profiles";

// Cache news for 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;

async function fetchNewsFromGemini(location: string, homeCountry: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const prompt = `You are a travel news curator for "${location}". Generate today's cultural and entertainment news, plus important legal differences for travelers from "${homeCountry}".

Return a JSON object with this structure:
{
  "location": "${location}",
  "date": "${new Date().toISOString()}",
  "culturalNews": [
    {
      "title": "News headline",
      "summary": "Brief summary",
      "category": "culture|entertainment|festival|art",
      "date": "Today's date",
      "source": "Simulated news source"
    }
  ],
  "importantLaws": [
    {
      "title": "Law title",
      "description": "What travelers need to know",
      "severity": "critical|important|good-to-know",
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
- Only laws that significantly differ from ${homeCountry}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch from Gemini");
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  // Extract JSON from markdown code blocks if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = jsonMatch ? jsonMatch[1].trim() : text.trim();
  
  return JSON.parse(jsonText);
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
    
    // Get user's profile to determine location and home country
    const profile = await db.collection(PROFILE_COLLECTION).findOne(
      { userId },
      { projection: { location: 1, homeCountry: 1 } }
    );

    const location = profile?.location || "World";
    const homeCountry = profile?.homeCountry || "United States";

    // Check for cached news
    const cached = await db.collection(NEWS_COLLECTION).findOne({
      location,
      homeCountry,
      createdAt: { $gte: new Date(Date.now() - CACHE_DURATION) },
    });

    if (cached) {
      return NextResponse.json({
        news: cached.data,
        cached: true,
        location,
        homeCountry,
      });
    }

    // Fetch fresh news from Gemini
    const newsData = await fetchNewsFromGemini(location, homeCountry);

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
    console.error("News API error", error);
    return NextResponse.json(
      { error: "Unable to fetch news." },
      { status: 500 }
    );
  }
}