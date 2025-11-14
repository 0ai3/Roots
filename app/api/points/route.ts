import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongo";

export async function GET(request: NextRequest) {
  try {
    const profileId = request.nextUrl.searchParams.get("profileId")?.trim();
    if (!profileId) {
      return NextResponse.json(
        { error: "profileId is required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const doc = await db.collection("profiles").findOne(
      { profileId },
      {
        projection: {
          _id: 0,
          "experiencePoints.points": 1,
        },
      }
    );

    return NextResponse.json({ points: doc?.experiencePoints?.points ?? 0 });
  } catch (error) {
    console.error("Experience points GET error", error);
    return NextResponse.json(
      { error: "Unable to load experience points." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const profileId = String(payload?.profileId ?? "").trim();
    const pointsValue = Number(payload?.points);

    if (!profileId || !Number.isFinite(pointsValue)) {
      return NextResponse.json(
        { error: "profileId and numeric points are required." },
        { status: 400 }
      );
    }

    const normalized = Math.max(0, Math.round(pointsValue));
    const db = await getDb();
    const now = new Date();

    await db.collection("profiles").updateOne(
      { profileId },
      {
        $set: {
          "experiencePoints.points": normalized,
          "experiencePoints.updatedAt": now,
        },
        $setOnInsert: {
          experiencePoints: {
            points: normalized,
            createdAt: now,
            updatedAt: now,
          },
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ points: normalized });
  } catch (error) {
    console.error("Experience points POST error", error);
    return NextResponse.json(
      { error: "Unable to save experience points." },
      { status: 500 }
    );
  }
}
