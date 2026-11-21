import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Receives client-side error reports from the booth page and writes them to
 * the server logs, where they show up in Vercel. Client errors never reach
 * Vercel any other way, which is why a broken transform can look silent.
 * Only short error context is logged here, never image data.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const entry = {
      message: typeof body?.message === "string" ? body.message.slice(0, 500) : "unknown client error",
      source: typeof body?.source === "string" ? body.source : "client",
      schemeId: typeof body?.schemeId === "string" ? body.schemeId : undefined,
      photoBytes: typeof body?.photoBytes === "number" ? body.photoBytes : undefined,
      photoType: typeof body?.photoType === "string" ? body.photoType : undefined,
      url: typeof body?.url === "string" ? body.url.slice(0, 200) : undefined,
      userAgent: typeof body?.userAgent === "string" ? body.userAgent.slice(0, 200) : undefined,
      filename: typeof body?.filename === "string" ? body.filename.slice(0, 200) : undefined,
      lineno: typeof body?.lineno === "number" ? body.lineno : undefined,
    };
    console.error("client error", JSON.stringify(entry));
  } catch {
    console.error("client error: unreadable report");
  }
  return NextResponse.json({ ok: true });
}
