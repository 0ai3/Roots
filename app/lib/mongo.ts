import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "roots";

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI environment variable in .env.local");
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  if (!cachedClient) {
    cachedClient = await MongoClient.connect(MONGODB_URI);
  }

  cachedDb = cachedClient.db(MONGODB_DB);
  return cachedDb;
}

export async function closeDb(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}
