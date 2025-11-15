import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/app/lib/mongo";

const COLLECTION = "favoriteAttractions";

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
    const favorites = await db
      .collection(COLLECTION)
      .find({ userId })
      .project({ _id: 0, attractionId: 1, attraction: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("Get favorites error:", error);
    return NextResponse.json(
      { error: "Unable to fetch favorites." },
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

    const { attraction } = await request.json();
    
    if (!attraction || !attraction.id) {
      return NextResponse.json(
        { error: "Attraction data is required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const now = new Date();

    // Check if already favorited
    const existing = await db.collection(COLLECTION).findOne({
      userId,
      attractionId: attraction.id
    });

    if (existing) {
      return NextResponse.json(
        { error: "Attraction already in favorites." },
        { status: 400 }
      );
    }

    await db.collection(COLLECTION).insertOne({
      userId,
      attractionId: attraction.id,
      attraction,
      createdAt: now
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Add favorite error:", error);
    return NextResponse.json(
      { error: "Unable to add favorite." },
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

    const { attractionId } = await request.json();
    
    if (!attractionId) {
      return NextResponse.json(
        { error: "Attraction ID is required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    await db.collection(COLLECTION).deleteOne({
      userId,
      attractionId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove favorite error:", error);
    return NextResponse.json(
      { error: "Unable to remove favorite." },
      { status: 500 }
    );
  }
}
