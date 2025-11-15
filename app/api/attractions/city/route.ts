import { NextRequest, NextResponse } from "next/server";
import {
  CityAttractionError,
  normalizeCityAttractionRequest,
  requestCityAttractions,
} from "@/app/lib/cityAttractions";

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const payload = normalizeCityAttractionRequest(raw);
    const attractions = await requestCityAttractions(payload);
    return NextResponse.json({ attractions });
  } catch (error) {
    if (error instanceof CityAttractionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("City attractions error", error);
    return NextResponse.json(
      { error: "Unexpected error while contacting Gemini." },
      { status: 500 }
    );
  }
}
