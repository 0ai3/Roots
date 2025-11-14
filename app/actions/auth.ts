"use server";

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDb } from "../lib/mongo";

type Role = "client" | "admin";


type ProfileDoc = {
  _id?: ObjectId;
  userId?: string;
  profileId?: string; // legacy support
  email: string;
  passwordHash: string;
  salt: string;
  role: Role;
  name: string;
  location: string;
  favoriteMuseums: string;
  favoriteRecipes: string;
  bio: string;
  socialHandle: string;
  createdAt: Date;
  updatedAt: Date;
  points: number;
};

const MIN_PASSWORD_LENGTH = 6;
const DEFAULT_ROLE: Role = "client";
const AUTH_COOKIE_NAME = "roots_user";
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const PROFILES_COLLECTION = "profiles";

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

function buildDefaultName(email: string) {
  return email.split("@")[0]?.replace(/\W+/g, " ").trim() || "Roots Explorer";
}

async function getProfilesCollection() {
  const db = await getDb();
  return db.collection<ProfileDoc>(PROFILES_COLLECTION);
}

async function ensurePoints(user: ProfileDoc & { _id: ObjectId }) {
  if (typeof user.points === "number") {
    return;
  }
  const profiles = await getProfilesCollection();
  const now = new Date();
  await profiles.updateOne(
    { _id: user._id },
    {
      $set: {
        points: 0,
        updatedAt: now,
      },
    }
  );
}

export async function checkEmailAction(email: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error("Email is required");
  }

  const profiles = await getProfilesCollection();
  const existing = await profiles.findOne(
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

  const profiles = await getProfilesCollection();
  const user = await profiles.findOne({ email: normalizedEmail });

  if (!user) {
    return { ok: false, message: "Account not found. Please register." };
  }


  if (!user.salt || !user.passwordHash) {
    // Delete corrupted user so they can register again
    await profiles.deleteOne({ _id: user._id });
    return { ok: false, message: "Account data was corrupted. Please register again." };
  }

  const validPassword = passwordsMatch(password, user.salt, user.passwordHash);

  if (!validPassword) {
    return { ok: false, message: "Incorrect password. Try again." };
  }

  if (!user._id) {
    return { ok: false, message: "Unable to locate your account id." };
  }

  const userIdValue = user.userId ?? user.profileId ?? user._id.toString();
  if (!user.userId || user.userId !== userIdValue || user.profileId) {
    const updateOperators: Record<string, Record<string, unknown>> = {
      $set: { userId: userIdValue },
    };
    if (user.profileId) {
      updateOperators.$unset = { profileId: "" };
    }
    await profiles.updateOne({ _id: user._id }, updateOperators);
  }
  await ensurePoints({ ...user, _id: user._id });

  const userId = userIdValue;
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

  const profiles = await getProfilesCollection();
  const existing = await profiles.findOne(
    { email: normalizedEmail },
    { projection: { _id: 1 } }
  );

  if (existing) {
    return { ok: false, message: "Email already registered. Please login." };
  }

  const { hash, salt } = createPasswordHash(password);
  const now = new Date();
  const profileObjectId = new ObjectId();
  const userIdValue = profileObjectId.toString();

  const profileDoc: ProfileDoc = {
    _id: profileObjectId,
    userId: userIdValue,
    email: normalizedEmail,
    passwordHash: hash,
    salt,
    role: DEFAULT_ROLE,
    name: buildDefaultName(normalizedEmail),
    location: "",
    favoriteMuseums: "",
    favoriteRecipes: "",
    bio: "",
    socialHandle: "",
    createdAt: now,
    updatedAt: now,
    points: 0,
  };

  await profiles.insertOne(profileDoc);
  const userId = userIdValue;

  await persistSession(userId);

  return {
    ok: true,
    message: "Account created and ready to use.",
    email: profileDoc.email,
    role: profileDoc.role,
    userId,
  };
}
