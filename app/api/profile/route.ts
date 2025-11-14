import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongo";

const COLLECTION = "profiles";

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: NextRequest) {
  try {
    const profileId = request.nextUrl.searchParams.get("profileId");
    if (!profileId) {
      return NextResponse.json(
        { error: "profileId is required." },
        { status: 400 }
      );
    }
    const db = await getDb();
    const profile = await db
      .collection(COLLECTION)
      .findOne({ profileId }, { projection: { _id: 0 } });
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile GET error", error);
    return NextResponse.json(
      { error: "Unable to load profile details." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const profileId = sanitize(payload?.profileId);
    const name = sanitize(payload?.name);
    const email = sanitize(payload?.email);
    const location = sanitize(payload?.location);
    const favoriteMuseums = sanitize(payload?.favoriteMuseums);
    const favoriteRecipes = sanitize(payload?.favoriteRecipes);
    const bio = sanitize(payload?.bio);
    const socialHandle = sanitize(payload?.socialHandle);

    if (!profileId || !name || !email) {
      return NextResponse.json(
        { error: "Profile ID, name, and email are required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const now = new Date();
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { profileId },
      {
        $set: {
          profileId,
          name,
          email,
          location,
          favoriteMuseums,
          favoriteRecipes,
          bio,
          socialHandle,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true, returnDocument: "after", projection: { _id: 0 } }
    );

    return NextResponse.json({ profile: result?.value ?? null });
  } catch (error) {
    console.error("Profile POST error", error);
    return NextResponse.json(
      { error: "Unable to save profile details." },
      { status: 500 }
    );
  }
}
