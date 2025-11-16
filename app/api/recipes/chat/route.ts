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