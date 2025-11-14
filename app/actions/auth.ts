"use server";

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { getDb } from "../lib/mongo";

type UserDoc = {
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: Date;
};

const MIN_PASSWORD_LENGTH = 6;

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
};

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

  return { ok: true, message: "You're logged in." };
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

  await users.insertOne({
    email: normalizedEmail,
    passwordHash: hash,
    salt,
    createdAt: new Date(),
  });

  return { ok: true, message: "Account created and ready to use." };
}
