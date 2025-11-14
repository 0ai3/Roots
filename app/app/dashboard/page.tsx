import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardContent from "../../components/DashboardContent";
import { getDb } from "../../lib/mongo";

const AUTH_COOKIE_NAME = "roots_user";

type Role = "client" | "admin";

type StoredUser = {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  salt: string;
  role: Role;
  createdAt: Date;
  name?: string;
};

type DashboardUser = {
  email: string;
  role: Role;
  createdAt: string;
  name?: string | null;
};

async function getCurrentUser(): Promise<DashboardUser | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!userId || !ObjectId.isValid(userId)) {
    return null;
  }

  const db = await getDb();
  const users = db.collection<StoredUser>("users");
  const user = await users.findOne({ _id: new ObjectId(userId) });

  if (!user) {
    return null;
  }

  return {
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    name: user.name ?? null,
  };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <DashboardContent user={user} />;
}
