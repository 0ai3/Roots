"use server";

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDb } from "../lib/mongo";

type Role = "client" | "admin";

type UserDoc = {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  salt: string;
  role: Role;
  createdAt: Date;
};

const MIN_PASSWORD_LENGTH = 6;
const DEFAULT_ROLE: Role = "client";
const AUTH_COOKIE_NAME = "roots_user";
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createPasswordHash(password: string, salt = randomBytes(16).toString("hex")) {
  const derivedKey = scryptSync(password, salt, 64);
  return { salt, hash: derivedKey.toString("hex") };
}

function passwordsMatch(password: string, salt: string, storedHash: string) {
  const derivedKey = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, "hex");
  if (storedBuffer.length !== derivedKey.length) {
    return false;
  }
  return timingSafeEqual(storedBuffer, derivedKey);
}

async function getUsersCollection() {
  const db = await getDb();
  return db.collection<UserDoc>("users");
}

async function ensureUserDocuments(
  userObjectId: ObjectId,
  doc: { email: string; role: Role }
) {
  const db = await getDb();
  const now = new Date();
  const userId = userObjectId.toString();
  const defaultName =
    doc.email.split("@")[0]?.replace(/\W+/g, " ").trim() || "Roots Explorer";

  await db.collection("user").updateOne(
    { userId },
    {
      $setOnInsert: {
        _id: userObjectId,
        userId,
        name: defaultName,
        location: "",
        favoriteMuseums: "",
        favoriteRecipes: "",
        bio: "",
        socialHandle: "",
        createdAt: now,
        experiencePoints: {
          points: 0,
          createdAt: now,
          updatedAt: now,
        },
      },
      $set: {
        email: doc.email,
        role: doc.role,
        name: defaultName,
        updatedAt: now,
      },
    },
    { upsert: true }
  );
  await db.collection("users").updateOne(
    { userId, experiencePoints: { $exists: false } },
    {
      $set: {
        experiencePoints: {
          points: 0,
          createdAt: now,
          updatedAt: now,
        },
      },
    }
  );
}

export async function checkEmailAction(email: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error("Email is required");
  }

  const users = await getUsersCollection();
  const existing = await users.findOne(
    { email: normalizedEmail },
    { projection: { _id: 1 } }
  );

  return { exists: Boolean(existing) };
}

type AuthResponse = {
  ok: boolean;
  message: string;
  email?: string;
  role?: Role;
  userId?: string;
};

async function persistSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
}

export async function loginAction(
  email: string,
  password: string
): Promise<AuthResponse> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    return { ok: false, message: "Email and password are required." };
  }

  const users = await getUsersCollection();
  const user = await users.findOne({ email: normalizedEmail });

  if (!user) {
    return { ok: false, message: "Account not found. Please register." };
  }

  const validPassword = passwordsMatch(password, user.salt, user.passwordHash);

  if (!validPassword) {
    return { ok: false, message: "Incorrect password. Try again." };
  }

  if (!user._id) {
    return { ok: false, message: "Unable to locate your account id." };
  }

  await ensureUserDocuments(user._id, {
    email: user.email,
    role: user.role ?? DEFAULT_ROLE,
  });

  const userId = user._id.toString();
  await persistSession(userId);

  return {
    ok: true,
    message: "You're logged in.",
    email: user.email,
    role: user.role ?? DEFAULT_ROLE,
    userId,
  };
}

export async function registerAction(
  email: string,
  password: string
): Promise<AuthResponse> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    return { ok: false, message: "Email and password are required." };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
    };
  }

  const users = await getUsersCollection();
  const existing = await users.findOne(
    { email: normalizedEmail },
    { projection: { _id: 1 } }
  );

  if (existing) {
    return { ok: false, message: "Email already registered. Please login." };
  }

  const { hash, salt } = createPasswordHash(password);

  const userDoc: UserDoc = {
    email: normalizedEmail,
    passwordHash: hash,
    salt,
    role: DEFAULT_ROLE,
    createdAt: new Date(),
  };

  const insertResult = await users.insertOne(userDoc);
  await ensureUserDocuments(insertResult.insertedId, userDoc);
  const userId = insertResult.insertedId.toString();

  await persistSession(userId);

  return {
    ok: true,
    message: "Account created and ready to use.",
    email: userDoc.email,
    role: userDoc.role,
    userId,
  };
}
