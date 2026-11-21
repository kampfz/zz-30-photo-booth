/**
 * THE ONE PLACE TO CHANGE THE PHOTO STYLE.
 *
 * This prompt is sent to Gemini together with the guest's photo.
 * Edit this string to change how every transformed photo looks.
 * Keep it fun and on theme for the party.
 */
export const STYLE_PROMPT = [
  "Transform this party photo into a loud, maximalist early-2000s Microsoft WordArt poster,",
  "exactly like a Y2K birthday invite made in WordArt: huge wavy 3D bubble letters filled with",
  "a yellow zebra-stripe gradient, thick dark-blue outlines and heavy drop shadows, words tilted",
  "at jaunty angles, rainbow gradient fills, beveled chrome-like lettering.",
  "Cover it in clip-art stickers: stars, starbursts, confetti, party hats, balloons, a birthday cake.",
  "Saturated magenta to orange to yellow gradient background, like the party invite.",
  "The poster must include the words 'Happy 30th Birthday Zach & Zoe' in the biggest, waviest,",
  "chunkiest WordArt lettering, striped yellow fill, blue outline, hard drop shadow, spelled",
  "exactly like that, prominent on the poster like the invite graphic.",
  "Messy, loud, playful and over the top, NOT clean, NOT minimal, NOT modern flat design.",
  "Keep the people, faces, poses and composition recognizable. Same people, same framing.",
  "Just restyle the photo and background in that loud Y2K WordArt poster look.",
].join(" ");

/** Gemini image model used for the transform. */
export const IMAGE_MODEL = "gemini-2.5-flash-image";
