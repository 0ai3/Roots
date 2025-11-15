// app/api/tasks/route.ts - Updated with better error handling and MIME type detection
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { getDb } from "@/app/lib/mongo";

const TASKS_COLLECTION = "verification_tasks";
const PROFILE_COLLECTION = "profiles";

function buildUserFilters(userId: string) {
  const filters: Record<string, unknown>[] = [];
  if (ObjectId.isValid(userId)) {
    filters.push({ _id: new ObjectId(userId) });
  }
  filters.push({ userId });
  filters.push({ profileId: userId });
  return filters;
}

// Detect MIME type from base64 data URL
function getMimeType(base64String: string): string {
  const match = base64String.match(/^data:([^;]+);base64,/);
  if (match && match[1]) {
    return match[1];
  }
  // Default to jpeg if not detected
  return "image/jpeg";
}

// Extract base64 data without the prefix
function getBase64Data(base64String: string): string {
  const parts = base64String.split(',');
  return parts.length > 1 ? parts[1] : base64String;
}

async function verifyWithGemini(
  taskType: "recipe" | "location",
  beforeImage: string,
  afterImage: string,
  context: { title: string; location?: string; country?: string }
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Gemini API key not configured");
    throw new Error("Gemini API key not configured");
  }

  const isRecipe = taskType === "recipe";
  
  const prompt = isRecipe
    ? `Analyze these two images to verify if someone cooked the recipe "${context.title}".
    
Image 1 is the BEFORE photo (ingredients or cooking process).
Image 2 is the AFTER photo (finished dish).

Respond with ONLY a JSON object:
{
  "verified": true or false,
  "confidence": 0-100 (percentage),
  "reasoning": "Brief explanation of why verified or not",
  "dishIdentified": "What dish you see in the after photo"
}

Verify true if:
- After photo shows a completed dish
- The dish appears to match "${context.title}" or similar cooking
- Photos show progression from preparation to finished meal

Return ONLY the JSON, no other text.`
    : `Analyze this image to verify the location "${context.location || context.title}".

Expected location: ${context.location || context.title}, ${context.country || ""}

Respond with ONLY a JSON object:
{
  "verified": true or false,
  "confidence": 0-100 (percentage),
  "reasoning": "Brief explanation",
  "locationIdentified": "What location/landmark you see"
}

Verify true if:
- Image shows recognizable landmarks or features from the specified location
- Scene matches the described location

Return ONLY the JSON, no other text.`;

  try {
    // Convert base64 images to proper format for Gemini
    const images = isRecipe ? [beforeImage, afterImage] : [afterImage];
    
    const parts = [
      { text: prompt },
      ...images.map(img => ({
        inline_data: {
          mime_type: getMimeType(img),
          data: getBase64Data(img)
        }
      }))
    ];

    console.log(`Calling Gemini Vision API for ${taskType} verification...`);
    console.log(`Number of images: ${images.length}`);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini Vision API error status:", response.status);
      console.error("Gemini Vision API error response:", errorData);
      throw new Error(`Gemini API returned ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    console.log("Gemini API response received");
    
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Gemini response text:", text);
    
    if (!text) {
      console.error("No text in Gemini response:", JSON.stringify(data));
      throw new Error("No response from Gemini API");
    }
    
    // Extract JSON
    let jsonText = text.trim();
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }
    
    const jsonStart = jsonText.indexOf('{');
    const jsonEnd = jsonText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
    }
    
    console.log("Extracted JSON:", jsonText);
    const result = JSON.parse(jsonText);
    console.log("Verification result:", result);
    
    return result;
  } catch (error) {
    console.error("Gemini verification error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "N/A");
    throw error;
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("roots_user")?.value?.trim();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const db = await getDb();
    const tasks = await db
      .collection(TASKS_COLLECTION)
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      tasks: tasks.map(task => ({
        ...task,
        _id: task._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Tasks GET error:", error);
    return NextResponse.json({ error: "Unable to load tasks." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("roots_user")?.value?.trim();
    if (!userId) {
      console.error("No user ID in cookie");
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const payload = await request.json();
    const { type, title, location, country, beforeImage, afterImage } = payload;

    console.log("Task submission:", { type, title, location, country, hasBeforeImage: !!beforeImage, hasAfterImage: !!afterImage });

    if (!type || !title) {
      return NextResponse.json(
        { error: "Type and title are required." },
        { status: 400 }
      );
    }

    if (type === "recipe" && (!beforeImage || !afterImage)) {
      return NextResponse.json(
        { error: "Both before and after images are required for recipe verification." },
        { status: 400 }
      );
    }

    if (type === "location" && !afterImage) {
      return NextResponse.json(
        { error: "Location photo is required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Verify with Gemini
    console.log(`Starting ${type} verification for: ${title}`);
    const verification = await verifyWithGemini(
      type,
      beforeImage || "",
      afterImage,
      { title, location, country }
    );

    const pointsEarned = verification.verified ? (type === "recipe" ? 10 : 15) : 0;

    // Create task record
    const task = {
      userId,
      type,
      title,
      location: location || "",
      country: country || "",
      beforeImage: beforeImage || "",
      afterImage,
      verification,
      pointsEarned,
      createdAt: new Date(),
    };

    const result = await db.collection(TASKS_COLLECTION).insertOne(task);
    console.log("Task created with ID:", result.insertedId.toString());

    // Update user points if verified
    if (verification.verified && pointsEarned > 0) {
      console.log(`Updating user points: +${pointsEarned}`);
      const filters = buildUserFilters(userId);
      for (const filter of filters) {
        const updated = await db.collection(PROFILE_COLLECTION).findOneAndUpdate(
          filter,
          { $inc: { points: pointsEarned } },
          { returnDocument: "after" }
        );
        if (updated && updated.value) {
          console.log("Points updated successfully");
          break;
        }
      }
    }

    return NextResponse.json({
      success: true,
      taskId: result.insertedId.toString(),
      verification,
      pointsEarned,
    });
  } catch (error) {
    console.error("Tasks POST error:", error);
    console.error("Error details:", error instanceof Error ? error.message : "Unknown error");
    console.error("Error stack:", error instanceof Error ? error.stack : "N/A");
    return NextResponse.json(
      { 
        error: "Unable to verify task. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("roots_user")?.value?.trim();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("id");

    if (!taskId || !ObjectId.isValid(taskId)) {
      return NextResponse.json({ error: "Invalid task ID." }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection(TASKS_COLLECTION).deleteOne({
      _id: new ObjectId(taskId),
      userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tasks DELETE error:", error);
    return NextResponse.json({ error: "Unable to delete task." }, { status: 500 });
  }
}