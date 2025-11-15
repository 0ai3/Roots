import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "roots";

if (!MONGODB_URI) {
  console.error("⚠️ MONGODB_URI is not defined in environment variables");
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not defined. Please add it to .env.local");
  }

  try {
    if (!cachedClient) {
      console.log("🔌 Connecting to MongoDB...");
      cachedClient = await MongoClient.connect(MONGODB_URI, {
        maxPoolSize: 10,
        minPoolSize: 2,
      });
      console.log("✅ MongoDB connected successfully");
    }

    cachedDb = cachedClient.db(MONGODB_DB);
    return cachedDb;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    cachedClient = null;
    cachedDb = null;
    throw error;
  }
}

export async function closeDb(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}
