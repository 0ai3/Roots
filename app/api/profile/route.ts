import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { getDb } from "@/app/lib/mongo";

const COLLECTION = "profiles";

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function buildUserFilters(userId: string) {
  const filters: Record<string, unknown>[] = [];
  if (ObjectId.isValid(userId)) {
    filters.push({ _id: new ObjectId(userId) });
  }
  filters.push({ userId });
  filters.push({ profileId: userId });
  return filters;
}

async function validateCountry(country: string): Promise<boolean> {
  if (!country || country.trim().length === 0) {
    return true; // Empty is okay
  }

  // List of common country names for basic validation
  const commonCountries = [
    'afghanistan', 'albania', 'algeria', 'andorra', 'angola', 'argentina', 'armenia', 'australia', 'austria', 'azerbaijan',
    'bahamas', 'bahrain', 'bangladesh', 'barbados', 'belarus', 'belgium', 'belize', 'benin', 'bhutan', 'bolivia',
    'bosnia', 'botswana', 'brazil', 'brunei', 'bulgaria', 'burkina', 'burundi', 'cambodia', 'cameroon', 'canada',
    'cape verde', 'central african', 'chad', 'chile', 'china', 'colombia', 'comoros', 'congo', 'costa rica', 'croatia',
    'cuba', 'cyprus', 'czech', 'denmark', 'djibouti', 'dominica', 'dominican', 'ecuador', 'egypt', 'el salvador',
    'equatorial guinea', 'eritrea', 'estonia', 'ethiopia', 'fiji', 'finland', 'france', 'gabon', 'gambia', 'georgia',
    'germany', 'ghana', 'greece', 'grenada', 'guatemala', 'guinea', 'guyana', 'haiti', 'honduras', 'hungary',
    'iceland', 'india', 'indonesia', 'iran', 'iraq', 'ireland', 'israel', 'italy', 'jamaica', 'japan',
    'jordan', 'kazakhstan', 'kenya', 'kiribati', 'korea', 'kosovo', 'kuwait', 'kyrgyzstan', 'laos', 'latvia',
    'lebanon', 'lesotho', 'liberia', 'libya', 'liechtenstein', 'lithuania', 'luxembourg', 'madagascar', 'malawi', 'malaysia',
    'maldives', 'mali', 'malta', 'marshall', 'mauritania', 'mauritius', 'mexico', 'micronesia', 'moldova', 'monaco',
    'mongolia', 'montenegro', 'morocco', 'mozambique', 'myanmar', 'namibia', 'nauru', 'nepal', 'netherlands', 'new zealand',
    'nicaragua', 'niger', 'nigeria', 'norway', 'oman', 'pakistan', 'palau', 'panama', 'papua', 'paraguay',
    'peru', 'philippines', 'poland', 'portugal', 'qatar', 'romania', 'russia', 'rwanda', 'samoa', 'san marino',
    'saudi arabia', 'senegal', 'serbia', 'seychelles', 'sierra leone', 'singapore', 'slovakia', 'slovenia', 'solomon', 'somalia',
    'south africa', 'south sudan', 'spain', 'sri lanka', 'sudan', 'suriname', 'sweden', 'switzerland', 'syria', 'taiwan',
    'tajikistan', 'tanzania', 'thailand', 'togo', 'tonga', 'trinidad', 'tunisia', 'turkey', 'turkmenistan', 'tuvalu',
    'uganda', 'ukraine', 'united arab', 'united kingdom', 'united states', 'uruguay', 'uzbekistan', 'vanuatu', 'vatican', 'venezuela',
    'vietnam', 'yemen', 'zambia', 'zimbabwe', 'usa', 'uk', 'uae', 'drc'
  ];

  const countryLower = country.toLowerCase().trim();
  
  // Check if country name contains any common country name
  const matchesCommonCountry = commonCountries.some(c => countryLower.includes(c) || c.includes(countryLower));
  
  if (matchesCommonCountry) {
    return true;
  }

  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=false`,
      { 
        signal: AbortSignal.timeout(5000) // 5 second timeout
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.length > 0;
    }
    
    // If API fails but we have basic validation, accept it
    return countryLower.length >= 3; // Accept if at least 3 characters
  } catch (error) {
    console.error("Country validation error (using fallback):", error);
    // On network error, use lenient validation
    return countryLower.length >= 3; // Accept if at least 3 characters
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("roots_user")?.value?.trim();
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }
    const db = await getDb();
    const projection = {
      _id: 0,
      userId: 1,
      profileId: 1,
      email: 1,
      name: 1,
      location: 1,
      homeCountry: 1,
      favoriteMuseums: 1,
      favoriteRecipes: 1,
      bio: 1,
      socialHandle: 1,
      role: 1,
      points: 1,
      createdAt: 1,
      updatedAt: 1,
    };
    const filters = buildUserFilters(userId);
    const profile = await db
      .collection(COLLECTION)
      .findOne({ $or: filters }, { projection });
    if (profile) {
      const resolvedUserId =
        (profile.userId as string | undefined) ??
        (profile.profileId as string | undefined) ??
        userId;
      profile.userId = resolvedUserId;
      delete profile.profileId;
    }
    return NextResponse.json({ profile: profile ?? null });
  } catch (error) {
    console.error("Profile GET error", error);
    return NextResponse.json(
      { error: "Unable to load profile details." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("roots_user")?.value?.trim();
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const name = sanitize(payload?.name);
    const email = sanitize(payload?.email);
    const location = sanitize(payload?.location);
    const homeCountry = sanitize(payload?.homeCountry);
    const favoriteMuseums = sanitize(payload?.favoriteMuseums);
    const favoriteRecipes = sanitize(payload?.favoriteRecipes);
    const bio = sanitize(payload?.bio);
    const rawHandle = sanitize(payload?.socialHandle);
    const normalizedHandle = rawHandle.replace(/^@+/, "").replace(/\s+/g, "");
    const socialHandle = normalizedHandle
      ? `@${normalizedHandle}`
      : "";
    const socialHandleNormalized = normalizedHandle.toLowerCase();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    // Validate home country if provided
    if (homeCountry && homeCountry.length > 0) {
      const isValidCountry = await validateCountry(homeCountry);
      if (!isValidCountry) {
        return NextResponse.json(
          {
            error: `"${homeCountry}" is not a valid country name. Please check spelling.`,
          },
          { status: 400 }
        );
      }
    }

    const db = await getDb();
    const now = new Date();
    const filters = buildUserFilters(userId);
    const updateDoc: {
      $set: Record<string, unknown>;
      $setOnInsert: Record<string, unknown>;
      $unset?: Record<string, unknown>;
    } = {
      $set: {
        userId,
        name,
        email,
        location,
        homeCountry,
        favoriteMuseums,
        favoriteRecipes,
        bio,
        socialHandle,
        socialHandleNormalized,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    };
    updateDoc.$unset = { profileId: "" };
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { $or: filters },
      updateDoc,
      {
        returnDocument: "after",
        projection: { _id: 0 },
        upsert: true,
      }
    );

    return NextResponse.json({ profile: result?.value ?? null });
  } catch (error) {
    console.error("Profile POST error", error);
    return NextResponse.json(
      { error: "Unable to save profile details." },
      { status: 500 }
    );
  }
}
