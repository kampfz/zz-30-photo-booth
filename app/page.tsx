"use client";

import { useEffect, useRef, useState } from "react";
import { randomScheme } from "@/lib/style";

type Step = "pick" | "preview" | "done";

export default function Home() {
  const [step, setStep] = useState<Step>("pick");
  const [original, setOriginal] = useState<string | null>(null);
  const [transformed, setTransformed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schemeId, setSchemeId] = useState<string | null>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const uploadInput = useRef<HTMLInputElement>(null);

  /** Read a file as a data URL. */
  function readFileAsDataUrl(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("read failed"));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Shrink a photo to a 1600px max edge as a JPEG before upload. Vercel rejects
   * request bodies over ~4.5 MB, and a full-res iPhone photo is bigger than that
   * once base64-encoded (a 413). Returns null to send the original file untouched
   * (small photos, or formats the browser cannot decode, like HEIC in Chrome).
   */
  async function compressPhoto(file: File): Promise<string | null> {
    try {
      let bitmap: ImageBitmap;
      try {
        bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      } catch {
        const url = URL.createObjectURL(file);
        try {
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const el = new Image();
            el.onload = () => resolve(el);
            el.onerror = () => reject(new Error("image load failed"));
            el.src = url;
          });
          bitmap = await createImageBitmap(img);
        } finally {
          URL.revokeObjectURL(url);
        }
      }
      const { width, height } = bitmap;
      const MAX_EDGE = 1600;
      const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
      if (scale === 1 && file.size < 2_000_000) {
        bitmap.close();
        return null;
      }
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        bitmap.close();
        return null;
      }
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.82),
      );
      if (!blob) return null;
      return await readFileAsDataUrl(blob);
    } catch {
      return null;
    }
  }

  /** Fire-and-forget client error report so it shows up in the server logs. */
  function reportClientError(context: Record<string, unknown>) {
    try {
      fetch("/api/log", {
        body: JSON.stringify({
          ...context,
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }).catch(() => {});
    } catch {
      // Logging must never break the page.
    }
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file was not a photo. Pick a JPG or PNG.");
      return;
    }
    setError(null);
    try {
      const dataUrl = (await compressPhoto(file)) ?? (await readFileAsDataUrl(file));
      setOriginal(dataUrl);
      setTransformed(null);
      setStep("preview");
    } catch {
      setError("Could not read that photo. Try another one.");
    }
  }

  async function transform() {
    if (!original) return;
    const id = randomScheme(schemeId ?? undefined).id;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/transform", {
        body: JSON.stringify({ image: original, schemeId: id }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (res.status === 413) {
        throw new Error("That photo was too big to send. Try a smaller photo or take a new one.");
      }
      let data: { image?: string; error?: string };
      try {
        data = await res.json();
      } catch {
        throw new Error("The photo booth had a hiccup. Try again.");
      }
      if (!res.ok) throw new Error(data.error ?? "The transform failed.");
      if (!data.image) throw new Error("No image came back. Try again.");
      const image = data.image;
      setTransformed(image);
      setSchemeId(id);
      setStep("done");
    } catch (err) {
      const message = err instanceof Error ? err.message : "The transform failed. Try again.";
      setError(message);
      reportClientError({
        message,
        source: "transform",
        schemeId: id,
        photoBytes: original.length,
        photoType: original.slice(5, original.indexOf(";")),
      });
    } finally {
      setLoading(false);
    }
  }

  function retake() {
    setOriginal(null);
    setTransformed(null);
    setError(null);
    setStep("pick");
  }

  async function share() {
    if (!transformed) return;
    try {
      const res = await fetch(transformed);
      const blob = await res.blob();
      const file = new File([blob], "zach-and-zoe-30.png", { type: blob.type || "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: "Zach and Zoe turn 30!" });
        return;
      }
      throw new Error("share not supported");
    } catch {
      download();
    }
  }

  function download() {
    if (!transformed) return;
    const a = document.createElement("a");
    a.href = transformed;
    a.download = "zach-and-zoe-30.png";
    a.click();
  }

  useEffect(() => {
    function onError(event: ErrorEvent) {
      reportClientError({
        message: event.message,
        source: "window.onerror",
        filename: event.filename,
        lineno: event.lineno,
      });
    }
    function onRejection(event: PromiseRejectionEvent) {
      const reason = event.reason as { message?: string } | null;
      reportClientError({
        message: reason?.message ?? String(event.reason),
        source: "unhandledrejection",
      });
    }
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return (
    <main className="booth">
      <div className="sticker-row">
        <span className="sticker">Hooray!</span>
        <span className="sticker">Party Time</span>
      </div>

      <h1 className="wordart">Zach &amp; Zoe</h1>
      <div className="wordart-sub">turn 30!</div>

      <div className="tagline-wrap">
        <svg className="deco-hat" viewBox="0 0 64 72" aria-hidden="true">
          <path d="M32 6 L56 60 Q32 68 8 60 Z" fill="#ff7fb8" stroke="#1c0a4d" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="32" cy="8" r="6" fill="#1c0a4d" />
          <circle cx="26" cy="34" r="4" fill="#ffe600" />
          <circle cx="38" cy="46" r="4" fill="#ffe600" />
          <circle cx="29" cy="56" r="3.5" fill="#fff" />
        </svg>
        <p className="tagline">
          Snap a pic, make it Y2K, take it home.
        </p>
      </div>

      {step === "pick" && (
        <section className="card">
          <h2>Step 1 — Get your photo</h2>
          <p>Take a fresh one or pick a favorite from your camera roll. Works best with faces in good light.</p>
          <div className="button-row">
            <button className="btn btn-pink" type="button" onClick={() => cameraInput.current?.click()}>
              📷 Take a Photo
            </button>
            <button className="btn btn-royal" type="button" onClick={() => uploadInput.current?.click()}>
              🖼️ Upload a Photo
            </button>
          </div>
          <input
            ref={cameraInput}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <input
            ref={uploadInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {error && <p className="error">{error}</p>}
        </section>
      )}

      {step === "preview" && original && (
        <section className="card">
          <h2>Looking good</h2>
          {loading ? (
            <div className="processing" aria-live="polite">
              <div className="processing-stars" aria-hidden="true">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
              <p className="loading">
                Making it Y2K<span className="dots" />
              </p>
              <p className="hint">Warming up the time machine…</p>
            </div>
          ) : (
            <>
              <p>Happy with this one? Hit the button and we will Y2K it up.</p>
              <img className="photo-frame" src={original} alt="Your photo, before the Y2K transform" />
              <div className="button-row" style={{ marginTop: 16 }}>
                <button className="btn btn-pink" type="button" onClick={() => transform()}>
                  Make it Y2K
                </button>
                <button className="btn btn-ghost" type="button" onClick={retake}>
                  Retake
                </button>
              </div>
            </>
          )}
          {error && <p className="error">{error}</p>}
        </section>
      )}

      {step === "done" && transformed && (
        <section className="card">
          <h2>It is so Y2K</h2>
          <p>Save it, share it, show it off. Then go take another one.</p>
          <div className="reveal-wrap">
            <svg className="reveal-balloon" style={{ left: "6%", animationDelay: "0.05s" }} viewBox="0 0 40 62" aria-hidden="true">
              <ellipse cx="20" cy="20" rx="14" ry="18" fill="#ffe600" stroke="#1c0a4d" strokeWidth="2.5" />
              <path d="M20 38 q-3 12 2 22" fill="none" stroke="#1c0a4d" strokeWidth="1.8" />
            </svg>
            <svg className="reveal-balloon" style={{ left: "44%", animationDelay: "0.2s" }} viewBox="0 0 40 62" aria-hidden="true">
              <ellipse cx="20" cy="20" rx="14" ry="18" fill="#ff3b30" stroke="#1c0a4d" strokeWidth="2.5" />
              <path d="M20 38 q3 12 -2 22" fill="none" stroke="#1c0a4d" strokeWidth="1.8" />
            </svg>
            <svg className="reveal-balloon" style={{ left: "82%", animationDelay: "0.35s" }} viewBox="0 0 40 62" aria-hidden="true">
              <ellipse cx="20" cy="20" rx="14" ry="18" fill="#2563eb" stroke="#1c0a4d" strokeWidth="2.5" />
              <path d="M20 38 q-3 12 2 22" fill="none" stroke="#1c0a4d" strokeWidth="1.8" />
            </svg>
            <img className="photo-frame" src={transformed} alt="Your photo, transformed into a Y2K poster" />
          </div>
          <p className="share-nudge">Share the love on Instagram!</p>
          <div className="button-row" style={{ marginTop: 16 }}>
            <button className="btn btn-blue" type="button" onClick={share}>
              SAVE/SHARE
            </button>
            <button className="btn btn-ghost" type="button" onClick={retake}>
              TAKE ANOTHER
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </section>
      )}

      <div className="footer-wrap">
        <span className="deco-star" aria-hidden="true">★</span>
        <svg className="deco-balloons" viewBox="0 0 96 118" overflow="visible" aria-hidden="true">
          <ellipse cx="30" cy="32" rx="19" ry="25" fill="#ffe600" stroke="#1c0a4d" strokeWidth="3" />
          <ellipse cx="60" cy="28" rx="19" ry="25" fill="#ff3b30" stroke="#1c0a4d" strokeWidth="3" />
          <ellipse cx="76" cy="54" rx="15" ry="20" fill="#2563eb" stroke="#1c0a4d" strokeWidth="3" />
          <path d="M30 57 q-4 18 2 34 M60 53 q4 18 -2 34 M76 74 q-2 14 2 24" fill="none" stroke="#1c0a4d" strokeWidth="2" />
        </svg>
      </div>
    </main>
  );
}
