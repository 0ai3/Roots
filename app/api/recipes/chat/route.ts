import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response("Missing API key", { status: 500 });
  }

  const body = await req.json();
  const { messages } = body;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: messages.map((msg: { content: string }) => ({ parts: [{ text: msg.content }] })),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100,
        topP: 1,
      },
    }),
  });

  if (!response.ok) {
    return new Response("Error generating response", { status: 500 });
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

  return NextResponse.json({ response: text });
}