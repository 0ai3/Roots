import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { getDb } from "@/app/lib/mongo";

const LOGS_COLLECTION = "travel_logs";

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
    
    // Get all logs for this user
    const logs = await db
      .collection(LOGS_COLLECTION)
      .find({ userId })
      .sort({ visitedAt: -1 })
      .toArray();

    // Calculate statistics
    const attractions = logs.filter(log => log.type === "attraction");
    const recipes = logs.filter(log => log.type === "recipe");
    
    // Count unique countries visited
    const countries = new Set(
      attractions
        .map(log => log.country)
        .filter(Boolean)
    );
    
    // Approximate world exploration percentage (195 countries in the world)
    const worldPercentage = Math.round((countries.size / 195) * 100);

    return NextResponse.json({
      logs: logs.map(log => ({
        ...log,
        _id: log._id.toString(),
      })),
      stats: {
        totalAttractions: attractions.length,
        totalRecipes: recipes.length,
        countriesVisited: countries.size,
        worldPercentage,
      },
    });
  } catch (error) {
    console.error("Logs GET error", error);
    return NextResponse.json(
      { error: "Unable to load travel logs." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("roots_user")?.value?.trim();
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const { type, title, description, country, city, rating, imageUrl, notes } = payload;

    if (!type || !title) {
      return NextResponse.json(
        { error: "Type and title are required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const now = new Date();

    const logEntry = {
      userId,
      type, // 'attraction' or 'recipe'
      title,
      description: description || "",
      country: country || "",
      city: city || "",
      rating: rating || null,
      imageUrl: imageUrl || "",
      notes: notes || "",
      visitedAt: now,
      createdAt: now,
    };

    const result = await db.collection(LOGS_COLLECTION).insertOne(logEntry);

    return NextResponse.json({
      success: true,
      logId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Logs POST error", error);
    return NextResponse.json(
      { error: "Unable to save travel log." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("roots_user")?.value?.trim();
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const logId = searchParams.get("id");

    if (!logId || !ObjectId.isValid(logId)) {
      return NextResponse.json(
        { error: "Invalid log ID." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection(LOGS_COLLECTION).deleteOne({
      _id: new ObjectId(logId),
      userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Log not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logs DELETE error", error);
    return NextResponse.json(
      { error: "Unable to delete travel log." },
      { status: 500 }
    );
  }
}