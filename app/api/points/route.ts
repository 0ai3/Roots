import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { getDb } from "@/app/lib/mongo";

function buildUserFilters(userId: string) {
  const filters: Record<string, unknown>[] = [];
  if (ObjectId.isValid(userId)) {
    filters.push({ _id: new ObjectId(userId) });
  }
  filters.push({ userId });
  filters.push({ profileId: userId });
  return filters;
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
    const profiles = db.collection("profiles");
    const doc = await profiles.findOne(
      { $or: buildUserFilters(userId) },
      {
        projection: {
          _id: 0,
          points: 1,
        },
      }
    );

    return NextResponse.json({ points: doc?.points ?? 0 });
  } catch (error) {
    console.error("Points GET error", error);
    return NextResponse.json(
      { error: "Unable to load points." },
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
    const pointsValue = Number(payload?.points);

    if (!Number.isFinite(pointsValue)) {
      return NextResponse.json(
        { error: "Numeric points are required." },
        { status: 400 }
      );
    }

    const normalized = Math.max(0, Math.round(pointsValue));
    const db = await getDb();
    const profiles = db.collection("profiles");
    const existing = await profiles.findOne(
      { $or: buildUserFilters(userId) },
      { projection: { _id: 1 } }
    );

    if (!existing?._id) {
      return NextResponse.json(
        { error: "Profile not found." },
        { status: 404 }
      );
    }

    const now = new Date();

    await profiles.updateOne(
      { _id: existing._id },
      {
        $set: {
          userId,
          points: normalized,
          updatedAt: now,
        },
        $unset: { profileId: "" },
      }
    );

    return NextResponse.json({ points: normalized });
  } catch (error) {
    console.error("Points POST error", error);
    return NextResponse.json(
      { error: "Unable to save points." },
      { status: 500 }
    );
  }
}
