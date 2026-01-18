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

  const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

  const formatInstruction = `You are an expert chef. Provide a COMPLETE detailed recipe for "${payload.recipeName}"${payload.region ? ` from ${payload.region}` : ''}${payload.description ? ` (${payload.description})` : ''}.

CRITICAL REQUIREMENTS:
1. ALL ingredients MUST include precise measurements in grams (g), milliliters (ml), or standard units
   - Example: "500g chicken breast", "250ml milk", "2 tablespoons (30ml) olive oil"
   - NEVER list ingredients without measurements
2. ALL cooking steps MUST include:
   - Exact temperatures (e.g., "180°C", "medium-high heat")
   - Precise cooking times (e.g., "25 minutes", "until golden brown, about 5-7 minutes")
   - Visual cues (e.g., "until edges are crispy", "until it thickens")
3. Specify serving size clearly (e.g., "Serves 4 people")
4. Provide prep time and cook time estimates
5. Include chef tips about technique, substitutions, or common mistakes to avoid

${payload.dietaryFocus ? `Dietary focus: ${payload.dietaryFocus}` : ''}
${payload.notes ? `Additional preferences: ${payload.notes}` : ''}

Respond ONLY with valid JSON matching this exact structure:
{
  "name": "Recipe Name",
  "servings": "Serves X people",
  "prepTime": "X minutes",
  "cookTime": "X minutes",
  "ingredients": [
    "Exact amount with unit (e.g., 500g chicken breast)",
    "Another ingredient with measurement"
  ],
  "steps": [
    "Step 1 with temperature and time details",
    "Step 2 with visual cues and timing"
  ],
  "tips": "Chef's helpful tips and notes"
}

Ensure at least 8-12 ingredients with measurements and 8-12 detailed cooking steps.`;
  const requestParts = [{ text: formatInstruction }];

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
