type RecipeDetailRequest = {
  country: string;
  zone: string;
  recipeName: string;
  region?: string;
  description?: string;
  dietaryFocus?: string;
  notes?: string;
};

export type RecipeDetailResponse = {
  name: string;
  servings?: string;
  prepTime?: string;
  cookTime?: string;
  ingredients?: string[];
  steps?: string[];
  tips?: string;
};

export class RecipeDetailError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "RecipeDetailError";
    this.status = status;
  }
}

let detailRequestInFlight = false;

export function normalizeRecipeDetailRequest(body: unknown): RecipeDetailRequest {
  const source = body as Record<string, unknown>;
  const country = String(source?.country ?? "").trim();
  const zone = String(source?.zone ?? "").trim();
  const recipeName = String(source?.recipeName ?? "").trim();
  const region = String(source?.region ?? "").trim();
  const description = String(source?.description ?? "").trim();
  const dietaryFocus = String(source?.dietaryFocus ?? "").trim();
  const notes = String(source?.notes ?? "").trim();

  if (!country || !zone || !recipeName) {
    throw new RecipeDetailError("Country, zone, and recipe name are required.", 400);
  }

  return {
    country,
    zone,
    recipeName,
    region: region || undefined,
    description: description || undefined,
    dietaryFocus: dietaryFocus || undefined,
    notes: notes || undefined,
  };
}

function extractJsonBlock(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }
  const fenceMatch = trimmed.match(/```(?:[\w-]+)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}

export async function requestRecipeDetail(
  payload: RecipeDetailRequest
): Promise<RecipeDetailResponse> {
  if (detailRequestInFlight) {
    throw new RecipeDetailError(
      "Another recipe detail request is already running. Please wait a moment.",
      429
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new RecipeDetailError("Gemini API key is not configured.", 500);
  }

  const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

  const formatInstruction =
    'Respond ONLY with valid JSON matching: {"name":"","servings":"","prepTime":"","cookTime":"","ingredients":[""],"steps":[""],"tips":""}. Include at least six ingredients and six imperative steps tailored to the requested dish.';
  const requestParts = [{ text: `the recipe for ${payload.recipeName}` }, { text: formatInstruction }];

  detailRequestInFlight = true;
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: requestParts }],
        generationConfig: {
          temperature: 0.55,
          topK: 40,
          topP: 0.9,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const status = response.status;
      if (status === 429 || status === 503) {
        throw new RecipeDetailError(
          "Gemini is busy writing the instructions. Please try again shortly.",
          status
        );
      }
      throw new RecipeDetailError(
        `Gemini detail request failed for model ${modelName}: ${
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
      throw new RecipeDetailError("Gemini did not return recipe instructions.", 502);
    }

    const jsonText = extractJsonBlock(reply);
    try {
      const parsed = JSON.parse(jsonText) as RecipeDetailResponse;
      return parsed;
    } catch (error) {
      throw new RecipeDetailError(
        `Unable to parse Gemini recipe instructions: ${
          error instanceof Error ? error.message : "Invalid JSON"
        }`,
        502
      );
    }
  } finally {
    detailRequestInFlight = false;
  }
}
