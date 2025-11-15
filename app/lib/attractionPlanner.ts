type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type PlannerRequest = {
  location: string;
  budget: string;
  interests?: string;
  notes?: string;
  messages: ChatMessage[];
};

export class PlannerError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "PlannerError";
    this.status = status;
  }
}

export function normalizePlannerRequest(body: unknown): PlannerRequest {
  const raw = body as Record<string, unknown>;
  const location = String(raw?.location ?? "").trim();
  const budget = String(raw?.budget ?? "").trim();
  const interests = String(raw?.interests ?? "").trim();
  const notes = String(raw?.notes ?? "").trim();
  const messagesArray = Array.isArray(raw?.messages) ? raw.messages : [];

  const messages = messagesArray
    .map((message) => {
      const item = message as ChatMessage;
      const role = item.role === "assistant" ? "assistant" : "user";
      const content = String(item.content ?? "").trim();
      return content.length > 0 ? { role, content } : null;
    })
    .filter((item): item is ChatMessage => Boolean(item));

  if (!location || !budget || messages.length === 0) {
    throw new PlannerError(
      "Location, budget, and at least one conversation message are required.",
      400
    );
  }

  return {
    location,
    budget,
    interests: interests || undefined,
    notes: notes || undefined,
    messages,
  };
}

let hasActiveGeminiRequest = false;

export async function requestGeminiPlan(payload: PlannerRequest) {
  if (hasActiveGeminiRequest) {
    throw new PlannerError(
      "Another Gemini plan is already running. Please wait a moment and try again.",
      429
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new PlannerError("Gemini API key is not configured on the server.", 500);
  }

  const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

  const travelContext = `You are Roots' cultural concierge helping a user explore ${payload.location}.
They have a budget of ${payload.budget} and are interested in ${
    payload.interests || "a variety of city experiences"
  }.
${payload.notes ? `Additional notes: ${payload.notes}` : ""}

TASK:
Return a JSON document with the following structure:
{
  "intro": "short conversational intro, friendly tone",
  "tips": ["quick travel tip 1", "quick travel tip 2"],
  "attractions": [
    {
      "title": "name of the activity or place",
      "neighborhood": "area or borough",
      "cost": "Free, $, $$, $$$",
      "description": "2-3 sentence highlight",
      "mapLink": "https://www.google.com/maps/search/?api=1&query=encoded location",
      "category": "museum | gallery | park | food | nightlife | shopping | landmark | event | other",
      "latitude": 40.7128,
      "longitude": -74.006,
      "notes": ["bullet point tip 1", "bullet point tip 2"]
    }
  ],
  "closing": "conversational outro inviting follow-up questions"
}

REQUIREMENTS:
- Always include at least three attractions.
- Each attraction must include a valid Google Maps link.
- Latitude and longitude must be decimal degrees that fall near ${payload.location}.
- Category must be one of: museum, gallery, park, food, nightlife, shopping, landmark, event, other.
- Keep the response friendly and concise so the client can render styled cards.
- Do not include any markdown or backticks, just the JSON string.`;

  const contents = [
    {
      role: "user",
      parts: [{ text: travelContext }],
    },
    ...payload.messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    })),
  ];

  hasActiveGeminiRequest = true;
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.8,
          topK: 32,
          topP: 0.95,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 429 || response.status === 503) {
        throw new PlannerError(
          "Gemini is handling a high volume of requests. Please try again in a moment.",
          response.status
        );
      }
      throw new PlannerError(
        `Gemini API request failed for model ${modelName}: ${
          errorText || response.statusText
        }`,
        response.status
      );
    }

    const payloadJson = await response.json();
    const reply =
      payloadJson?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part?.text ?? "")
        .join("")
        .trim() ?? "";

    if (!reply) {
      throw new PlannerError("Gemini did not return any content.", 502);
    }

    return reply;
  } finally {
    hasActiveGeminiRequest = false;
  }
}
