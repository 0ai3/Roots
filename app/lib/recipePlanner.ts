type RecipeRequest = {
  country: string;
  zone: string;
  dietaryFocus?: string;
  notes?: string;
  limit?: number;
};

export class RecipePlannerError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "RecipePlannerError";
    this.status = status;
  }
}

let recipeRequestInFlight = false;

export function normalizeRecipeRequest(body: unknown): RecipeRequest {
  const source = body as Record<string, unknown>;
  const country = String(source?.country ?? "").trim();
  const zone = String(source?.zone ?? "").trim();
  const dietaryFocus = String(source?.dietaryFocus ?? "").trim();
  const notes = String(source?.notes ?? "").trim();
  const limitValue = Number(source?.limit ?? 3);
  let limit: number;
  if (Number.isFinite(limitValue)) {
    limit = Math.min(Math.max(Math.floor(limitValue), 1), 5);
  } else {
    limit = 3;
  }

  if (!country || !zone) {
    throw new RecipePlannerError(
      "Both a country and a zone/region are required to suggest recipes.",
      400
    );
  }

  return {
    country,
    zone,
    dietaryFocus: dietaryFocus || undefined,
    notes: notes || undefined,
    limit,
  };
}

export async function requestRecipes(payload: RecipeRequest) {
  if (recipeRequestInFlight) {
    throw new RecipePlannerError(
      "Another recipe request is already in progress. Please wait a moment.",
      429
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new RecipePlannerError("Gemini API key is not configured.", 500);
  }

  const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

  const requestedLimit = payload.limit ?? 3;
  const clampedLimit = Math.min(Math.max(requestedLimit, 1), 5);

  const prompt = `You are Roots' culinary curator. Suggest ${clampedLimit} traditional or modern dishes from ${payload.zone} in ${payload.country}.
Dietary focus: ${payload.dietaryFocus || "any"}.
${payload.notes ? `Additional notes: ${payload.notes}` : ""}

Return ONLY valid JSON with the structure:
{
  "intro": "one short paragraph",
  "recipes": [
    {
      "name": "dish name",
      "region": "zone/neighborhood",
      "flavorProfile": "brief descriptors",
      "description": "2 sentence summary",
      "keyIngredients": ["ingredient 1","ingredient 2","ingredient 3"],
      "difficulty": "Easy | Moderate | Advanced",
      "mapLink": "https://www.google.com/maps/search/?api=1&query=encoded region + country",
      "culturalNote": "short fun fact or serving tip"
    }
  ],
  "closing": "invitation to explore or ask for another region"
}

Requirements: include exactly ${clampedLimit} recipes, each with at least three ingredients and a valid Google Maps link related to the zone or a signature market/restaurant.`;

  recipeRequestInFlight = true;
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.65,
          topK: 40,
          topP: 0.9,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const status = response.status;
      if (status === 429 || status === 503) {
        throw new RecipePlannerError(
          "Gemini is busy crafting recipes. Please try again shortly.",
          status
        );
      }
      throw new RecipePlannerError(
        `Gemini recipe request failed for model ${modelName}: ${
          errorText || response.statusText
        }`,
        status
      );
    }

    const payloadJson = await response.json();
    const reply =
      payloadJson?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part?.text ?? "")
        .join("")
        .trim() ?? "";

    if (!reply) {
      throw new RecipePlannerError("Gemini did not return any recipes.", 502);
    }

    return reply;
  } finally {
    recipeRequestInFlight = false;
  }
}

export function buildFallbackRecipePayload(payload: RecipeRequest) {
  const { country, zone } = payload;

  const baseIdeas = [
    {
      name: `${zone} Market Mezze`,
      flavorProfile: "Bright herbs & citrus",
      description: `Snack through the markets of ${zone}, sampling herb-forward bites that showcase ${country}'s produce.`,
      keyIngredients: ["Seasonal vegetables", "Citrus", "Fresh herbs"],
      difficulty: "Easy",
      culturalNote: "Pair with mint tea or a local spritz for an afternoon refresh.",
      mapQuery: `${zone} market`,
    },
    {
      name: `${zone} Hearth Stew`,
      flavorProfile: "Slow-cooked comfort",
      description: `A rustic stew that families across ${zone} simmer for hours, layering spices and local grains.`,
      keyIngredients: ["Root vegetables", "Local grain", "Signature spice blend"],
      difficulty: "Moderate",
      culturalNote: "Traditionally served at gatherings with plenty of flatbread for dipping.",
      mapQuery: `${zone} traditional restaurant`,
    },
    {
      name: `${zone} Coastal Grill`,
      flavorProfile: "Smoky seaside flavors",
      description: `Seafood grilled over open coals the way fishers from ${zone} have done for generations.`,
      keyIngredients: ["Daily catch", "Citrus marinade", "Charred chilies"],
      difficulty: "Moderate",
      culturalNote: "Look for pop-up grills near the harbor at dusk.",
      mapQuery: `${zone} harbor`,
    },
    {
      name: `${zone} Sweet Street Treat`,
      flavorProfile: "Caramelized & nutty",
      description: `A portable dessert from ${zone}'s street vendors, layered with toasted nuts and syrup.`,
      keyIngredients: ["Phyllo or crepe batter", "Toasted nuts", "Local honey"],
      difficulty: "Easy",
      culturalNote: "Best enjoyed fresh while wandering the old town.",
      mapQuery: `${zone} dessert stand`,
    },
    {
      name: `${zone} Sunrise Brew & Bite`,
      flavorProfile: "Spiced & aromatic",
      description: `Kick off the day with a spiced beverage and pastry pairing beloved across ${zone}.`,
      keyIngredients: ["Spice mix", "Milk or plant base", "Buttery pastry"],
      difficulty: "Easy",
      culturalNote: "Many cafés open before dawn to serve travelers catching early transport.",
      mapQuery: `${zone} cafe`,
    },
  ];

  const limit = payload.limit ?? 3;
  const clampedLimit = Math.min(Math.max(limit, 1), 5);

  const recipes = baseIdeas.slice(0, clampedLimit).map((idea) => ({
    name: idea.name,
    region: zone,
    flavorProfile: idea.flavorProfile,
    description: idea.description,
    keyIngredients: idea.keyIngredients,
    difficulty: idea.difficulty,
    culturalNote: idea.culturalNote,
    mapLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${idea.mapQuery} ${country}`
    )}`,
  }));

  return JSON.stringify({
    intro: `Gemini is taking a moment, so here are some curated ${zone} bites from the Roots pantry.`,
    recipes,
    closing: `Ask again once Gemini is ready for more custom ideas or choose another region.`,
  });
}
