import { list, put } from "@vercel/blob";

/**
 * Saved posters live in a PRIVATE Vercel Blob store under this folder. Nothing in it is
 * reachable without the store token: the /admin gallery streams each file through
 * app/admin/photo/route.ts, behind the ADMIN_PASSWORD check in middleware.ts.
 */
const PREFIX = "posters/";

/** True when a Blob store is connected to the project (Vercel sets this env var). */
export function galleryEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Save one generated poster. Never throws: a storage hiccup must not break the booth. */
export async function savePoster(
  image: { mimeType: string; data: string },
  meta: { scheme: string; style: string },
): Promise<void> {
  if (!galleryEnabled()) return;
  try {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const ext = image.mimeType === "image/jpeg" ? "jpg" : "png";
    const style = meta.style.replace(/[^a-z0-9-]+/gi, ".");
    const pathname = `${PREFIX}${stamp}_${meta.scheme}_${style}.${ext}`;
    await put(pathname, Buffer.from(image.data, "base64"), {
      access: "private",
      addRandomSuffix: true,
      contentType: image.mimeType,
    });
    console.log("poster saved", JSON.stringify({ pathname }));
  } catch (err) {
    console.error("poster save failed", err instanceof Error ? err.message : String(err));
  }
}

export interface SavedPoster {
  pathname: string;
  uploadedAt: Date;
  size: number;
  scheme: string;
  style: string;
}

/** Every saved poster, newest first. */
export async function listPosters(): Promise<SavedPoster[]> {
  const posters: SavedPoster[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
    for (const blob of page.blobs) {
      // posters/<stamp>_<scheme>_<style>-<randomSuffix>.png
      const name = blob.pathname.slice(PREFIX.length).replace(/\.(png|jpg)$/, "");
      const [, scheme = "", styleWithSuffix = ""] = name.split("_");
      posters.push({
        pathname: blob.pathname,
        uploadedAt: new Date(blob.uploadedAt),
        size: blob.size,
        scheme,
        style: styleWithSuffix.replace(/-[A-Za-z0-9]{20,}$/, "").replace(/\./g, " / "),
      });
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return posters.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
}

/** Only paths inside the posters folder may be served. */
export function isPosterPath(pathname: string): boolean {
  return pathname.startsWith(PREFIX) && !pathname.includes("..") && /^[\w./-]+$/.test(pathname);
}
