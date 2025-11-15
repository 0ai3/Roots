import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId, type UpdateFilter, type ModifyResult } from "mongodb";
import { getDb } from "@/app/lib/mongo";

const COLLECTION = "profiles";
const MAX_SAVED_ATTRACTIONS = 40;

export type SavedAttraction = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  source: string;
  category?: string;
  description?: string;
};

type ProfileDoc = {
  _id?: ObjectId;
  userId?: string;
  profileId?: string;
  savedAttractions?: SavedAttraction[];
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

function sanitizeLabel(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 120) : "";
}

function sanitizeCategory(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase().slice(0, 40) : "";
}

function parseCoordinate(value: unknown, { min, max }: { min: number; max: number }) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  if (parsed < min || parsed > max) {
    return null;
  }
  return parsed;
}

type NormalizedPayload = {
  latitude: number;
  longitude: number;
  label: string;
  source: string;
  category?: string;
  description?: string;
};

function normalizePayload(payload: unknown): NormalizedPayload {
  const raw = (payload ?? {}) as Record<string, unknown>;
  const latitude = parseCoordinate(raw.latitude, { min: -90, max: 90 });
  const longitude = parseCoordinate(raw.longitude, { min: -180, max: 180 });
  if (latitude === null || longitude === null) {
    throw new Error("Latitude and longitude must be valid numbers.");
  }

  const label = sanitizeLabel(raw.label);
  const title = sanitizeLabel(raw.title);
  const source = sanitizeLabel(raw.source) || "live-map";
  const category = sanitizeCategory(raw.category);
  const description = sanitizeLabel(raw.description);

  return {
    latitude,
    longitude,
    label:
      label ||
      title ||
      `Pinned destination (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
    source,
    category: category || undefined,
    description: description || undefined,
  };
}

async function requireUserId() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("roots_user")?.value?.trim();
  if (!userId) {
    throw new Error("Not authenticated.");
  }
  return userId;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const limitParam = Number(request.nextUrl.searchParams.get("limit"));
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : MAX_SAVED_ATTRACTIONS;

    const db = await getDb();
    const filters = buildUserFilters(userId);
    const profile = await db
      .collection<ProfileDoc>(COLLECTION)
      .findOne({ $or: filters }, { projection: { _id: 0, savedAttractions: { $slice: -limit } } });

    const attractions = Array.isArray(profile?.savedAttractions)
      ? profile.savedAttractions
      : [];

    return NextResponse.json({ attractions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load saved attractions.";
    const status = message === "Not authenticated." ? 401 : 500;
    if (status === 500) {
      console.error("Profile attractions GET error", error);
    }
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const payload = normalizePayload(await request.json());
    const now = new Date();

    const attraction: SavedAttraction = {
      id: randomUUID(),
      label: payload.label,
      latitude: payload.latitude,
      longitude: payload.longitude,
      createdAt: now.toISOString(),
      source: payload.source,
      category: payload.category,
      description: payload.description,
    };

    const db = await getDb();
    const filters = buildUserFilters(userId);
    const updateDoc: UpdateFilter<ProfileDoc> = {
      $setOnInsert: { createdAt: now, userId },
      $set: { updatedAt: now },
      $push: {
        savedAttractions: {
          $each: [attraction],
          $slice: -MAX_SAVED_ATTRACTIONS,
        },
      },
      $unset: { profileId: "" },
    };

    const result = await db
      .collection<ProfileDoc>(COLLECTION)
      .findOneAndUpdate(
      { $or: filters },
      updateDoc,
      {
        upsert: true,
        projection: { _id: 0, savedAttractions: 1 },
        returnDocument: "after",
      }
    );

    const updatedProfile =
      (result as ModifyResult<ProfileDoc> | null)?.value ?? null;
    const attractions = Array.isArray(updatedProfile?.savedAttractions)
      ? updatedProfile.savedAttractions
      : [attraction];

    return NextResponse.json({ attraction, attractions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save destination.";
    const status = message === "Not authenticated." ? 401 : 400;
    if (status !== 401) {
      console.error("Profile attractions POST error", error);
    }
    return NextResponse.json({ error: message }, { status });
  }
}
