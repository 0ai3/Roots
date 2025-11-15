import type { CityAttraction } from "@/app/types/cityAttractions";

export type CityAttractionRequest = {
  city: string;
  country?: string;
  limit?: number;
  category?: string;
};

export class CityAttractionError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CityAttractionError";
    this.status = status;
  }
}

export function normalizeCityAttractionRequest(
  body: unknown
): CityAttractionRequest {
  const raw = body as Record<string, unknown>;
  const city = String(raw?.city ?? "").trim();
  const country = String(raw?.country ?? "").trim();
  const limitRaw = Number(raw?.limit ?? 8);
  const category = String(raw?.category ?? "").trim();

  if (!city) {
    throw new CityAttractionError("City is required.", 400);
  }

  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 12) : 8;

  return {
    city,
    country: country || undefined,
    limit,
    category: category || undefined,
  };
}

type GeminiAttractionPayload = {
  title?: string;
  neighborhood?: string;
  summary?: string;
  latitude?: number;
  longitude?: number;
  mapLink?: string;
};

type GeminiReply = {
  attractions?: GeminiAttractionPayload[];
};

function getGeminiApiInfo() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new CityAttractionError(
      "Gemini API key is not configured on the server.",
      500
    );
  }

  const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

  return { apiKey, endpoint, modelName };
}

function buildAttractionPrompt({
  city,
  country,
  limit = 8,
  category,
}: CityAttractionRequest) {
  const locationLine = country ? `${city}, ${country}` : city;
  return `You are Roots' global explorer planning real-world map experiences.

Return ONLY valid minified JSON using this schema:
{
  "attractions": [
    {
      "title": "short attraction title",
      "neighborhood": "optional area or borough",
      "summary": "single short sentence highlight",
      "latitude": 40.123,
      "longitude": -74.321,
      "mapLink": "https://www.google.com/maps/search/?api=1&query=encoded place name"
    }
  ]
}

Rules:
- Highlight ${limit} must-see spots people can visit in ${locationLine}.
- Provide precise decimal latitude/longitude pairs located inside or near ${locationLine}.
- Summaries must be one friendly sentence no longer than 12 words.
- ${
  category
    ? `Focus exclusively on ${category} experiences and skip unrelated ideas.`
    : "Mix indoor and outdoor options when possible."
}
- Use friendly but concise wording.
- Do not include markdown, explanations, or code fences. Respond with plain JSON text only.`;
}

function parseGeminiReply(payload: GeminiReply): CityAttraction[] {
  const items = Array.isArray(payload?.attractions) ? payload.attractions : [];
  const parsed = items
    .map((item) => {
      const latitude = Number(item.latitude);
      const longitude = Number(item.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }
      return {
        title: item.title?.trim() ?? "Unnamed attraction",
        neighborhood: item.neighborhood?.trim(),
        summary: item.summary?.trim(),
        latitude,
        longitude,
        mapLink: item.mapLink?.trim(),
      };
    })
    .filter((item): item is CityAttraction => Boolean(item));

  if (parsed.length === 0) {
    throw new CityAttractionError(
      "Gemini did not return any attractions.",
      502
    );
  }

  return parsed;
}

export async function requestCityAttractions(
  payload: CityAttractionRequest
): Promise<CityAttraction[]> {
  const { apiKey, endpoint, modelName } = getGeminiApiInfo();
  const prompt = buildAttractionPrompt(payload);

  const response = await fetch(`${endpoint}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 429 || response.status === 503) {
      throw new CityAttractionError(
        "Gemini is handling a lot of requests. Try again in a moment.",
        response.status
      );
    }
    throw new CityAttractionError(
      `Gemini request failed for ${modelName}: ${text || response.statusText}`,
      response.status
    );
  }

  const json = await response.json();
  const reply =
    json?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part?.text ?? "")
      .join("")
      .trim() ?? "";

  if (!reply) {
    throw new CityAttractionError("Gemini reply was empty.", 502);
  }

  let parsed: GeminiReply;
  try {
    parsed = JSON.parse(reply) as GeminiReply;
  } catch {
    throw new CityAttractionError(
      "Gemini response was not valid JSON.",
      502
    );
  }

  return parseGeminiReply(parsed);
}
