/**
 * THE ONE PLACE TO CHANGE THE PHOTO STYLE.
 *
 * The prompt is built from a color scheme by buildStylePrompt() and sent to
 * Gemini together with the guest's photo. Edit the schemes or the prompt
 * builder to change how every transformed photo looks. Keep it fun and on
 * theme for the party.
 */

export interface ColorScheme {
  id: string;
  name: string;
  /** Gradient background, e.g. "hot magenta to bright orange to sunny yellow". */
  gradient: string;
  /** Sticker and accent colors for the background decorations. */
  accents: string;
}

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: "sunset",
    name: "Sunset Pop",
    gradient: "hot magenta to bright orange to sunny yellow",
    accents: "magenta, orange, yellow, cyan and lime",
  },
  {
    id: "bubblegum",
    name: "Bubblegum",
    gradient: "hot pink to purple to electric cyan",
    accents: "pink, purple, cyan, yellow and white",
  },
  {
    id: "lime",
    name: "Lime Rush",
    gradient: "electric lime green to teal to bright yellow",
    accents: "lime, teal, yellow, magenta and orange",
  },
  {
    id: "grape",
    name: "Candy Grape",
    gradient: "deep purple to magenta to bubblegum pink",
    accents: "purple, magenta, pink, cyan and yellow",
  },
  {
    id: "ocean",
    name: "Ocean Pop",
    gradient: "royal blue to cyan to aqua",
    accents: "blue, cyan, aqua, yellow and hot pink",
  },
  {
    id: "cherry",
    name: "Cherry Cola",
    gradient: "cherry red to magenta to tangerine orange",
    accents: "red, magenta, orange, yellow and purple",
  },
];

/** The invite's scheme, used when no scheme is specified. */
export const DEFAULT_SCHEME = COLOR_SCHEMES[0];

/** Pick a random scheme, never the one passed in (so two transforms in a row never repeat a scheme). */
export function randomScheme(exceptId?: string): ColorScheme {
  const pool = COLOR_SCHEMES.filter((s) => s.id !== exceptId);
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Build the Gemini prompt for one color scheme. */
export function buildStylePrompt(scheme: ColorScheme): string {
  return [
    "Transform this party photo into a loud, maximalist early-2000s Microsoft WordArt poster,",
    "exactly like a Y2K birthday invite.",
    "Completely REPLACE the background: remove everything behind the people — the sky, trees,",
    "buildings, walls, furniture, the whole original location — and put the people on a flat,",
    `saturated ${scheme.gradient} gradient background. Nothing of the original background may`,
    "remain visible anywhere in the image. Cut out ONLY the people — just their bodies, heads,",
    "hair and clothes, same faces, same poses — and delete absolutely everything else in the",
    "photo: the furniture, chairs, tables, food, drinks, bags, walls and floor. Nothing from",
    "the original location survives except the people themselves. Do NOT add, remove, duplicate",
    "or invent any people: the output must contain exactly the same people as the input photo —",
    "same number of people, same faces, no one added and no one missing — in the same arrangement",
    "relative to each other. Place the cut-out people directly on the new background, arranged so",
    "they fill the frame, keeping every person's whole head and face in frame. Do NOT paste the",
    "original photo into the poster as a rectangle",
    "or inset, and do NOT leave any rectangular edge, border or frame of the original photo",
    "visible anywhere. The final image must be full-bleed: the gradient background and",
    "decorations extend to every edge of the image, with no white border, no letterboxing, and",
    "no visible edge of the original photo.",
    "The final image must be a vertical 9:16 portrait, Instagram Story format (1080 by 1920).",
    `Cover the background in clip-art stickers in ${scheme.accents}: stars, starbursts, confetti,`,
    "party hats, balloons, a birthday cake.",
    "The ONLY words anywhere in the image are 'Happy 30th Birthday Zach & Zoe', in one big wavy",
    "chunky WordArt line with a striped yellow fill, blue outline and hard drop shadow, spelled",
    "exactly like that. No other text, words, letters or numbers anywhere in the image — no extra",
    "slogans, no 'turn 30', no dates, no captions.",
    "Place the words on the background only, in clear space at the top or bottom of the poster —",
    "NEVER across a person's face, head, hair or body. Every face must stay fully visible and",
    "uncovered by text, stickers or decorations.",
    "Messy, loud, playful and over the top, NOT clean, NOT minimal, NOT modern flat design.",
  ].join(" ");
}

/** Gemini image model used for the transform. */
export const IMAGE_MODEL = "gemini-2.5-flash-image";
