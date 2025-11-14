import { NextRequest, NextResponse } from "next/server";
import {
  RecipePlannerError,
  normalizeRecipeRequest,
  requestRecipes,
  buildFallbackRecipePayload,
} from "@/app/lib/recipePlanner";

export async function POST(request: NextRequest) {
  let payload: ReturnType<typeof normalizeRecipeRequest> | null = null;
  try {
    const raw = await request.json();
    payload = normalizeRecipeRequest(raw);
    const reply = await requestRecipes(payload);
    return NextResponse.json({ reply });
  } catch (error) {
    if (error instanceof RecipePlannerError) {
      if (
        payload &&
        (error.status === 429 || error.status === 503)
      ) {
        const fallback = buildFallbackRecipePayload(payload);
        return NextResponse.json({ reply: fallback, fallback: true });
      }
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Recipe planner error", error);
    return NextResponse.json(
      { error: "Unexpected error while contacting Gemini." },
      { status: 500 }
    );
  }
}
