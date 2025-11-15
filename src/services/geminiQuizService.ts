import { GoogleGenerativeAI } from '@google/generative-ai';

// Access the API key - it will be injected at build time or from environment
const API_KEY = import.meta.env.GEMINI_API_KEY ; // Hardcoded as fallback since process.env won't work in browser
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

Make questions engaging and educational. Include cultures from Africa, Asia, Europe, Americas, and Oceania.`,
  
  geography: `Create {count} multiple choice geography quiz questions.

Topics to cover:
- World capitals and major cities
- Famous landmarks and monuments
- Countries, continents, and their locations
- Rivers, mountains, and natural wonders
- Flags and geographic features

Mix easy identification questions with interesting geographic facts.`,
  
  tradition: `Create {count} multiple choice questions about matching cultural traditions to their origins.

Focus on:
- Traditional dances and their countries of origin
- Cultural festivals and where they're celebrated
- Ancient ceremonies and rituals
- Wedding and celebration customs
- Folk traditions and their homelands

Questions should test knowledge of which country or region practices each tradition.`,
  
  language: `Create {count} multiple choice questions about basic phrases in world languages.

Include:
- Common greetings (hello, goodbye, thank you)
- Basic expressions (yes, no, please, sorry)
- Simple phrases in different languages (French, Spanish, Japanese, Arabic, German, Italian, Chinese, etc.)
- Translations and meanings
- Pronunciation hints when relevant

Make questions accessible for beginners learning new languages.`,
  
  history: `Create {count} multiple choice questions about world history and chronology.

Topics:
- Major historical events and their dates
- Chronological order of important moments
- Ancient civilizations and their time periods
- Wars, revolutions, and their outcomes
- Historical figures and their eras
- Significant inventions and discoveries

Questions can ask about dates, sequences, or historical facts.`,
  
  speed: `Create {count} quick, simple general knowledge questions for a fast-paced quiz.

Requirements:
- Questions should be answerable in 5-10 seconds
- Cover world cultures, geography, and famous landmarks
- Keep options clear and straightforward
- Mix easy and medium difficulty
- Topics: capitals, flags, famous buildings, basic cultural facts

Make questions fun and suitable for rapid-fire answering.`
};

export async function generateQuiz(config: QuizConfig): Promise<QuizQuestion[]> {
  // Try API first, fallback immediately on error
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
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
