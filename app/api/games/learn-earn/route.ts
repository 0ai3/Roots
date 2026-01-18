import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Pre-generated fallback questions database
const FALLBACK_QUESTIONS: Record<string, Array<{
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}>> = {
  cultural: [
    { question: "Which festival is known as the 'Festival of Lights' in India?", options: ["Holi", "Diwali", "Navratri", "Pongal"], correctAnswer: 1, explanation: "Diwali, the Festival of Lights, celebrates the victory of light over darkness and is one of India's most important festivals.", points: 75 },
    { question: "What is the traditional Japanese tea ceremony called?", options: ["Ikebana", "Chado", "Origami", "Kabuki"], correctAnswer: 1, explanation: "Chado (or Sado) is the Japanese tea ceremony, a cultural activity involving the ceremonial preparation and presentation of matcha.", points: 100 },
    { question: "Which country is famous for the Day of the Dead celebration?", options: ["Spain", "Brazil", "Mexico", "Peru"], correctAnswer: 2, explanation: "Dia de los Muertos (Day of the Dead) is a Mexican holiday where families welcome back the souls of deceased relatives.", points: 50 },
    { question: "What is the traditional greeting gesture in Thailand?", options: ["Bow", "Handshake", "Wai", "Namaste"], correctAnswer: 2, explanation: "The Wai is a traditional Thai greeting performed by pressing palms together and bowing slightly.", points: 75 },
    { question: "Which country celebrates Carnival with the largest parade?", options: ["Italy", "Brazil", "USA", "Trinidad"], correctAnswer: 1, explanation: "Brazil's Rio Carnival is the world's largest carnival, attracting millions of visitors with its spectacular parades.", points: 50 },
    { question: "What is the significance of the Chinese New Year color red?", options: ["Wealth", "Good luck", "Health", "Wisdom"], correctAnswer: 1, explanation: "Red symbolizes good luck and fortune in Chinese culture, which is why it's prominently featured during New Year celebrations.", points: 75 },
    { question: "Which festival marks the end of Ramadan?", options: ["Eid al-Adha", "Eid al-Fitr", "Mawlid", "Ashura"], correctAnswer: 1, explanation: "Eid al-Fitr marks the end of Ramadan, the Islamic holy month of fasting, with prayers, feasts, and celebrations.", points: 100 },
    { question: "What is the traditional Scottish New Year celebration called?", options: ["Boxing Day", "Burns Night", "Hogmanay", "St. Andrew's Day"], correctAnswer: 2, explanation: "Hogmanay is the Scottish word for the last day of the year and is celebrated with traditions like first-footing.", points: 100 },
    { question: "In which country did the tradition of Christmas trees originate?", options: ["England", "Germany", "Norway", "Sweden"], correctAnswer: 1, explanation: "The Christmas tree tradition originated in Germany in the 16th century before spreading throughout Europe.", points: 75 },
    { question: "What does 'Namaste' mean in Hindi?", options: ["Hello", "I bow to you", "Welcome", "Peace"], correctAnswer: 1, explanation: "Namaste literally means 'I bow to you' and is a respectful greeting used in India and Nepal.", points: 50 },
  ],
  geography: [
    { question: "What is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correctAnswer: 1, explanation: "The Nile River, flowing through northeastern Africa, is approximately 6,650 km long, making it the world's longest river.", points: 75 },
    { question: "Which country has the most natural lakes?", options: ["USA", "Russia", "Canada", "Finland"], correctAnswer: 2, explanation: "Canada has over 60% of the world's lakes, with an estimated 2 million lakes covering about 9% of the country.", points: 100 },
    { question: "What is the smallest country in the world?", options: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"], correctAnswer: 2, explanation: "Vatican City is the smallest country in the world at only 0.44 square kilometers.", points: 50 },
    { question: "Which desert is the largest hot desert in the world?", options: ["Gobi", "Kalahari", "Sahara", "Arabian"], correctAnswer: 2, explanation: "The Sahara Desert in Africa is the world's largest hot desert, covering about 9 million square kilometers.", points: 50 },
    { question: "What is the highest mountain in Africa?", options: ["Mount Kenya", "Mount Kilimanjaro", "Mount Elgon", "Simien Mountains"], correctAnswer: 1, explanation: "Mount Kilimanjaro in Tanzania stands at 5,895 meters, making it Africa's highest peak.", points: 75 },
    { question: "Which ocean is the largest?", options: ["Atlantic", "Indian", "Pacific", "Arctic"], correctAnswer: 2, explanation: "The Pacific Ocean is the largest and deepest ocean, covering more than 30% of Earth's surface.", points: 50 },
    { question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Brisbane"], correctAnswer: 2, explanation: "Canberra is the capital of Australia, chosen as a compromise between Sydney and Melbourne.", points: 75 },
    { question: "Which country is known as the 'Land of the Rising Sun'?", options: ["China", "Korea", "Japan", "Vietnam"], correctAnswer: 2, explanation: "Japan is called the Land of the Rising Sun because it lies to the east of the Asian continent.", points: 50 },
    { question: "What is the deepest lake in the world?", options: ["Lake Superior", "Lake Baikal", "Lake Tanganyika", "Crater Lake"], correctAnswer: 1, explanation: "Lake Baikal in Russia is the deepest lake, reaching depths of 1,642 meters.", points: 100 },
    { question: "Which European country has the most volcanoes?", options: ["Greece", "Italy", "Iceland", "Spain"], correctAnswer: 2, explanation: "Iceland has around 130 volcanic mountains, with about 30 active volcano systems.", points: 100 },
  ],
  history: [
    { question: "In which year did World War II end?", options: ["1943", "1944", "1945", "1946"], correctAnswer: 2, explanation: "World War II ended in 1945 with Germany's surrender in May and Japan's surrender in September.", points: 50 },
    { question: "Who was the first person to walk on the Moon?", options: ["Buzz Aldrin", "Neil Armstrong", "Michael Collins", "John Glenn"], correctAnswer: 1, explanation: "Neil Armstrong became the first human to walk on the Moon on July 20, 1969, during the Apollo 11 mission.", points: 50 },
    { question: "Which ancient wonder was located in Alexandria?", options: ["Hanging Gardens", "Colossus", "Lighthouse", "Mausoleum"], correctAnswer: 2, explanation: "The Lighthouse of Alexandria (Pharos) was one of the Seven Wonders of the Ancient World.", points: 100 },
    { question: "What year did the Berlin Wall fall?", options: ["1987", "1988", "1989", "1990"], correctAnswer: 2, explanation: "The Berlin Wall fell on November 9, 1989, marking a turning point in the end of the Cold War.", points: 75 },
    { question: "Who painted the ceiling of the Sistine Chapel?", options: ["Leonardo da Vinci", "Raphael", "Michelangelo", "Donatello"], correctAnswer: 2, explanation: "Michelangelo painted the Sistine Chapel ceiling between 1508 and 1512, commissioned by Pope Julius II.", points: 75 },
    { question: "Which empire built Machu Picchu?", options: ["Aztec", "Maya", "Inca", "Olmec"], correctAnswer: 2, explanation: "Machu Picchu was built by the Inca Empire in the 15th century as an estate for Emperor Pachacuti.", points: 75 },
    { question: "In what year was the United Nations founded?", options: ["1943", "1945", "1947", "1950"], correctAnswer: 1, explanation: "The United Nations was founded in 1945 after World War II to promote international cooperation.", points: 100 },
    { question: "Who was the first female Prime Minister of the UK?", options: ["Theresa May", "Margaret Thatcher", "Elizabeth II", "Queen Victoria"], correctAnswer: 1, explanation: "Margaret Thatcher became the UK's first female Prime Minister in 1979, serving until 1990.", points: 75 },
    { question: "What was the name of the ship that sank in 1912?", options: ["Lusitania", "Olympic", "Titanic", "Britannic"], correctAnswer: 2, explanation: "The RMS Titanic sank on April 15, 1912, after hitting an iceberg during her maiden voyage.", points: 50 },
    { question: "Which civilization built the Great Wall of China?", options: ["Ming Dynasty", "Multiple dynasties", "Qin Dynasty", "Han Dynasty"], correctAnswer: 1, explanation: "The Great Wall was built over many centuries by multiple Chinese dynasties, starting with the Qin Dynasty.", points: 100 },
  ],
  language: [
    { question: "How many official languages does Switzerland have?", options: ["2", "3", "4", "5"], correctAnswer: 2, explanation: "Switzerland has four official languages: German, French, Italian, and Romansh.", points: 100 },
    { question: "Which language has the most native speakers?", options: ["English", "Spanish", "Mandarin Chinese", "Hindi"], correctAnswer: 2, explanation: "Mandarin Chinese has the most native speakers, with over 900 million people.", points: 75 },
    { question: "What is the official language of Brazil?", options: ["Spanish", "Portuguese", "Brazilian", "English"], correctAnswer: 1, explanation: "Portuguese is the official language of Brazil, brought by Portuguese colonizers in the 16th century.", points: 50 },
    { question: "Which alphabet does Russian use?", options: ["Latin", "Greek", "Cyrillic", "Arabic"], correctAnswer: 2, explanation: "Russian uses the Cyrillic alphabet, which was developed in the First Bulgarian Empire in the 9th century.", points: 75 },
    { question: "What does 'Bonjour' mean in French?", options: ["Goodbye", "Good night", "Hello/Good day", "Thank you"], correctAnswer: 2, explanation: "Bonjour means 'Hello' or 'Good day' in French, from 'bon' (good) and 'jour' (day).", points: 50 },
    { question: "Which language family does Japanese belong to?", options: ["Sino-Tibetan", "Altaic", "Japonic", "Indo-European"], correctAnswer: 2, explanation: "Japanese belongs to the Japonic language family, which also includes Ryukyuan languages.", points: 100 },
    { question: "How do you say 'Thank you' in German?", options: ["Bitte", "Danke", "Guten Tag", "Auf Wiedersehen"], correctAnswer: 1, explanation: "Danke means 'Thank you' in German. 'Danke schon' means 'Thank you very much'.", points: 50 },
    { question: "Which country has 22 official languages?", options: ["China", "India", "Indonesia", "South Africa"], correctAnswer: 1, explanation: "India has 22 officially recognized languages under the Eighth Schedule of its Constitution.", points: 100 },
    { question: "What writing direction does Arabic use?", options: ["Left to right", "Right to left", "Top to bottom", "Bottom to top"], correctAnswer: 1, explanation: "Arabic is written from right to left, one of the few major world languages with this direction.", points: 75 },
    { question: "Which language is 'Gracias' from?", options: ["Italian", "Portuguese", "Spanish", "French"], correctAnswer: 2, explanation: "Gracias is the Spanish word for 'Thank you', derived from the Latin 'gratia'.", points: 50 },
  ],
  tradition: [
    { question: "What is the traditional Japanese art of flower arranging called?", options: ["Origami", "Ikebana", "Bonsai", "Chado"], correctAnswer: 1, explanation: "Ikebana is the Japanese art of flower arrangement, emphasizing balance, harmony, and form.", points: 75 },
    { question: "Which country is famous for the tradition of Flamenco?", options: ["Portugal", "Mexico", "Spain", "Argentina"], correctAnswer: 2, explanation: "Flamenco originated in Andalusia, Spain, combining singing, guitar playing, dance, and handclaps.", points: 50 },
    { question: "What is the traditional Hawaiian greeting with flowers called?", options: ["Aloha", "Lei", "Hula", "Luau"], correctAnswer: 1, explanation: "A Lei is a Hawaiian garland of flowers traditionally given as a symbol of affection and greeting.", points: 75 },
    { question: "In which country did the tradition of afternoon tea originate?", options: ["China", "Japan", "England", "India"], correctAnswer: 2, explanation: "Afternoon tea was introduced in England in the 1840s by Anna, the Duchess of Bedford.", points: 75 },
    { question: "What is the traditional Korean fermented vegetable dish?", options: ["Sushi", "Kimchi", "Tempura", "Pho"], correctAnswer: 1, explanation: "Kimchi is a traditional Korean side dish of salted and fermented vegetables, usually cabbage or radish.", points: 50 },
    { question: "Which culture practices the 'Quinceañera' celebration?", options: ["Brazilian", "Mexican/Latin American", "Spanish", "Portuguese"], correctAnswer: 1, explanation: "Quinceañera is a Latin American tradition celebrating a girl's 15th birthday as her transition to womanhood.", points: 75 },
    { question: "What is the traditional Scottish musical instrument?", options: ["Violin", "Bagpipes", "Accordion", "Harp"], correctAnswer: 1, explanation: "The Great Highland Bagpipe is Scotland's national instrument, used in traditional music and ceremonies.", points: 50 },
    { question: "Which tradition involves throwing colored powder during spring?", options: ["Carnival", "Holi", "Songkran", "Mardi Gras"], correctAnswer: 1, explanation: "Holi is the Hindu festival of colors celebrated in spring, where people throw colored powder and water.", points: 75 },
    { question: "What is the traditional Maori greeting from New Zealand?", options: ["Handshake", "Bow", "Hongi", "Wave"], correctAnswer: 2, explanation: "The Hongi is the traditional Maori greeting where two people press their noses and foreheads together.", points: 100 },
    { question: "Which culture is known for the tradition of Feng Shui?", options: ["Japanese", "Chinese", "Korean", "Vietnamese"], correctAnswer: 1, explanation: "Feng Shui is an ancient Chinese practice of arranging space to achieve harmony with the environment.", points: 75 },
  ],
  speed: [
    { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Rome"], correctAnswer: 2, explanation: "Paris is the capital and largest city of France.", points: 25 },
    { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correctAnswer: 1, explanation: "Mars is called the Red Planet due to iron oxide on its surface.", points: 25 },
    { question: "How many continents are there?", options: ["5", "6", "7", "8"], correctAnswer: 2, explanation: "There are 7 continents: Africa, Antarctica, Asia, Australia, Europe, North America, and South America.", points: 25 },
    { question: "What is the largest mammal?", options: ["Elephant", "Blue Whale", "Giraffe", "Hippo"], correctAnswer: 1, explanation: "The Blue Whale is the largest mammal, reaching up to 100 feet in length.", points: 25 },
    { question: "Which element has the chemical symbol 'O'?", options: ["Gold", "Silver", "Oxygen", "Iron"], correctAnswer: 2, explanation: "Oxygen has the chemical symbol O and is essential for life.", points: 25 },
    { question: "What year did the Titanic sink?", options: ["1910", "1912", "1914", "1916"], correctAnswer: 1, explanation: "The Titanic sank on April 15, 1912.", points: 25 },
    { question: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], correctAnswer: 1, explanation: "A hexagon has 6 sides. 'Hex' comes from the Greek word for six.", points: 25 },
    { question: "What is the currency of Japan?", options: ["Won", "Yuan", "Yen", "Ringgit"], correctAnswer: 2, explanation: "The Yen is Japan's official currency.", points: 25 },
    { question: "Who wrote 'Romeo and Juliet'?", options: ["Dickens", "Shakespeare", "Austen", "Hemingway"], correctAnswer: 1, explanation: "William Shakespeare wrote Romeo and Juliet around 1594-1596.", points: 25 },
    { question: "What is the largest ocean?", options: ["Atlantic", "Indian", "Pacific", "Arctic"], correctAnswer: 2, explanation: "The Pacific Ocean is the largest, covering about 63 million square miles.", points: 25 },
  ],
};

function generateFallbackQuestions(country: string | undefined, type: string, questionCount: number, difficulty: string) {
  const category = type || 'cultural';
  const questions = FALLBACK_QUESTIONS[category] || FALLBACK_QUESTIONS.cultural;
  
  // Shuffle and pick requested number of questions
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(questionCount || 10, questions.length));
  
  const formattedQuiz = selected.map((q, index) => ({
    id: `q${index + 1}`,
    question: q.question,
    options: q.options,
    answer: q.correctAnswer,
    explanation: q.explanation,
  }));

  return NextResponse.json({
    module: {
      country: country || "General",
      summary: `${category.charAt(0).toUpperCase() + category.slice(1)} Quiz${country ? ` for ${country}` : ""}`,
      reading: [
        `Welcome to the ${category} quiz!`,
        "Test your knowledge and learn something new about world cultures.",
      ],
      quiz: formattedQuiz,
    },
  });
}

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

    // Try models in order of preference - updated for 2026
    const modelsToTry = [
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash-8b",
      "gemini-1.5-flash",
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
      // Return fallback questions instead of throwing error
      return generateFallbackQuestions(country, type, questionCount, difficulty);
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
