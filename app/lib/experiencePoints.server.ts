import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { getDb } from "./mongo";

const AUTH_COOKIE_NAME = "roots_user";

type ExperiencePointsResult = {
  userId: string | null;
  points: number;
};

type ExperiencePointsDocument = {
  userId?: string;
  points?: number;
  experiencePoints?: {
    points?: number;
  } | null;
};

export async function getExperiencePointsFromSession(): Promise<ExperiencePointsResult> {
  const cookieStore = await cookies();
  const cookieUserId = cookieStore.get(AUTH_COOKIE_NAME)?.value?.trim() ?? null;

  if (!cookieUserId || !ObjectId.isValid(cookieUserId)) {
    return { userId: null, points: 0 };
  }

  const db = await getDb();
  const filters = [
    { userId: cookieUserId },
    { _id: new ObjectId(cookieUserId) },
    { profileId: cookieUserId },
  ];
  let doc: ExperiencePointsDocument | null = null;
  for (const filter of filters) {
    const current = await db.collection("profiles").findOne<ExperiencePointsDocument>(filter, {
      projection: {
        _id: 0,
        userId: 1,
        points: 1,
        "experiencePoints.points": 1,
      },
    });
    if (current) {
      doc = current;
      break;
    }
  }

  const resolvedUserId = doc?.userId ?? cookieUserId;
  const points = Number(
    doc?.points ??
      doc?.experiencePoints?.points ??
      0
  );
  return { userId: resolvedUserId, points: Number.isFinite(points) ? points : 0 };
}
