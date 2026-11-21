/**
 * THE ONE PLACE TO CHANGE THE PHOTO STYLE.
 *
 * This prompt is sent to Gemini together with the guest's photo.
 * Edit this string to change how every transformed photo looks.
 * Keep it fun and on theme for the party.
 */
export const STYLE_PROMPT = [
  "Transform this party photo into a loud, maximalist early-2000s Microsoft WordArt poster,",
  "exactly like a Y2K birthday invite: saturated magenta to orange to yellow gradient background,",
  "clip-art stickers around the edges (stars, starbursts, confetti, party hats, balloons, a birthday cake).",
  "The ONLY words anywhere in the image are 'Happy 30th Birthday Zach & Zoe', in one big wavy",
  "chunky WordArt line with a striped yellow fill, blue outline and hard drop shadow, spelled",
  "exactly like that. No other text, words, letters or numbers anywhere in the image — no extra",
  "slogans, no 'turn 30', no dates, no captions.",
  "Messy, loud, playful and over the top, NOT clean, NOT minimal, NOT modern flat design.",
  "Keep the people, faces, poses and composition recognizable. Same people, same framing.",
  "Just restyle the photo and background in that loud Y2K WordArt poster look.",
].join(" ");

/** Gemini image model used for the transform. */
export const IMAGE_MODEL = "gemini-2.5-flash-image";
