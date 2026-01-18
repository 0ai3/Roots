import { NextResponse } from "next/server";

// Available Gemini models to try in order of preference
const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite", 
];

// Fallback recipes database by country/region
const FALLBACK_RECIPES: Record<string, Array<{
  name: string;
  description: string;
  region: string;
  keyIngredients: string[];
  difficulty: string;
  culturalNote: string;
}>> = {
  "italy": [
    { name: "Pasta Carbonara", description: "Creamy Roman pasta with eggs, pecorino cheese, guanciale, and black pepper.", region: "Lazio, Rome", keyIngredients: ["spaghetti", "guanciale", "eggs", "pecorino romano", "black pepper"], difficulty: "Medium", culturalNote: "Authentic carbonara never uses cream - the creaminess comes from the egg and cheese emulsion." },
    { name: "Risotto alla Milanese", description: "Golden saffron-infused rice from Milan, creamy and aromatic.", region: "Lombardy, Milan", keyIngredients: ["arborio rice", "saffron", "beef broth", "butter", "parmesan", "white wine"], difficulty: "Medium", culturalNote: "The golden color comes from precious saffron, once worth more than gold." },
    { name: "Tiramisu", description: "Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream.", region: "Veneto", keyIngredients: ["mascarpone", "ladyfingers", "espresso", "eggs", "cocoa powder"], difficulty: "Easy", culturalNote: "Tiramisu means 'pick me up' in Italian, referring to the coffee and sugar boost." },
  ],
  "japan": [
    { name: "Ramen", description: "Rich noodle soup with various toppings, featuring complex umami broth.", region: "Tokyo/Nationwide", keyIngredients: ["ramen noodles", "pork belly", "soft-boiled egg", "nori", "green onions", "broth"], difficulty: "Hard", culturalNote: "Each region in Japan has its own distinct ramen style and broth base." },
    { name: "Sushi Rolls", description: "Fresh fish and vegetables wrapped in seasoned rice and nori seaweed.", region: "Tokyo", keyIngredients: ["sushi rice", "nori", "fresh fish", "rice vinegar", "wasabi", "soy sauce"], difficulty: "Medium", culturalNote: "Sushi originated as a way to preserve fish in fermented rice." },
    { name: "Tonkatsu", description: "Crispy breaded and deep-fried pork cutlet served with tangy sauce.", region: "Tokyo", keyIngredients: ["pork loin", "panko breadcrumbs", "eggs", "cabbage", "tonkatsu sauce"], difficulty: "Easy", culturalNote: "Tonkatsu became popular in the late 19th century during Japan's Westernization." },
  ],
  "mexico": [
    { name: "Tacos al Pastor", description: "Marinated pork tacos with pineapple, inspired by Lebanese immigrants.", region: "Mexico City", keyIngredients: ["pork shoulder", "achiote paste", "pineapple", "corn tortillas", "onion", "cilantro"], difficulty: "Medium", culturalNote: "The vertical spit cooking method was brought by Lebanese immigrants in the early 1900s." },
    { name: "Mole Poblano", description: "Complex sauce with chocolate and chilies, served over turkey or chicken.", region: "Puebla", keyIngredients: ["dried chilies", "chocolate", "almonds", "sesame seeds", "spices", "chicken"], difficulty: "Hard", culturalNote: "Mole contains over 20 ingredients and takes days to prepare traditionally." },
    { name: "Guacamole", description: "Fresh avocado dip with lime, cilantro, and tomatoes.", region: "Nationwide", keyIngredients: ["avocados", "lime juice", "cilantro", "onion", "jalapeño", "tomatoes"], difficulty: "Easy", culturalNote: "The Aztecs made the first guacamole, calling it 'ahuaca-mulli' (avocado sauce)." },
  ],
  "india": [
    { name: "Butter Chicken", description: "Creamy tomato-based curry with tender chicken pieces.", region: "Punjab, Delhi", keyIngredients: ["chicken", "tomatoes", "butter", "cream", "garam masala", "ginger-garlic"], difficulty: "Medium", culturalNote: "Invented in 1950s Delhi by adding leftover tandoori chicken to a tomato gravy." },
    { name: "Biryani", description: "Fragrant layered rice dish with spiced meat and aromatic herbs.", region: "Hyderabad", keyIngredients: ["basmati rice", "lamb or chicken", "saffron", "yogurt", "fried onions", "whole spices"], difficulty: "Hard", culturalNote: "Hyderabadi biryani uses the 'dum' technique - slow cooking in a sealed pot." },
    { name: "Samosas", description: "Crispy pastries filled with spiced potatoes and peas.", region: "Nationwide", keyIngredients: ["potatoes", "peas", "cumin", "coriander", "pastry dough", "green chilies"], difficulty: "Medium", culturalNote: "Samosas traveled from Central Asia to India in the 13th century." },
  ],
  "france": [
    { name: "Coq au Vin", description: "Chicken braised in red wine with mushrooms, bacon, and pearl onions.", region: "Burgundy", keyIngredients: ["chicken", "red wine", "mushrooms", "bacon lardons", "pearl onions", "thyme"], difficulty: "Medium", culturalNote: "This peasant dish became haute cuisine when Julia Child popularized it in America." },
    { name: "Croissants", description: "Flaky, buttery crescent-shaped pastries with layers.", region: "Paris/Nationwide", keyIngredients: ["flour", "butter", "yeast", "milk", "sugar", "salt"], difficulty: "Hard", culturalNote: "Despite being a French icon, croissants originated in Vienna, Austria." },
    { name: "Ratatouille", description: "Provençal vegetable stew with eggplant, zucchini, and tomatoes.", region: "Provence", keyIngredients: ["eggplant", "zucchini", "tomatoes", "bell peppers", "olive oil", "herbs de Provence"], difficulty: "Easy", culturalNote: "Originally a poor farmer's dish, now celebrated as refined cuisine." },
  ],
  "default": [
    { name: "Grilled Chicken", description: "Seasoned and perfectly grilled chicken with herbs.", region: "International", keyIngredients: ["chicken", "olive oil", "garlic", "herbs", "lemon", "salt"], difficulty: "Easy", culturalNote: "Grilling is one of the oldest cooking methods, used worldwide." },
    { name: "Vegetable Stir Fry", description: "Quick-cooked fresh vegetables in a savory sauce.", region: "Asian-inspired", keyIngredients: ["mixed vegetables", "soy sauce", "garlic", "ginger", "sesame oil", "rice"], difficulty: "Easy", culturalNote: "Stir frying originated in China over 2000 years ago." },
    { name: "Fresh Salad", description: "Mixed greens with seasonal vegetables and vinaigrette.", region: "Mediterranean", keyIngredients: ["mixed greens", "tomatoes", "cucumber", "olive oil", "vinegar", "feta cheese"], difficulty: "Easy", culturalNote: "Salads have been enjoyed since ancient Roman times." },
  ]
};

function getFallbackRecipes(country?: string): string {
  const normalizedCountry = (country || "").toLowerCase().trim();
  
  // Find matching recipes
  let recipes = FALLBACK_RECIPES["default"];
  for (const key of Object.keys(FALLBACK_RECIPES)) {
    if (normalizedCountry.includes(key) || key.includes(normalizedCountry)) {
      recipes = FALLBACK_RECIPES[key];
      break;
    }
  }

  const response = `🍳 **Here are 3 delicious recipes for you to choose from:**

**1. ${recipes[0].name}**
${recipes[0].description}
- 📍 Region: ${recipes[0].region}
- 🥘 Key Ingredients: ${recipes[0].keyIngredients.join(", ")}
- ⭐ Difficulty: ${recipes[0].difficulty}
- 📖 Cultural Note: ${recipes[0].culturalNote}

---

**2. ${recipes[1].name}**
${recipes[1].description}
- 📍 Region: ${recipes[1].region}
- 🥘 Key Ingredients: ${recipes[1].keyIngredients.join(", ")}
- ⭐ Difficulty: ${recipes[1].difficulty}
- 📖 Cultural Note: ${recipes[1].culturalNote}

---

**3. ${recipes[2].name}**
${recipes[2].description}
- 📍 Region: ${recipes[2].region}
- 🥘 Key Ingredients: ${recipes[2].keyIngredients.join(", ")}
- ⭐ Difficulty: ${recipes[2].difficulty}
- 📖 Cultural Note: ${recipes[2].culturalNote}

---

**Which recipe would you like me to prepare detailed instructions for?** Just tell me the number (1, 2, or 3) or the name of the dish!`;

  return response;
}

async function tryGeminiModel(
  model: string,
  apiKey: string,
  formattedHistory: Array<{ role: string; parts: Array<{ text: string }> }>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: formattedHistory,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 8000,
          topP: 0.95,
          topK: 40,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Model ${model} failed:`, response.status, errorText);
      return { success: false, error: errorText };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.log(`Model ${model} threw error:`, error);
    return { success: false, error: String(error) };
  }
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing API key" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { conversationHistory, userMessage, country, zone, dietaryFocus, notes } = body;

    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return NextResponse.json(
        { error: "Conversation history is required" },
        { status: 400 }
      );
    }

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json(
        { error: "User message is required" },
        { status: 400 }
      );
    }

    // Build context-aware prompt
    const systemInstructions = `You are an expert chef specializing in ${country || 'international'} cuisine${zone ? ` from the ${zone} region` : ''}. 
${dietaryFocus ? `The user follows a ${dietaryFocus} diet.` : ''}
${notes ? `Additional preferences: ${notes}` : ''}

IMPORTANT: Your role is to suggest exactly 3 recipe options based on the user's request.

For EACH recipe, provide ONLY:
- Recipe name
- Brief description (1-2 sentences)
- Region/origin
- Key ingredients list (5-7 main items, no measurements)
- Difficulty level (Easy/Medium/Hard)
- A short cultural note about the dish

DO NOT include detailed instructions, measurements, or cooking steps at this stage.
The user will select ONE recipe, and then you'll provide the complete detailed recipe.

Format your response as a friendly chef suggesting 3 options to choose from.`;

    const contextParts = [];
    if (country) contextParts.push(`Country: ${country}`);
    if (zone) contextParts.push(`Region: ${zone}`);
    if (dietaryFocus) contextParts.push(`Dietary Focus: ${dietaryFocus}`);
    if (notes) contextParts.push(`Notes: ${notes}`);
    
    const contextString = contextParts.length > 0 
      ? `\n\nContext:\n${contextParts.join('\n')}` 
      : '';

    // Format conversation history for Gemini
    const formattedHistory = [];
    
    // Add system instructions as the first user message if conversation is starting
    if (conversationHistory.length === 0) {
      formattedHistory.push({
        role: 'user',
        parts: [{ text: systemInstructions }]
      });
      formattedHistory.push({
        role: 'model',
        parts: [{ text: 'I understand. I will suggest 3 recipe options for you to choose from. Once you select one, I will provide the complete detailed recipe with measurements, temperatures, and step-by-step instructions. How can I help you today?' }]
      });
    }
    
    // Add conversation history
    conversationHistory.forEach((msg: { role: string; content: string }) => {
      formattedHistory.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });

    // Add current user message
    formattedHistory.push({
      role: 'user',
      parts: [{ text: `${userMessage}${contextString}` }]
    });

    // Try each model until one works
    let data = null;
    let lastError = '';
    
    for (const model of GEMINI_MODELS) {
      console.log(`Trying Gemini model: ${model}`);
      const result = await tryGeminiModel(model, apiKey, formattedHistory);
      
      if (result.success) {
        console.log(`Success with model: ${model}`);
        data = result.data;
        break;
      }
      lastError = result.error || 'Unknown error';
    }

    if (!data) {
      console.log("All Gemini models failed, using fallback recipes");
      // Use fallback recipes instead of returning error
      const fallbackContent = getFallbackRecipes(country);
      return NextResponse.json({ 
        content: fallbackContent,
        warning: "Using pre-generated recipes (AI temporarily unavailable)"
      });
    }

    // Extract text from response - handle both thinking and non-thinking models
    const parts = (data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }).candidates?.[0]?.content?.parts;
    
    if (!parts || parts.length === 0) {
      console.error("No parts in Gemini response:", JSON.stringify(data));
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }
    
    // Find the first part with text (skip thinking parts)
    let text = '';
    for (const part of parts) {
      if (part.text && part.text.trim()) {
        text = part.text;
        break;
      }
    }
    
    if (!text) {
      console.error("No text found in any part. Response:", JSON.stringify(data));
      return NextResponse.json(
        { error: "AI did not generate a text response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ content: text });
  } catch (error) {
    console.error("Recipe chat error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}