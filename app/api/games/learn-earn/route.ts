import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
// import PageThemeToggle from "@/app/components/PageThemeToggle"; // Client component - do NOT import into server API routes. Move this import into a client/page component where it will be used.

// Add type for Gemini API response questions
interface GeminiQuestionResponse {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points?: number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { country, type, difficulty, questionCount } = body;

    // Build more specific country context
    const countryContext = country ? ` specifically about ${country}` : "";

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    // Try models in order of preference
    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-pro",
      "gemini-1.5-pro",
    ];

    let model = null;
    let lastError = null;

    // Try each model until one works
    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting to use model: ${modelName}`);
        const testModel = genAI.getGenerativeModel({ model: modelName });

        // Test the model with a simple prompt
        const testResult = await testModel.generateContent("Say 'test'");
        const testResponse = await testResult.response;

        if (testResponse && testResponse.text()) {
          model = testModel;
          console.log(`✅ Successfully using model: ${modelName}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Model ${modelName} failed:`, error);
        lastError = error;
        continue;
      }
    }

    if (!model) {
      console.error("All models failed. Last error:", lastError);
      throw new Error("No available Gemini models found. Please check your API key.");
    }

    // Build more specific prompts based on type and country
    const prompts: Record<string, string> = {
      cultural: `Create ${questionCount} multiple choice quiz questions about cultural aspects${countryContext}. Focus on: festivals, celebrations, customs, social norms, cultural practices, traditional ceremonies, and daily life traditions.`,
      geography: `Create ${questionCount} geography quiz questions${countryContext}. Focus on: geographic features, regions, cities, landmarks, climate zones, natural resources, and topography.`,
      tradition: `Create ${questionCount} questions about traditional practices and customs${countryContext}. Focus on: ancestral traditions, ritual practices, traditional crafts, cultural heritage, and how traditions are passed down through generations.`,
      language: `Create ${questionCount} questions about language and communication${countryContext}. Focus on: common phrases, greetings, language characteristics, dialects, writing systems, and linguistic features.`,
      history: `Create ${questionCount} questions about historical events and periods${countryContext}. Focus on: significant historical moments, influential figures, historical developments, and cultural evolution over time.`,
      speed: `Create ${questionCount} quick general knowledge questions${countryContext}. Mix topics: culture, geography, history, and interesting facts. Keep questions concise and engaging.`,
    };

    const basePrompt =
      prompts[type as keyof typeof prompts] || prompts.cultural;

    const pointsRange =
      difficulty === "easy"
        ? "20-100"
        : difficulty === "medium"
        ? "50-200"
        : "100-400";

    const fullPrompt = `${basePrompt}

IMPORTANT: ${
      country
        ? `ALL questions MUST be specifically about ${country}. Do not include general questions or questions about other countries.`
        : "Cover diverse global topics."
    }

CRITICAL FORMATTING RULES - FOLLOW EXACTLY:
1. Return ONLY a valid JSON array - nothing else
2. Start with [ and end with ]
3. Use double quotes for ALL strings
4. NO trailing commas anywhere
5. NO markdown, NO code blocks, NO backticks
6. Escape quotes within strings with backslash

Difficulty: ${difficulty}
Points range: ${pointsRange}

JSON structure (copy this format exactly):
[
  {
    "question": "What is a famous festival in ${country || 'the world'}?",
    "options": ["Answer A", "Answer B", "Answer C", "Answer D"],
    "correctAnswer": 0,
    "explanation": "This is because...",
    "points": 75
  }
]

Requirements:
- EXACTLY ${questionCount} questions
- Each question must be unique and specific to ${country || 'the topic'}
- Options should be plausible but only one correct
- Explanations must be educational (2-3 sentences)
- Questions must match the "${type}" category
- correctAnswer is the index (0-3) of the correct option
${country ? `- EVERY question must be about ${country} specifically` : ''}

Generate ONLY the JSON array - no other text:`;

    try {
      console.log("Sending prompt to Gemini...");
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;

      if (!response) {
        throw new Error("Empty response from Gemini API");
      }

      let text;
      try {
        text = response.text();
        console.log("Received response from Gemini, length:", text.length);
      } catch (error) {
        console.error("Error getting text from response:", error);
        throw new Error("Failed to get text from Gemini response");
      }

      if (!text || text.trim().length === 0) {
        console.error("Empty text from Gemini");
        throw new Error("Gemini returned an empty response");
      }

      // Clean the response more aggressively
      text = text.trim();

      // Remove markdown code blocks
      text = text.replace(/```json\s*/gi, "");
      text = text.replace(/```javascript\s*/gi, "");
      text = text.replace(/```\s*/g, "");

      // Remove any text before the first [
      const firstBracket = text.indexOf("[");
      if (firstBracket > 0) {
        text = text.substring(firstBracket);
      }

      // Remove any text after the last ]
      const lastBracket = text.lastIndexOf("]");
      if (lastBracket !== -1 && lastBracket < text.length - 1) {
        text = text.substring(0, lastBracket + 1);
      }

      // Extract JSON array
      const startIndex = text.indexOf("[");
      const endIndex = text.lastIndexOf("]");

      if (startIndex === -1 || endIndex === -1) {
        console.error("No valid JSON array in response. First 500 chars:", text.substring(0, 500));
        throw new Error("Invalid JSON format in Gemini response");
      }

      const jsonText = text.substring(startIndex, endIndex + 1);

      // Fix common JSON issues
      const cleanedJson = jsonText
        .replace(/,\s*}/g, "}")          // Remove trailing commas before }
        .replace(/,\s*]/g, "]")          // Remove trailing commas before ]
        .replace(/\n/g, " ")             // Remove newlines
        .replace(/\r/g, "")              // Remove carriage returns
        .replace(/\t/g, " ")             // Replace tabs with spaces
        .replace(/\s+/g, " ");           // Collapse multiple spaces

      console.log("Attempting to parse JSON...");
      const jsonPayload = JSON.parse(cleanedJson) as GeminiQuestionResponse[];

      if (!Array.isArray(jsonPayload)) {
        throw new Error("Response is not a valid array");
      }

      if (jsonPayload.length === 0) {
        throw new Error("Gemini returned an empty array of questions");
      }

      console.log(`✅ Successfully generated ${jsonPayload.length} questions`);

      // Format response to match expected structure
      const formattedQuiz = jsonPayload.map(
        (q: GeminiQuestionResponse, index: number) => ({
          id: `q${index + 1}`,
          question: q.question,
          options: q.options,
          answer: q.correctAnswer,
          explanation: q.explanation,
        })
      );

      return NextResponse.json({
        module: {
          country: country || "General",
          summary: `${
            type ? type.charAt(0).toUpperCase() + type.slice(1) : "Cultural"
          } Quiz${country ? ` for ${country}` : ""}`,
          reading: [
            `Welcome to the ${type || "cultural"} quiz${
              country ? ` about ${country}` : ""
            }!`,
            "Test your knowledge and learn something new about this fascinating topic.",
          ],
          quiz: formattedQuiz,
        },
      });
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError);
      console.error("Full error details:", JSON.stringify(geminiError, null, 2));

      // Fallback response matching expected structure
      const fallbackQuiz = Array.from(
        { length: questionCount || 10 },
        (_, i) => ({
          id: `q${i + 1}`,
          question: `Sample ${type || "cultural"} question ${i + 1}${
            country ? ` about ${country}` : ""
          }?`,
          options: [
            "Sample Answer A",
            "Sample Answer B",
            "Sample Answer C",
            "Sample Answer D",
          ],
          answer: 0,
          explanation:
            "This is a sample question due to API unavailability. Please try again later.",
        })
      );

      return NextResponse.json(
        {
          module: {
            country: country || "General",
            summary: `${
              type ? type.charAt(0).toUpperCase() + type.slice(1) : "Cultural"
            } Quiz${country ? ` for ${country}` : ""}`,
            reading: [
              "⚠️ Note: Using sample questions due to temporary API unavailability.",
              "Please try again in a few moments for AI-generated content.",
            ],
            quiz: fallbackQuiz,
          },
          warning: "Using fallback questions due to API error",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Learn & Earn generator error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate content",
      },
      { status: 500 }
    );
  }
}
