import { GoogleGenerativeAI } from '@google/generative-ai';

// Access the API key from Vite's environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
}

export interface QuizConfig {
  type: 'cultural' | 'geography' | 'tradition' | 'language' | 'history' | 'speed';
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
}

const prompts = {
  cultural: `Create {count} multiple choice quiz questions about world cultures and traditions.

Topics to cover:
- Traditional festivals and celebrations from different countries
- Cultural customs and etiquette practices
- National symbols, clothing, and traditional arts
- Religious and spiritual practices worldwide
- Food traditions and culinary heritage
- Traditional music and instruments
- Cultural ceremonies and rituals

Format questions like:
- "Which country celebrates [festival name]?"
- "What is the traditional clothing called in [country]?"
- "Which culture practices [custom]?"

Include cultures from Africa, Asia, Europe, Americas, and Oceania.`,
  
  geography: `Create {count} multiple choice geography quiz questions focused on NEIGHBORS and LOCATIONS.

Question types (mix these):
1. Neighboring countries: "Which country borders [Country X] to the north?"
2. Geographic regions: "Which countries share a border with [Country]?"
3. Island nations: "Which country is [Island] part of?"
4. Landlocked countries: "Which of these countries does NOT border [Country]?"
5. Continents: "On which continent is [Country] located?"
6. Capitals and borders: "Which capital city is closest to [Country]'s border?"
7. Bodies of water: "Which sea/ocean borders [Country]?"

Focus on:
- Direct neighboring countries
- Regional geography
- Border relationships
- Continental locations
- Geographic proximity

Examples:
- "Which country does NOT border Germany?" (Make sure one option is NOT a neighbor)
- "Which of these countries shares a border with Brazil?"
- "What country lies directly south of France?"`,
  
  tradition: `Create {count} multiple choice questions about matching SPECIFIC cultural traditions to their countries of origin.

Question format:
"In which country is [SPECIFIC TRADITION] practiced?"
OR
"The tradition of [TRADITION NAME] originates from which country?"

Focus on:
- Traditional dances and their exact origin (e.g., "Haka war dance - New Zealand")
- Specific festivals (e.g., "La Tomatina - Spain")
- Wedding customs (e.g., "Breaking glass at weddings - Jewish tradition")
- Coming-of-age ceremonies (e.g., "Quinceañera - Latin America")
- Religious rituals (e.g., "Hanami cherry blossom viewing - Japan")
- Folk traditions (e.g., "Sauna culture - Finland")
- Traditional sports (e.g., "Sumo wrestling - Japan")

Be SPECIFIC - use actual tradition names, not generic descriptions.
Include traditions from diverse regions: Asia, Africa, Europe, Americas, Middle East, Oceania.`,
  
  language: `Create {count} multiple choice questions about basic phrases in world languages.

Include:
- Common greetings in specific languages:
  * "How do you say 'Hello' in Japanese?" → "Konnichiwa"
  * "What does 'Bonjour' mean?" → "Hello/Good day"
  
- Basic expressions with translations:
  * "Gracias" in Spanish means...
  * How to say "Thank you" in Arabic...
  
- Multiple language comparisons:
  * "Which language uses 'Namaste' as a greeting?"
  * "In which language is 'Ciao' used?"

Languages to include: French, Spanish, Japanese, Arabic, German, Italian, Chinese (Mandarin), 
Russian, Portuguese, Hindi, Korean, Dutch, Swedish, Turkish, Greek

Make questions practical and beginner-friendly.`,
  
  history: `Create {count} multiple choice questions about world history and chronology.

Topics:
- Historical events with SPECIFIC DATES:
  * "In which year did [event] occur?"
  * "What happened in [year]?"
  
- Chronological ordering:
  * "Which event happened FIRST?"
  * "Put these events in chronological order"
  
- Historical periods:
  * "During which century did [event] take place?"
  * "What era was characterized by [description]?"
  
- Historical figures and their times:
  * "When did [historical figure] live?"
  * "Which event occurred during [person]'s lifetime?"

- Major wars and revolutions with dates
- Ancient civilizations and their time periods
- Significant inventions and discoveries with years

Be SPECIFIC with dates and sequences. Include global history, not just Western.`,
  
  speed: `Create {count} QUICK, SIMPLE general knowledge questions for a fast-paced speed quiz.

Requirements:
- Questions answerable in 5-10 seconds
- Clear, unambiguous answers
- No complex reasoning needed
- Mix of easy and medium difficulty

Question types:
1. Capital cities: "What is the capital of [country]?"
2. Famous landmarks: "Where is [landmark] located?"
3. Flags: "Which country has a [color/symbol] flag?"
4. Basic geography: "Which continent is [country] in?"
5. Famous leaders: "Who is/was the leader of [country]?"
6. Languages: "What language is spoken in [country]?"
7. Currencies: "What is the currency of [country]?"
8. Quick facts: "Which country is known for [thing]?"

Keep it fun and rapid-fire suitable!`
};

export async function generateQuiz(config: QuizConfig): Promise<QuizQuestion[]> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash', // Use stable model
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });
    
    const basePrompt = prompts[config.type].replace('{count}', config.questionCount.toString());
    
    const pointsRange = config.difficulty === 'easy' ? '20-100' : 
                       config.difficulty === 'medium' ? '50-200' : '100-400';
    
    const fullPrompt = `${basePrompt}

CRITICAL FORMATTING RULES:
1. Return ONLY a valid JSON array
2. Start with [ and end with ]
3. Use double quotes for all strings
4. Separate objects with commas
5. No trailing commas
6. No comments in JSON
7. No markdown, no code blocks, no extra text before or after

Difficulty: ${config.difficulty}
Points range: ${pointsRange}

Exact JSON structure to follow:
[
  {
    "question": "Question text here?",
    "options": ["First option", "Second option", "Third option", "Fourth option"],
    "correctAnswer": 0,
    "explanation": "Explanation text here",
    "points": 50
  }
]

Generate exactly ${config.questionCount} questions. Return only the JSON array:`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let text = response.text();
    
    if (!text || text.trim().length === 0) {
      console.warn('Empty response from Gemini API');
      throw new Error('Empty response');
    }
    
    // Aggressive cleaning
    text = text.trim();
    
    // Remove markdown code blocks
    text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
    
    // Remove any text before first [
    const startIndex = text.indexOf('[');
    if (startIndex === -1) {
      console.error('No JSON array start found');
      throw new Error('No valid JSON');
    }
    text = text.substring(startIndex);
    
    // Remove any text after last ]
    const endIndex = text.lastIndexOf(']');
    if (endIndex === -1) {
      console.error('No JSON array end found');
      throw new Error('No valid JSON');
    }
    text = text.substring(0, endIndex + 1);
    
    // Fix common JSON issues
    text = text.replace(/,\s*}/g, '}'); // Remove trailing commas in objects
    text = text.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
    text = text.replace(/\n/g, ' '); // Remove newlines
    text = text.replace(/\r/g, ''); // Remove carriage returns
    
    console.log('Cleaned JSON:', text.substring(0, 200) + '...');
    
    const questions = JSON.parse(text);
    
    if (!Array.isArray(questions) || questions.length === 0) {
      console.error('Parsed result is not a valid array');
      throw new Error('Invalid format');
    }
    
    // Validate and normalize each question
    const validatedQuestions = questions.slice(0, config.questionCount).map((q, index) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
        console.warn(`Invalid question at index ${index}:`, q);
        throw new Error(`Invalid question structure`);
      }
      
      return {
        question: String(q.question).trim(),
        options: q.options.map((opt: string) => String(opt).trim()),
        correctAnswer: Math.max(0, Math.min(3, Number(q.correctAnswer) || 0)),
        explanation: String(q.explanation || 'No explanation provided').trim(),
        points: Number(q.points) || 50
      };
    });
    
    console.log(`Successfully generated ${validatedQuestions.length} questions`);
    return validatedQuestions;
    
  } catch (error) {
    console.error('Error generating quiz, using fallback:', error);
    return getFallbackQuestions(config);
  }
}

function getFallbackQuestions(config: QuizConfig): QuizQuestion[] {
  const fallbacks: Record<string, QuizQuestion[]> = {
    cultural: [
      {
        question: "Which festival is known as the 'Festival of Lights' in India?",
        options: ["Holi", "Diwali", "Eid", "Navratri"],
        correctAnswer: 1,
        explanation: "Diwali is celebrated by lighting lamps and candles to symbolize the victory of light over darkness.",
        points: 50
      }
    ],
    geography: [
      {
        question: "What is the capital of Japan?",
        options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
        correctAnswer: 2,
        explanation: "Tokyo is the capital and largest city of Japan.",
        points: 30
      }
    ],
    tradition: [
      {
        question: "Which country is famous for the traditional dance 'Flamenco'?",
        options: ["Italy", "Spain", "Portugal", "Greece"],
        correctAnswer: 1,
        explanation: "Flamenco originated in the Andalusia region of Spain.",
        points: 100
      }
    ],
    language: [
      {
        question: "What does 'Bonjour' mean in French?",
        options: ["Goodbye", "Hello", "Thank you", "Please"],
        correctAnswer: 1,
        explanation: "Bonjour is a common French greeting meaning 'hello' or 'good day'.",
        points: 75
      }
    ],
    history: [
      {
        question: "In which year did World War II end?",
        options: ["1943", "1944", "1945", "1946"],
        correctAnswer: 2,
        explanation: "World War II ended in 1945 with the surrender of Japan.",
        points: 150
      }
    ],
    speed: [
      {
        question: "Which continent is known as the 'Dark Continent'?",
        options: ["Asia", "Africa", "South America", "Australia"],
        correctAnswer: 1,
        explanation: "Africa was historically called the 'Dark Continent' by European explorers.",
        points: 20
      }
    ]
  };
  
  // Return repeated fallback questions to match count
  const baseQuestions = fallbacks[config.type] || fallbacks.cultural;
  const questions: QuizQuestion[] = [];
  
  for (let i = 0; i < config.questionCount; i++) {
    questions.push(baseQuestions[i % baseQuestions.length]);
  }
  
  return questions;
}
