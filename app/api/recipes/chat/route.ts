import { NextResponse } from "next/server";

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

    // Build context-aware prompt with detailed recipe instructions
    const systemInstructions = `You are an expert chef specializing in ${country || 'international'} cuisine${zone ? ` from the ${zone} region` : ''}. 
${dietaryFocus ? `The user follows a ${dietaryFocus} diet.` : ''}
${notes ? `Additional preferences: ${notes}` : ''}

IMPORTANT: When providing recipes, ALWAYS include:

# Recipe Format:
For each recipe, provide:

## Recipe Name

# Ingredients (with exact measurements):
- Each ingredient with precise amounts in grams (g), milliliters (ml), or standard units
- Example: "500g chicken breast", "250ml milk", "2 tablespoons olive oil (30ml)"
- Always specify serving size (e.g., "Serves 4 people")

# Instructions (detailed step-by-step):
1. Number each step clearly
2. Include cooking times and temperatures (e.g., "Bake at 180°C for 25 minutes")
3. Describe techniques clearly (e.g., "Sauté over medium heat until golden")
4. Include visual cues (e.g., "until the edges are crispy", "until it thickens")

# Cooking Tips:
- Include helpful tips about timing, substitutions, or variations
- Mention common mistakes to avoid

Be conversational and helpful, but always include precise measurements and detailed cooking instructions.`;

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
        parts: [{ text: 'I understand. I will provide detailed recipes with precise measurements in grams/ml, cooking temperatures, times, and step-by-step instructions. How can I help you today?' }]
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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
          responseModalities: ["TEXT"],
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Error generating response" },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // Extract text from response - handle both thinking and non-thinking models
    const parts = data.candidates?.[0]?.content?.parts;
    
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