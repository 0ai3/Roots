import { NextRequest, NextResponse } from "next/server";
import {
  RecipeDetailError,
  normalizeRecipeDetailRequest,
  requestRecipeDetail,
} from "@/app/lib/recipeDetailPlanner";

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const payload = normalizeRecipeDetailRequest(raw);
    const detail = await requestRecipeDetail(payload);
    return NextResponse.json({ detail });
  } catch (error) {
    if (error instanceof RecipeDetailError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Recipe detail error", error);
    return NextResponse.json(
      { error: "Unexpected error while retrieving recipe instructions." },
      { status: 500 }
    );
  }
}
