import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/app/lib/mongo";

const FRIENDS_COLLECTION = "chat_friends";
const MESSAGES_COLLECTION = "chat_messages";

async function getCurrentUserId() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("roots_user")?.value?.trim();
  return userId ?? null;
}

function sanitizeText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

async function ensureFriendship(db: Awaited<ReturnType<typeof getDb>>, userId: string, friendId: string) {
  const doc = await db
    .collection(FRIENDS_COLLECTION)
    .findOne({ userId, friendId });
  return Boolean(doc);
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 },
      );
    }

    const friendId = request.nextUrl.searchParams.get("friendId")?.trim();
    if (!friendId) {
      return NextResponse.json(
        { error: "Missing friendId." },
        { status: 400 },
      );
    }

    const db = await getDb();
    const allowed = await ensureFriendship(db, userId, friendId);
    if (!allowed) {
      return NextResponse.json(
        { error: "You are not connected to that traveler." },
        { status: 403 },
      );
    }

    const participants = [userId, friendId].sort();

    const messages = await db
      .collection(MESSAGES_COLLECTION)
      .find({ participants })
      .sort({ createdAt: 1 })
      .limit(500)
      .toArray();

    return NextResponse.json({
      messages: messages.map((message) => ({
        id: message._id?.toString() ?? `${message.createdAt.getTime()}`,
        senderId: message.senderId,
        recipientId: message.recipientId,
        body: message.body,
        createdAt: message.createdAt,
      })),
    });
  } catch (error) {
    console.error("Messages GET error:", error);
    return NextResponse.json(
      { error: "Unable to load messages right now." },
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
    const friendId = sanitizeText(payload?.friendId);
    const messageText = sanitizeText(payload?.message);

    if (!friendId) {
      return NextResponse.json(
        { error: "friendId is required." },
        { status: 400 },
      );
    }

    if (!messageText) {
      return NextResponse.json(
        { error: "Message cannot be empty." },
        { status: 400 },
      );
    }

    const db = await getDb();
    const allowed = await ensureFriendship(db, userId, friendId);
    if (!allowed) {
      return NextResponse.json(
        { error: "You are not connected to that traveler." },
        { status: 403 },
      );
    }

    const participants = [userId, friendId].sort();
    const now = new Date();

    const { insertedId } = await db.collection(MESSAGES_COLLECTION).insertOne({
      senderId: userId,
      recipientId: friendId,
      participants,
      body: messageText,
      createdAt: now,
    });

    return NextResponse.json({
      message: {
        id: insertedId.toString(),
        senderId: userId,
        recipientId: friendId,
        body: messageText,
        createdAt: now,
      },
    });
  } catch (error) {
    console.error("Messages POST error:", error);
    return NextResponse.json(
      { error: "Unable to send message right now." },
      { status: 500 },
    );
  }
}
