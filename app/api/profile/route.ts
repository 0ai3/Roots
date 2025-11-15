import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { getDb } from "@/app/lib/mongo";

const COLLECTION = "profiles";

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function buildUserFilters(userId: string) {
  const filters: Record<string, unknown>[] = [];
  if (ObjectId.isValid(userId)) {
    filters.push({ _id: new ObjectId(userId) });
  }
  filters.push({ userId });
  filters.push({ profileId: userId });
  return filters;
}

async function validateCountry(country: string): Promise<boolean> {
  if (!country || country.trim().length === 0) {
    return true; // Empty is okay
  }

  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=false`
    );

    if (response.ok) {
      const data = await response.json();
      return data.length > 0;
    }
    return false;
  } catch (error) {
    console.error("Country validation error", error);
    return false;
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
    const projection = {
      _id: 0,
      userId: 1,
      profileId: 1,
      email: 1,
      name: 1,
      location: 1,
      homeCountry: 1,
      favoriteMuseums: 1,
      favoriteRecipes: 1,
      bio: 1,
      socialHandle: 1,
      role: 1,
      points: 1,
      createdAt: 1,
      updatedAt: 1,
    };
    const filters = buildUserFilters(userId);
    const profile = await db
      .collection(COLLECTION)
      .findOne({ $or: filters }, { projection });
    if (profile) {
      const resolvedUserId =
        (profile.userId as string | undefined) ??
        (profile.profileId as string | undefined) ??
        userId;
      profile.userId = resolvedUserId;
      delete profile.profileId;
    }
    return NextResponse.json({ profile: profile ?? null });
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
    const cookieStore = await cookies();
    const userId = cookieStore.get("roots_user")?.value?.trim();
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const name = sanitize(payload?.name);
    const email = sanitize(payload?.email);
    const location = sanitize(payload?.location);
    const homeCountry = sanitize(payload?.homeCountry);
    const favoriteMuseums = sanitize(payload?.favoriteMuseums);
    const favoriteRecipes = sanitize(payload?.favoriteRecipes);
    const bio = sanitize(payload?.bio);
    const rawHandle = sanitize(payload?.socialHandle);
    const normalizedHandle = rawHandle.replace(/^@+/, "").replace(/\s+/g, "");
    const socialHandle = normalizedHandle
      ? `@${normalizedHandle}`
      : "";
    const socialHandleNormalized = normalizedHandle.toLowerCase();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    // Validate home country if provided
    if (homeCountry && homeCountry.length > 0) {
      const isValidCountry = await validateCountry(homeCountry);
      if (!isValidCountry) {
        return NextResponse.json(
          {
            error: `"${homeCountry}" is not a valid country name. Please check spelling.`,
          },
          { status: 400 }
        );
      }
    }

    const db = await getDb();
    const now = new Date();
    const filters = buildUserFilters(userId);
    const updateDoc: {
      $set: Record<string, unknown>;
      $setOnInsert: Record<string, unknown>;
      $unset?: Record<string, unknown>;
    } = {
      $set: {
        userId,
        name,
        email,
        location,
        homeCountry,
        favoriteMuseums,
        favoriteRecipes,
        bio,
        socialHandle,
        socialHandleNormalized,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    };
    updateDoc.$unset = { profileId: "" };
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { $or: filters },
      updateDoc,
      {
        returnDocument: "after",
        projection: { _id: 0 },
        upsert: true,
      }
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
