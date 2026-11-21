# Zach & Zoe turn 30! Photo Booth

A little AI photo booth for Zach and Zoe's joint 30th birthday party at Easy Lover on November 21, 2026.

A guest scans a QR code, lands on the site, takes a photo or uploads one, and Google Gemini transforms it into a playful Y2K early-2000s WordArt poster. The look is inspired by the party invite graphic (magenta to orange to yellow gradient, chunky outlined lettering, stars, party hats, cake and balloons) but it is a fresh take, not a copy.

## How it works

1. Guest opens the deployed site (from the QR code at the party).
2. They tap **Take a photo** (opens the phone camera) or **Upload a photo** (camera roll).
3. They preview the photo and tap **Make it Y2K**.
4. The photo goes to `POST /api/transform`, which calls Gemini server side and returns a restyled image.
5. The guest can **Download**, **Share**, or **Take another**. Transformed photos from the session show in a strip at the bottom of the page.

## Tech

- Next.js App Router (TypeScript), plain CSS, Google Fonts (Titan One, Bungee, Nunito)
- Gemini image editing via `@google/genai`, model `gemini-2.5-flash-image`
- The API key lives only on the server (`process.env.GEMINI_API_KEY`). It is never sent to the browser and never committed.

## Run it locally

```bash
npm install
cp .env.example .env.local
# Put your key in .env.local: GEMINI_API_KEY=...
npm run dev
```

Open http://localhost:3000. The transform will fail with a clear message until a key is set.

## Get a Gemini API key

1. Go to Google AI Studio: https://aistudio.google.com/apikey
2. Create an API key.
3. For local dev, put it in `.env.local`. For the live site, set it in Vercel (below). Never commit a key.

## Deploy to Vercel

1. In Vercel, click **Add New > Project** and import `kampfz/zz-30-photo-booth`.
2. Vercel auto-detects Next.js. No build settings to change.
3. Before deploying, add an environment variable: `GEMINI_API_KEY` with your key from Google AI Studio.
4. Deploy. Every push to `main` redeploys automatically.

## QR code

Once deployed, point a QR code at the Vercel URL (for example `https://zz-30-photo-booth.vercel.app`). Any free QR generator works. Print it and put it on the tables at Easy Lover. Test the QR on a phone before the party starts.

## Change the photo style

Edit `lib/style.ts`. The prompt is built by `buildStylePrompt(scheme)` from one of the
`COLOR_SCHEMES` (Sunset Pop, Bubblegum, Lime Rush, Candy Grape, Ocean Pop, Cherry Cola).
The prompt tells Gemini to completely replace the background with a flat gradient in the
scheme's colors, keep the people as photographed, and put only the words
"Happy 30th Birthday Zach & Zoe" on the poster. Every transform picks a random scheme
automatically (never the same one twice in a row); the result screen shows which scheme
it got. The model is `IMAGE_MODEL` in the same file.

## Notes

- Photos are not stored on the server. The session strip lives only in the guest's browser.
- Large photos are sent as base64 in the request body. If a phone sends a very large image and the transform is slow, it is worth compressing on the client before sending.
