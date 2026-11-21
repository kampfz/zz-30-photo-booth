import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { buildStylePrompt, COLOR_SCHEMES, DEFAULT_SCHEME, IMAGE_MODEL } from "@/lib/style";

export const runtime = "nodejs";
export const maxDuration = 60;

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

export async function POST(req: Request) {
  const startedAt = Date.now();
  const contentLength = req.headers.get("content-length");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Photo booth is not set up yet. GEMINI_API_KEY is missing on the server." },
      { status: 500 },
    );
  }

  let body: { image?: string; schemeId?: string };
  try {
    body = await req.json();
  } catch {
    console.error("transform rejected: invalid JSON", JSON.stringify({ contentLength }));
    return NextResponse.json({ error: "That request was not valid JSON." }, { status: 400 });
  }

  if (!body.image) {
    console.error("transform rejected: no image", JSON.stringify({ contentLength }));
    return NextResponse.json({ error: "No photo was sent. Try uploading or taking one again." }, { status: 400 });
  }

  const parsed = parseDataUrl(body.image);
  if (!parsed) {
    console.error("transform rejected: unrecognized format", JSON.stringify({ contentLength }));
    return NextResponse.json({ error: "That photo format was not recognized. Try a JPG or PNG." }, { status: 400 });
  }

  const scheme = COLOR_SCHEMES.find((s) => s.id === body.schemeId) ?? DEFAULT_SCHEME;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      config: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio: "9:16" },
      },
      contents: [
        {
          role: "user",
          parts: [
            { text: buildStylePrompt(scheme) },
            { inlineData: { mimeType: parsed.mimeType, data: parsed.data } },
          ],
        },
      ],
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      const inline = (part as { inlineData?: { mimeType?: string; data?: string } }).inlineData;
      if (inline?.data) {
        console.log(
          "transform ok",
          JSON.stringify({
            ms: Date.now() - startedAt,
            scheme: scheme.id,
            mime: parsed.mimeType,
            base64Chars: parsed.data.length,
            contentLength,
          }),
        );
        return NextResponse.json({
          image: `data:${inline.mimeType ?? "image/png"};base64,${inline.data}`,
        });
      }
    }

    const text = parts
      .map((p) => (p as { text?: string }).text ?? "")
      .join("")
      .trim();
    console.error(
      "transform failed: no image in Gemini response",
      JSON.stringify({ ms: Date.now() - startedAt, scheme: scheme.id, reply: text.slice(0, 200) }),
    );
    return NextResponse.json(
      { error: text ? `The photo booth answered with words instead of an image: ${text}` : "No image came back. Try again." },
      { status: 502 },
    );
  } catch (err) {
    console.error(
      "transform failed",
      JSON.stringify({
        ms: Date.now() - startedAt,
        scheme: scheme.id,
        mime: parsed.mimeType,
        base64Chars: parsed.data.length,
        contentLength,
        error: err instanceof Error ? err.message : String(err),
      }),
    );
    return NextResponse.json(
      { error: "The transform failed. Check the connection and try again." },
      { status: 502 },
    );
  }
}
