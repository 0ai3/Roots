import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/app/lib/mongo";

const AUTH_COOKIE_NAME = "roots_user";

type Role = "client" | "admin";

type StoredUser = {
  _id: ObjectId;
  email: string;
  role: Role;
  createdAt: Date;
  name?: string;
  points: number;
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const profiles = db.collection<StoredUser>("profiles");
    const user = await profiles.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      userId: userId,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      name: user.name ?? null,
      points: user.points,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
