import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, difficulty, questionCount } = body;

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro', // Use stable model
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    // Build prompt based on type
    const prompts: Record<string, string> = {
      cultural: `Create ${questionCount} multiple choice quiz questions about world cultures and traditions. Topics: festivals, customs, traditions, cultural practices.`,
      geography: `Create ${questionCount} geography quiz questions about countries, capitals, landmarks, and geographic features.`,
      tradition: `Create ${questionCount} questions matching cultural practices to their origins.`,
      language: `Create ${questionCount} questions about basic phrases in different languages.`,
      history: `Create ${questionCount} questions about world history and chronology.`,
      speed: `Create ${questionCount} quick general knowledge questions about cultures and geography.`
    };

    const basePrompt = prompts[type as keyof typeof prompts] || prompts.cultural;

    const pointsRange = difficulty === 'easy' ? '20-100' :
                       difficulty === 'medium' ? '50-200' : '100-400';

    const fullPrompt = `${basePrompt}

CRITICAL FORMATTING RULES:
1. Return ONLY a valid JSON array
2. Start with [ and end with ]
3. Use double quotes for all strings
4. No trailing commas
5. No markdown, no code blocks

Difficulty: ${difficulty}
Points range: ${pointsRange}

JSON structure:
[
  {
    "question": "Question text?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": 0,
    "explanation": "Explanation text",
    "points": 50
  }
]

Generate exactly ${questionCount} questions. Return only the JSON array:`;

    try {
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;

      if (!response) {
        throw new Error("No response from Gemini API");
      }

      let text;
      try {
        text = response.text();
      } catch (error) {
        console.error("Error getting text from response:", error);
        throw new Error("Failed to get text from Gemini response");
      }

      if (!text || text.trim().length === 0) {
        console.error("Empty text from Gemini");
        throw new Error("Gemini returned an empty response");
      }

      // Clean the response
      text = text.trim();
      text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

      // Extract JSON
      const startIndex = text.indexOf('[');
      const endIndex = text.lastIndexOf(']');
  
      if (startIndex === -1 || endIndex === -1) {
        console.error("No valid JSON array in response:", text.substring(0, 200));
        throw new Error("Invalid JSON format in Gemini response");
      }
  
      const jsonText = text.substring(startIndex, endIndex + 1);
  
      // Fix common JSON issues
      const cleanedJson = jsonText
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/\n/g, ' ')
        .replace(/\r/g, '');
  
      const jsonPayload = JSON.parse(cleanedJson);
  
      if (!Array.isArray(jsonPayload)) {
        throw new Error("Response is not a valid array");
      }
  
      return NextResponse.json({ questions: jsonPayload });
    } catch (geminiError) {
      console.error("Gemini API error, using fallback:", geminiError);
      // Fallback mock questions
      const mockQuestions = [
        {
          question: "What is the capital of France?",
          options: ["London", "Berlin", "Paris", "Madrid"],
          correctAnswer: 2,
          explanation: "Paris is the capital and largest city of France.",
          points: 50
        },
        {
          question: "Which planet is known as the Red Planet?",
          options: ["Venus", "Mars", "Jupiter", "Saturn"],
          correctAnswer: 1,
          explanation: "Mars is called the Red Planet due to its reddish appearance caused by iron oxide on its surface.",
          points: 50
        },
        {
          question: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          correctAnswer: 1,
          explanation: "2 + 2 equals 4.",
          points: 50
        }
      ];
      return NextResponse.json({ questions: mockQuestions });
    }

  } catch (error) {
    console.error("Learn & Earn generator error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate content" },
      { status: 500 }
    );
  }
}
