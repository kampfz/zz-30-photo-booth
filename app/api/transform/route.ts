import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { IMAGE_MODEL, STYLE_PROMPT } from "@/lib/style";

export const runtime = "nodejs";
export const maxDuration = 60;

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Photo booth is not set up yet. GEMINI_API_KEY is missing on the server." },
      { status: 500 },
    );
  }

  let body: { image?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "That request was not valid JSON." }, { status: 400 });
  }

  if (!body.image) {
    return NextResponse.json({ error: "No photo was sent. Try uploading or taking one again." }, { status: 400 });
  }

  const parsed = parseDataUrl(body.image);
  if (!parsed) {
    return NextResponse.json({ error: "That photo format was not recognized. Try a JPG or PNG." }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: STYLE_PROMPT },
            { inlineData: { mimeType: parsed.mimeType, data: parsed.data } },
          ],
        },
      ],
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      const inline = (part as { inlineData?: { mimeType?: string; data?: string } }).inlineData;
      if (inline?.data) {
        return NextResponse.json({
          image: `data:${inline.mimeType ?? "image/png"};base64,${inline.data}`,
        });
      }
    }

    const text = parts
      .map((p) => (p as { text?: string }).text ?? "")
      .join("")
      .trim();
    return NextResponse.json(
      { error: text ? `The photo booth answered with words instead of an image: ${text}` : "No image came back. Try again." },
      { status: 502 },
    );
  } catch (err) {
    console.error("Gemini transform failed:", err);
    return NextResponse.json(
      { error: "The transform failed. Check the connection and try again." },
      { status: 502 },
    );
  }
}
