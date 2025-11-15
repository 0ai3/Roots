import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/app/lib/mongo";
import { ObjectId } from "mongodb";

const FRIENDS_COLLECTION = "chat_friends";
const PROFILES_COLLECTION = "profiles";

async function getCurrentUserId() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("roots_user")?.value?.trim();
  return userId ?? null;
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

function sanitizeHandle(handle: unknown) {
  if (typeof handle !== "string") {
    return "";
  }
  return handle.trim();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 },
      );
    }

    const db = await getDb();
    const friendDocs = await db
      .collection(FRIENDS_COLLECTION)
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    if (friendDocs.length === 0) {
      return NextResponse.json({ friends: [] });
    }

    const friendIds = friendDocs.map((doc) => doc.friendId).filter(Boolean);
    const mapIds = friendIds
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));

    const profiles = await db
      .collection(PROFILES_COLLECTION)
      .find({
        $or: [
          { userId: { $in: friendIds } },
          { profileId: { $in: friendIds } },
          { _id: { $in: mapIds } },
        ],
      })
      .project({ userId: 1, profileId: 1, name: 1, socialHandle: 1, bio: 1 })
      .toArray();

    const profileMap = new Map<string, typeof profiles[number]>();
    profiles.forEach((profile) => {
      const resolvedId =
        (profile.userId as string | undefined) ??
        (profile.profileId as string | undefined) ??
        (profile._id?.toString() ?? "");
      if (resolvedId) {
        profileMap.set(resolvedId, profile);
      }
    });

    const friends = friendDocs.map((doc) => {
      const profile = profileMap.get(doc.friendId);
      return {
        id: doc.friendId,
        name: (profile?.name as string | undefined) ?? "Traveler",
        handle:
          (profile?.socialHandle as string | undefined) ??
          (doc.friendHandle as string | undefined) ??
          "",
        bio: (profile?.bio as string | undefined) ?? "",
        addedAt: doc.createdAt,
      };
    });

    return NextResponse.json({ friends });
  } catch (error) {
    console.error("Friends GET error:", error);
    return NextResponse.json(
      { error: "Unable to load your friends list." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 },
      );
    }

    const payload = await request.json().catch(() => ({}));
    const handleInput = sanitizeHandle(payload?.handle);
    const normalizedHandle = handleInput.replace(/^@+/, "").toLowerCase();

    if (!normalizedHandle) {
      return NextResponse.json(
        { error: "Please provide a valid social handle." },
        { status: 400 },
      );
    }

    const db = await getDb();

    const [currentProfile, targetProfile] = await Promise.all([
      db
        .collection(PROFILES_COLLECTION)
        .findOne({ $or: buildUserFilters(userId) }, { projection: { socialHandle: 1, name: 1 } }),
      db.collection(PROFILES_COLLECTION).findOne(
        {
          $or: [
            { socialHandleNormalized: normalizedHandle },
            { socialHandle: new RegExp(`^@?${escapeRegex(normalizedHandle)}$`, "i") },
          ],
        },
        { projection: { userId: 1, profileId: 1, socialHandle: 1, name: 1, bio: 1 } },
      ),
    ]);

    if (!targetProfile) {
      return NextResponse.json(
        { error: "No traveler found with that social handle." },
        { status: 404 },
      );
    }

    const targetUserId =
      (targetProfile.userId as string | undefined) ??
      (targetProfile.profileId as string | undefined) ??
      (targetProfile._id?.toString() ?? "");

    if (!targetUserId) {
      return NextResponse.json(
        { error: "The selected traveler cannot be added right now." },
        { status: 400 },
      );
    }

    if (targetUserId === userId) {
      return NextResponse.json(
        { error: "You cannot add yourself as a friend." },
        { status: 400 },
      );
    }

    const existing = await db
      .collection(FRIENDS_COLLECTION)
      .findOne({ userId, friendId: targetUserId });

    if (existing) {
      return NextResponse.json({
        friend: {
          id: targetUserId,
          name: (targetProfile.name as string | undefined) ?? "Traveler",
          handle:
            (targetProfile.socialHandle as string | undefined) ??
            `@${normalizedHandle}`,
          bio: (targetProfile.bio as string | undefined) ?? "",
        },
        alreadyAdded: true,
      });
    }

    const now = new Date();
    const currentHandle =
      (currentProfile?.socialHandle as string | undefined) ?? "@you";

    await db.collection(FRIENDS_COLLECTION).updateOne(
      { userId, friendId: targetUserId },
      {
        $setOnInsert: {
          userId,
          friendId: targetUserId,
          friendHandle:
            (targetProfile.socialHandle as string | undefined) ??
            `@${normalizedHandle}`,
          createdAt: now,
        },
      },
      { upsert: true },
    );

    await db.collection(FRIENDS_COLLECTION).updateOne(
      { userId: targetUserId, friendId: userId },
      {
        $setOnInsert: {
          userId: targetUserId,
          friendId: userId,
          friendHandle: currentHandle,
          createdAt: now,
        },
      },
      { upsert: true },
    );

    return NextResponse.json({
      friend: {
        id: targetUserId,
        name: (targetProfile.name as string | undefined) ?? "Traveler",
        handle:
          (targetProfile.socialHandle as string | undefined) ??
          `@${normalizedHandle}`,
        bio: (targetProfile.bio as string | undefined) ?? "",
      },
      alreadyAdded: false,
    });
  } catch (error) {
    console.error("Friends POST error:", error);
    return NextResponse.json(
      { error: "Unable to add that traveler right now." },
      { status: 500 },
    );
  }
}
