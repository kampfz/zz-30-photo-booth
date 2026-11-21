/**
 * THE ONE PLACE TO CHANGE THE PHOTO STYLE.
 *
 * This prompt is sent to Gemini together with the guest's photo.
 * Edit this string to change how every transformed photo looks.
 * Keep it fun and on theme for the party.
 */
export const STYLE_PROMPT = [
  "Transform this party photo into a playful Y2K early-2000s WordArt poster",
  "in the style of the party invite: bold saturated magenta, orange and yellow",
  "gradient background, chunky outlined bubbly lettering, stars, confetti,",
  "party hats and balloons around the edges.",
  "Keep the people, faces, poses and composition recognizable. Same people,",
  "same framing. Just restyle the photo and background in that Y2K poster look.",
  "Fun, celebratory, high-energy, print-ready.",
].join(" ");

/** Gemini image model used for the transform. */
export const IMAGE_MODEL = "gemini-2.5-flash-image";
