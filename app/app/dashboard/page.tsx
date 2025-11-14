import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardContent from "../../components/DashboardContent";
import { getDb } from "../../lib/mongo";

export const dynamic = "force-dynamic";

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

type DashboardUser = {
  email: string;
  role: Role;
  createdAt: string;
  name?: string | null;
  points: number;
};

async function getCurrentUser(): Promise<DashboardUser | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!userId || !ObjectId.isValid(userId)) {
    return null;
  }

  const db = await getDb();
  const profiles = db.collection<StoredUser>("profiles");
  const user = await profiles.findOne({ _id: new ObjectId(userId) });

  if (!user) {
    return null;
  }

  return {
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    name: user.name ?? null,
    points: user.points,
  };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <DashboardContent user={user} />;
}
