import { get } from "@vercel/blob";
import { isPosterPath } from "@/lib/gallery";

export const runtime = "nodejs";

/** Streams one saved poster from the private Blob store. Behind ADMIN_PASSWORD (middleware.ts). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const pathname = url.searchParams.get("path") ?? "";
  if (!isPosterPath(pathname)) return new Response("Not found", { status: 404 });

  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200) return new Response("Not found", { status: 404 });

  const headers = new Headers({
    "Content-Type": result.blob.contentType,
    "Cache-Control": "private, max-age=86400, immutable",
  });
  if (url.searchParams.get("download")) {
    const filename = pathname.split("/").pop() ?? "poster.png";
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  }
  return new Response(result.stream, { headers });
}
