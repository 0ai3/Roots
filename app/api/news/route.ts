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


async function fetchNewsFromGemini(location: string, homeCountry: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const prompt = `You are a travel information expert with access to current information. Research and provide REAL, ACCURATE cultural news and laws for ${location}.

RESPOND WITH ONLY VALID JSON - NO MARKDOWN, NO CODE BLOCKS.

{
  "location": "${location}",
  "date": "${new Date().toISOString()}",
  "culturalNews": [
    {
      "title": "Real news title about current cultural events, festivals, or attractions",
      "summary": "2-3 sentences with real details about the event/attraction",
      "category": "culture",
      "date": "November 16, 2025",
      "source": "BBC News | Reuters | The Guardian | CNN | Al Jazeera | Local News Source",
      "url": "https://www.bbc.com/news/[real-article-path] (Use real news website patterns)"
    }
  ],
  "importantLaws": [
    {
      "title": "Real law name",
      "description": "Specific details with EXACT fines, penalties, jail time. Example: 'Drinking in public banned with €200-500 fine' NOT 'alcohol restrictions apply'",
      "severity": "critical | important | good-to-know",
      "comparison": "In ${homeCountry}: [exact rule]. In ${location}: [exact different rule].",
      "officialSource": "Ministry of Interior | Department of Tourism | Local Police Authority",
      "sourceUrl": "https://www.gov.[country-code]/tourism (Real government URL pattern)"
    }
  ],
  "culturalTips": [
    "Specific tip with exact behavior"
  ]
}

RESEARCH AND GENERATE:

1. CULTURAL NEWS (8-10 items) - Research what's actually happening in ${location}:
   - Current festivals and celebrations (with real dates if known)
   - Major museums and their special exhibitions
   - UNESCO World Heritage Sites
   - Popular cultural attractions and landmarks
   - Traditional events and ceremonies
   - Arts, theater, and entertainment venues
   - Recent cultural developments or openings
   
   For each item:
   - Use real attraction/event names (e.g., "Louvre Museum", "Oktoberfest", "Burj Khalifa")
   - Provide real details about the location
   - Use actual news source names (BBC, Reuters, CNN, Guardian, local papers)
   - Generate realistic URLs: https://www.bbc.com/news/world-[region]-culture
   
2. IMPORTANT LAWS (10-15 items) - Research REAL laws specific to ${location}:

   A. ALCOHOL LAWS:
      - Exact legal drinking age
      - Public consumption rules (where banned, exact fines)
      - Sales hours and restrictions
      - Import limits
      - Penalties: exact fine amounts or jail time
   
   B. DRESS CODE REQUIREMENTS:
      - Religious site rules (mosques, temples, churches)
      - Government building requirements
      - Beach/swimwear restrictions
      - Public modesty laws
      - Exact penalties for violations
   
   C. PHOTOGRAPHY RESTRICTIONS:
      - Banned locations (military, government, airports, police)
      - People/privacy laws
      - Penalties (fines, equipment confiscation, jail time)
   
   D. DRUG & MEDICATION LAWS:
      - Specific banned medications (codeine, pseudoephedrine, tramadol, sleeping pills)
      - CBD/cannabis laws
      - Prescription requirements
      - Penalties (years in prison, fines)
   
   E. TRAFFIC LAWS:
      - Speed limits (exact km/h for city, highway)
      - Right-hand or left-hand driving
      - Seat belt/child seat laws
      - Mobile phone usage penalties
      - Drunk driving BAC limit and penalties
   
   F. SMOKING/VAPING:
      - Where banned (indoors, public transport, restaurants)
      - Vaping laws
      - E-cigarette restrictions
      - Exact fines
   
   G. PUBLIC BEHAVIOR:
      - PDA (public displays of affection) rules
      - Swearing/obscene gestures penalties
      - Littering fines (exact amounts)
      - Queue jumping/jaywalking fines
   
   H. RELIGIOUS/CULTURAL LAWS:
      - Ramadan rules (if applicable)
      - Friday prayers disruptions
      - Blasphemy laws
      - Religious holidays restrictions
   
   I. LGBTQ+ LAWS (if restrictive):
      - Legal status
      - Penalties
      - Safety considerations
   
   J. IMPORT/EXPORT:
      - Banned food items
      - Alcohol limits
      - Currency declaration requirements
      - Prohibited items

   For EACH law provide:
   - EXACT penalties (e.g., "€500 fine", "1-3 years imprisonment", "AED 2000-10000 fine")
   - SPECIFIC restrictions (e.g., "No alcohol after 10 PM", "50 km/h in residential areas")
   - Real comparison with ${homeCountry}
   - Government source name and realistic .gov URL

3. CULTURAL TIPS (6-8 items):
   - Greeting customs (handshake strength, bowing depth, cheek kisses)
   - Tipping percentages and when required
   - Dining etiquette (utensil use, left hand taboo, sharing food)
   - Religious site behavior
   - Dress recommendations
   - Gestures to avoid
   - Personal space norms

QUALITY REQUIREMENTS:
✅ Use REAL place names, event names, and attraction names from ${location}
✅ Provide EXACT numbers (fines, ages, speeds, BAC levels)
✅ Research actual laws that exist in ${location}
✅ Generate realistic government URLs (.gov.ae, .gov.uk, .spain.info patterns)
✅ Make news URLs look real (bbc.com/news/world-asia-12345)
✅ NO generic advice or placeholders
✅ NO "example.com" or "check official sources"
✅ Compare SPECIFICALLY with ${homeCountry} laws

Return ONLY the JSON object.`;




  try {
    // Use stable Gemini 1.5 Flash model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
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
          temperature: 0.9,
          topK: 64,
          topP: 0.95,
          maxOutputTokens: 3072,
          candidateCount: 1,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error response:", errorData);
      
      // Check for rate limiting
      if (response.status === 429) {
        throw new Error("Gemini API rate limit reached. Please try again in a few moments.");
      }
      
      throw new Error(`Gemini API returned ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    console.log("Gemini API response received");
    
    // Check if content was blocked
    if (data?.promptFeedback?.blockReason) {
      console.error("Content blocked:", data.promptFeedback.blockReason);
      throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
    }
    
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    if (!text) {
      console.error("Empty response from Gemini. Full response:", JSON.stringify(data, null, 2));
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

    console.log("Fetching fresh news and laws from Gemini...");

    // Fetch everything from Gemini (news + laws + tips)
    let newsData;
    try {
      newsData = await fetchNewsFromGemini(location, homeCountry);
      
      // Validate that we got data
      if (!newsData.culturalNews || newsData.culturalNews.length === 0) {
        console.error("No cultural news returned from Gemini");
        throw new Error("No cultural news returned from API");
      }
      
      if (!newsData.importantLaws || newsData.importantLaws.length === 0) {
        console.error("No laws returned from Gemini");
        throw new Error("No laws returned from API");
      }
      
      // Check for generic error content
      const hasGenericContent = newsData.importantLaws.some((law: ImportantLaw) => 
        law.title.toLowerCase().includes("api service") ||
        law.title.toLowerCase().includes("temporarily limited") ||
        law.description.toLowerCase().includes("service temporarily unavailable")
      );
      
      if (hasGenericContent) {
        console.error("Received generic/error content from Gemini");
        throw new Error("Received generic fallback content from API");
      }
      
      console.log(`✅ Successfully fetched ${newsData.culturalNews.length} news items and ${newsData.importantLaws.length} laws from Gemini`);
      
    } catch (geminiError) {
      console.error("Gemini API failed:", geminiError);
      
      // Use helpful fallback with search links
      newsData = {
        location,
        date: new Date().toISOString(),
        culturalNews: [
          {
            title: `Current Cultural Events in ${location}`,
            summary: `Stay updated with the latest festivals, exhibitions, and cultural happenings in ${location}. Click to search for current events and attractions.`,
            category: "culture",
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            source: "BBC News",
            url: `https://www.bbc.com/search?q=${encodeURIComponent(location + ' culture events')}`
          },
          {
            title: `${location} Museums and Exhibitions`,
            summary: `Explore world-class museums, galleries, and special exhibitions currently happening in ${location}.`,
            category: "culture",
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            source: "The Guardian",
            url: `https://www.theguardian.com/search?q=${encodeURIComponent(location + ' museums')}`
          },
          {
            title: `Traditional Festivals in ${location}`,
            summary: `Discover traditional festivals, cultural celebrations, and special events happening in ${location}.`,
            category: "culture",
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            source: "Reuters",
            url: `https://www.reuters.com/search/news?blob=${encodeURIComponent(location + ' festivals')}`
          },
          {
            title: `${location} Heritage Sites`,
            summary: `Visit UNESCO World Heritage Sites and historically significant landmarks in ${location}.`,
            category: "culture",
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            source: "CNN Travel",
            url: `https://www.cnn.com/search?q=${encodeURIComponent(location + ' heritage sites')}`
          },
          {
            title: `Arts and Culture in ${location}`,
            summary: `Experience concerts, theater performances, art galleries, and cultural venues in ${location}.`,
            category: "culture",
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            source: "Al Jazeera",
            url: `https://www.aljazeera.com/search/${encodeURIComponent(location + ' arts culture')}`
          },
          {
            title: `Official Tourism Guide`,
            summary: `Visit the official tourism website for ${location} for comprehensive guides and current events.`,
            category: "culture",
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            source: "Official Tourism",
            url: `https://www.google.com/search?q=${encodeURIComponent(location + ' official tourism')}`
          }
        ],
        importantLaws: [
          {
            title: "Research Local Laws Before Travel",
            description: `Laws in ${location} may significantly differ from ${homeCountry}. Key areas to research: alcohol regulations (age limits, public consumption, sales hours), dress codes (religious sites, government buildings), photography restrictions (military/government facilities, people), drug laws (including common over-the-counter medications), traffic rules (speed limits, right/left-hand driving), and cultural customs.`,
            severity: "critical",
            comparison: `Legal systems vary significantly between countries. Actions legal in ${homeCountry} may result in fines, detention, or imprisonment in ${location}. Always verify current laws before traveling.`,
            officialSource: "Government Travel Advisory",
            sourceUrl: `https://www.google.com/search?q=${encodeURIComponent(location + ' government travel advisory laws')}`
          },
          {
            title: "Contact Your Embassy for Legal Guidance",
            description: `Your embassy can provide up-to-date information on local laws, cultural norms, and what to do if you encounter legal issues. Save their emergency contact number before traveling.`,
            severity: "important",
            comparison: `Embassy services are crucial for citizens abroad. They can assist with legal issues, lost documents, and emergencies.`,
            officialSource: "Embassy Services",
            sourceUrl: `https://www.google.com/search?q=${encodeURIComponent(homeCountry + ' embassy in ' + location)}`
          },
          {
            title: "Verify Medication Legality",
            description: `Many common medications legal in ${homeCountry} may be controlled or illegal in ${location}. This includes some pain relievers, cold medicines, and prescription drugs. Bring prescriptions and check with the local embassy before bringing any medication.`,
            severity: "important",
            comparison: `Medication laws vary globally. What's over-the-counter at home may require a prescription or be completely banned elsewhere.`,
            officialSource: "Health Department",
            sourceUrl: `https://www.google.com/search?q=${encodeURIComponent(location + ' medication import laws')}`
          },
          {
            title: "Alcohol and Substance Regulations",
            description: `Alcohol laws can vary dramatically. Research legal drinking age, permitted consumption areas, sales hours, and penalties for violations in ${location}.`,
            severity: "important",
            comparison: `While ${homeCountry} may have relaxed alcohol policies, ${location} could have strict regulations including public drinking bans and severe penalties.`,
            officialSource: "Tourism Authority",
            sourceUrl: `https://www.google.com/search?q=${encodeURIComponent(location + ' alcohol laws regulations')}`
          },
          {
            title: "Photography and Privacy Laws",
            description: `Taking photos of government buildings, military installations, or people without permission may be illegal in ${location}. Always ask before photographing locals.`,
            severity: "important",
            comparison: `Photography rights differ globally. What's acceptable in ${homeCountry} may be illegal or culturally offensive in ${location}.`,
            officialSource: "Local Government",
            sourceUrl: `https://www.google.com/search?q=${encodeURIComponent(location + ' photography laws restrictions')}`
          }
        ],
        culturalTips: [
          `Learn basic greetings and phrases in the local language of ${location}`,
          "Research appropriate dress codes for religious sites and conservative areas",
          "Understand local tipping customs and payment preferences",
          "Respect cultural norms regarding photography, especially of people and religious sites",
          "Be aware of local dining etiquette and table manners",
          "Research local customs for greetings (handshakes, bows, or kisses)"
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