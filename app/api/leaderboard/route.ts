import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongo";

const MAX_ENTRIES = 25;

export async function GET() {
  try {
    const db = await getDb();
    const results = await db
      .collection("profiles")
      .aggregate([
        {
          $addFields: {
            resolvedPoints: {
              $ifNull: ["$points", "$experiencePoints.points", 0],
            },
            resolvedUserId: {
              $ifNull: [
                "$userId",
                "$profileId",
                {
                  $cond: [
                    { $ifNull: ["$_id", false] },
                    { $toString: "$_id" },
                    null,
                  ],
                },
              ],
            },
          },
        },
        {
          $match: {
            resolvedPoints: { $gte: 0 },
          },
        },
        {
          $project: {
            _id: 0,
            userId: "$resolvedUserId",
            name: {
              $cond: [
                { $gt: [{ $strLenCP: "$name" }, 0] },
                "$name",
                "$email",
              ],
            },
            points: "$resolvedPoints",
          },
        },
        { $sort: { points: -1, userId: 1 } },
        { $limit: MAX_ENTRIES },
      ])
      .toArray();

    const entries = results.map((entry, index) => ({
      userId: entry.userId,
      name: entry.name ?? "Roots Explorer",
      points: entry.points ?? 0,
      rank: index + 1,
    }));

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Leaderboard error", error);
    return NextResponse.json(
      { error: "Unable to load leaderboard." },
      { status: 500 }
    );
  }
}
