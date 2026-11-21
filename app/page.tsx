"use client";

import { useRef, useState } from "react";

type Step = "pick" | "preview" | "done";

export default function Home() {
  const [step, setStep] = useState<Step>("pick");
  const [original, setOriginal] = useState<string | null>(null);
  const [transformed, setTransformed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const cameraInput = useRef<HTMLInputElement>(null);
  const uploadInput = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file was not a photo. Pick a JPG or PNG.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setOriginal(reader.result as string);
      setTransformed(null);
      setError(null);
      setStep("preview");
    };
    reader.onerror = () => setError("Could not read that photo. Try another one.");
    reader.readAsDataURL(file);
  }

  async function transform() {
    if (!original) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/transform", {
        body: JSON.stringify({ image: original }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "The transform failed.");
      setTransformed(data.image);
      setGallery((g) => [data.image, ...g].slice(0, 9));
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "The transform failed. Try again.");
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

  return (
    <main className="booth">
      <div className="stars" aria-hidden="true">
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
      </div>

      <div className="sticker-row">
        <span className="sticker">Hooray! Party Time</span>
      </div>

      <h1 className="wordart">Zach &amp; Zoe</h1>
      <div className="wordart-sub">turn 30!</div>

      <p className="tagline">
        Snap a pic at the party and let Gemini give it the full Y2K treatment. Stars, confetti, big energy.
      </p>

      {step === "pick" && (
        <section className="card">
          <h2>Step right up</h2>
          <p>Take a fresh photo or upload one from your camera roll. Then we make it Y2K.</p>
          <div className="button-row">
            <button className="btn btn-pink" type="button" onClick={() => cameraInput.current?.click()}>
              Take a photo
            </button>
            <button className="btn btn-yellow" type="button" onClick={() => uploadInput.current?.click()}>
              Upload a photo
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
          <p>Happy with this one? Hit the button and we will Y2K it up.</p>
          <img className="photo-frame" src={original} alt="Your photo, before the Y2K transform" />
          {loading ? (
            <p className="loading">
              Making it Y2K<span className="dots" />
            </p>
          ) : (
            <div className="button-row" style={{ marginTop: 16 }}>
              <button className="btn btn-pink" type="button" onClick={transform}>
                Make it Y2K
              </button>
              <button className="btn btn-ghost" type="button" onClick={retake}>
                Retake
              </button>
            </div>
          )}
          {error && <p className="error">{error}</p>}
        </section>
      )}

      {step === "done" && transformed && (
        <section className="card">
          <h2>It is so Y2K</h2>
          <p>Save it, share it, show it off. Then go take another one.</p>
          <img className="photo-frame" src={transformed} alt="Your photo, transformed into a Y2K poster" />
          <div className="button-row" style={{ marginTop: 16 }}>
            <button className="btn btn-yellow" type="button" onClick={download}>
              Download
            </button>
            <button className="btn btn-blue" type="button" onClick={share}>
              Share
            </button>
            <button className="btn btn-ghost" type="button" onClick={retake}>
              Take another
            </button>
          </div>
          {original && (
            <>
              <p className="result-label">Before</p>
              <img className="photo-frame" src={original} alt="Your original photo" />
            </>
          )}
          {error && <p className="error">{error}</p>}
        </section>
      )}

      {gallery.length > 0 && (
        <section className="card strip">
          <h3>Tonight at the booth</h3>
          <div className="strip-grid">
            {gallery.map((src, i) => (
              <img key={`${i}-${src.slice(30, 50)}`} src={src} alt={`Transformed party photo ${i + 1}`} />
            ))}
          </div>
          <p className="hint" style={{ marginTop: 12 }}>
            This strip only lives on this phone for now. Download your favorites before you close the page.
          </p>
        </section>
      )}

      <p className="footer">Zach &amp; Zoe turn 30. Easy Lover, November 21, 2026.</p>
    </main>
  );
}
