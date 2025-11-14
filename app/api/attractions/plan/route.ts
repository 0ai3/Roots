import { NextRequest, NextResponse } from "next/server";
import {
  PlannerError,
  normalizePlannerRequest,
  requestGeminiPlan,
} from "@/app/lib/attractionPlanner";

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const payload = normalizePlannerRequest(raw);
    const reply = await requestGeminiPlan(payload);
    return NextResponse.json({ reply });
  } catch (error) {
    if (error instanceof PlannerError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Attractions planner error", error);
    return NextResponse.json(
      { error: "Unexpected error while contacting Gemini." },
      { status: 500 }
    );
  }
}
