import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const modelsToTest = [
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest", 
      "gemini-pro",
      "gemini-1.5-pro"
    ];

    const results = [];

    for (const modelName of modelsToTest) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say 'Hello World'");
        const response = await result.response;
        const text = response.text();
        
        results.push({
          model: modelName,
          status: "✅ Working",
          response: text
        });
      } catch (error: unknown) {
        results.push({
          model: modelName,
          status: "❌ Failed",
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return NextResponse.json({
      apiKey: `${process.env.GEMINI_API_KEY.substring(0, 10)}...`,
      results
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
