import { NextRequest, NextResponse } from "next/server";
import { jsonrepair } from "jsonrepair";

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

type LearnEarnModulePayload = {
  country: string;
  summary: string;
  reading: string[];
  quiz: {
    id: string;
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  }[];
};

function buildPrompt(country: string) {
  return `Create a concise "Learn & Earn" cultural module for travelers who want to understand ${country}. Return ONLY valid JSON with this shape:
{
  "country": "${country}",
  "summary": "One sentence describing the tradition or theme",
  "reading": ["Paragraph 1", "Paragraph 2", "Paragraph 3", "Paragraph 4"],
  "quiz": [
    {
      "id": "quiz-1",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "answer": 0,
      "explanation": "Why the answer is correct"
    }
  ]
}
Requirements:
- reading should highlight cultural rituals, etiquette, or creative scenes tied to ${country}. 3-5 short paragraphs, each under 80 words.
- quiz must contain exactly 10 questions.
- each question needs 4 distinct options and "answer" is the zero-based index of the correct option.
- explanations should be one sentence reinforcing the paragraph details.
- Keep tone factual and travel-focused.
Return ONLY the JSON (no markdown, no commentary).`;
}

function extractJson(text: string) {
  const trimmed = text.trim();
  const codeMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const payload = codeMatch ? codeMatch[1] : trimmed;
  const start = payload.indexOf("{");
  const end = payload.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Gemini response did not contain JSON");
  }
  return payload.slice(start, end + 1);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const country = String(body?.country ?? "").trim();
    if (!country) {
      return NextResponse.json(
        { error: "Please provide a country name." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured." },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(country);
    const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Gemini error ${response.status}: ${details}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    const jsonPayload = extractJson(text);
    const repaired = jsonrepair(jsonPayload);
    const module = JSON.parse(repaired) as LearnEarnModulePayload;

    if (!module?.quiz || !Array.isArray(module.quiz) || module.quiz.length !== 10) {
      throw new Error("Gemini did not return 10 quiz questions");
    }
    module.quiz.forEach((question, index) => {
      if (
        !question ||
        typeof question.question !== "string" ||
        !Array.isArray(question.options) ||
        question.options.length !== 4 ||
        typeof question.answer !== "number" ||
        question.answer < 0 ||
        question.answer > 3
      ) {
        throw new Error(`Invalid quiz question returned at index ${index}`);
      }
    });
    const readingLength = module.reading?.length ?? 0;
    if (!module.reading || readingLength < 3) {
      throw new Error("Gemini did not return enough reading paragraphs");
    }

    module.summary = module.summary?.trim() ?? `Cultural insights from ${module.country}`;
    module.country = module.country?.trim() || country;

    return NextResponse.json({ module });
  } catch (error) {
    console.error("Learn & Earn generator error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate the module.",
      },
      { status: 500 }
    );
  }
}
