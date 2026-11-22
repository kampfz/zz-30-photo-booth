import type { Metadata } from "next";
import { galleryEnabled, listPosters } from "@/lib/gallery";
import { LocalTime } from "./local-time";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Booth Gallery",
  robots: { index: false, follow: false },
};

function photoUrl(pathname: string, download = false) {
  return `/admin/photo?path=${encodeURIComponent(pathname)}${download ? "&download=1" : ""}`;
}

/** Every poster the booth has made, newest first. Behind ADMIN_PASSWORD (middleware.ts). */
export default async function AdminGallery() {
  if (!galleryEnabled()) {
    return (
      <main className="admin">
        <h1>Booth gallery</h1>
        <p>No Blob store is connected yet, so posters are not being saved.</p>
      </main>
    );
  }

  const posters = await listPosters();

  return (
    <main className="admin">
      <header className="admin-head">
        <h1>Booth gallery</h1>
        <p>
          {posters.length} {posters.length === 1 ? "poster" : "posters"} · <a href="/admin">Refresh</a>
        </p>
      </header>
      {posters.length === 0 ? (
        <p>No posters yet. They show up here as soon as guests make them.</p>
      ) : (
        <ul className="admin-grid">
          {posters.map((p) => (
            <li key={p.pathname} className="admin-item">
              <a href={photoUrl(p.pathname)} target="_blank" rel="noreferrer">
                <img src={photoUrl(p.pathname)} alt="Booth poster" loading="lazy" />
              </a>
              <div className="admin-meta">
                <LocalTime iso={p.uploadedAt.toISOString()} />
                <a href={photoUrl(p.pathname, true)}>Download</a>
              </div>
              <div className="admin-style">
                {p.scheme} · {p.style}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
