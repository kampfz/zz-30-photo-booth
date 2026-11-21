/**
 * THE ONE PLACE TO CHANGE THE PHOTO STYLE.
 *
 * Each transform builds its prompt from:
 *   - a ColorScheme (background gradient), picked by the client so two in a row never match,
 *   - a PosterStyle (lettering, layout, label stickers, decorations), picked at random on the
 *     server by randomPosterStyle() so no two posters look the same,
 *   - a PeopleInfo (how many people are in the photo and who they are), found by a quick
 *     text-only Gemini call before the image call. Naming the exact people stops the image
 *     model from inventing extra ones to fill the tall 9:16 frame.
 *
 * Edit the lists below to change the look. The prompt itself is in buildStylePrompt().
 */

export interface ColorScheme {
  id: string;
  name: string;
  /** Gradient background, e.g. "hot magenta to bright orange to sunny yellow". */
  gradient: string;
}

export const COLOR_SCHEMES: ColorScheme[] = [
  { id: "sunset", name: "Sunset Pop", gradient: "hot magenta at the top to bright orange to sunny yellow at the bottom" },
  { id: "bubblegum", name: "Bubblegum", gradient: "hot pink at the top to purple to electric cyan at the bottom" },
  { id: "lime", name: "Lime Rush", gradient: "electric lime green at the top to teal to bright yellow at the bottom" },
  { id: "grape", name: "Candy Grape", gradient: "deep purple at the top to magenta to bubblegum pink at the bottom" },
  { id: "ocean", name: "Ocean Pop", gradient: "royal blue at the top to cyan to aqua at the bottom" },
  { id: "cherry", name: "Cherry Cola", gradient: "cherry red at the top to magenta to tangerine orange at the bottom" },
];

/** The invite's scheme, used when no scheme is specified. */
export const DEFAULT_SCHEME = COLOR_SCHEMES[0];

/** Pick a random scheme, never the one passed in (so two transforms in a row never repeat a scheme). */
export function randomScheme(exceptId?: string): ColorScheme {
  const pool = COLOR_SCHEMES.filter((s) => s.id !== exceptId);
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ------------------------------------------------------------------ */
/* Lettering and layout variations. One of each is picked per poster.  */
/* Entries listed twice are picked more often (the reference look).    */
/* ------------------------------------------------------------------ */

interface Variant {
  id: string;
  text: string;
}

/** How "happy birthday" is lettered. */
const GREETING_STYLES: Variant[] = [
  {
    id: "zebra-yellow",
    text: "tall, narrow, condensed bold italic letters filled with a wavy zebra-stripe pattern of butter yellow and teal, a thin royal-blue outline, and a hard solid navy drop shadow offset down and to the right",
  },
  {
    id: "zebra-yellow",
    text: "tall, narrow, condensed bold italic letters filled with a wavy zebra-stripe pattern of butter yellow and teal, a thin royal-blue outline, and a hard solid navy drop shadow offset down and to the right",
  },
  {
    id: "zebra-pink",
    text: "tall, narrow, condensed bold italic letters filled with a wavy zebra-stripe pattern of hot pink and white, a thin purple outline, and a hard solid dark purple drop shadow offset down and to the right",
  },
  {
    id: "rainbow",
    text: "chunky rounded bold letters filled with a left-to-right rainbow gradient (red, orange, yellow, green, blue), a thin black outline, and a soft gray drop shadow, exactly like the classic 1990s WordArt rainbow preset",
  },
  {
    id: "chrome",
    text: "heavy italic letters in shiny chrome: a silver to sky-blue metallic gradient with a bright white horizon highlight through the middle, a thin dark outline, and a short slanted 3D extrusion",
  },
  {
    id: "wave",
    text: "chunky bold letters warped into a rippling flag wave, filled with a hot pink to yellow top-to-bottom gradient, a thick white outline, and a hard purple drop shadow",
  },
];

/** How "zach & zoe" is lettered. */
const NAME_STYLES: Variant[] = [
  {
    id: "gold-3d",
    text: "huge, chunky, heavy block letters in shiny gold with lighter highlights on the faces and a deep brown 3D extrusion going down and to the right, like a retro WordArt 3D preset",
  },
  {
    id: "gold-3d",
    text: "huge, chunky, heavy block letters in shiny gold with lighter highlights on the faces and a deep brown 3D extrusion going down and to the right, like a retro WordArt 3D preset",
  },
  {
    id: "fire-3d",
    text: "huge, heavy block letters with a red to orange to yellow top-to-bottom gradient, a black outline, and a black 3D extrusion receding in perspective, like the classic WordArt fire preset",
  },
  {
    id: "candy-bubble",
    text: "huge, puffy bubble letters in glossy candy pink with white shine highlights, a thick dark purple outline, and a hard dark purple drop shadow",
  },
  {
    id: "blue-3d",
    text: "huge, chunky block letters in glossy electric blue fading to cyan, with a white shine highlight and a deep navy 3D extrusion going down and to the right",
  },
];

/** Where the two pieces of lettering go. */
const LAYOUTS: Variant[] = [
  {
    id: "diagonal-top-left",
    text: "Put 'happy birthday' across the upper part of the poster, starting at the top left and rising diagonally up to the right. Put 'zach & zoe' near the bottom left corner, set straight.",
  },
  {
    id: "arch-top",
    text: "Bend 'happy birthday' into a smooth upward arch across the top of the poster. Put 'zach & zoe' straight across the bottom of the poster.",
  },
  {
    id: "tilt-down",
    text: "Put 'happy birthday' across the top of the poster, tilted slightly down to the right. Put 'zach & zoe' near the bottom right corner, tilted slightly up to the right.",
  },
  {
    id: "stacked-top",
    text: "Put 'happy birthday' at the top of the poster with a gentle wave, and 'zach & zoe' directly underneath it, overlapping it slightly, both above the people's heads.",
  },
];

/** Words for the little cream label stickers (like the "Hooray!" / "Party Time" tickets on the invite). */
const TICKET_WORDS = ["Hooray!", "Party Time", "Cheers!", "Turning 30!", "Let's Party!", "Woo hoo!"];

/** Small extras. Kept light on purpose: the look is a clean collage, not a clip-art pile. */
const EXTRAS: Variant[] = [
  { id: "none", text: "No other decorations." },
  { id: "none", text: "No other decorations." },
  { id: "sparkles", text: "Add three or four small white four-point sparkle stars near the lettering. Nothing else." },
  { id: "confetti", text: "Add a light sprinkle of small confetti dots near the edges of the poster. Nothing else." },
  { id: "balloons", text: "Add two or three small cartoon clip-art balloons in one empty corner. Nothing else." },
];

export interface PosterStyle {
  greeting: Variant;
  names: Variant;
  layout: Variant;
  tickets: string[];
  extras: Variant;
}

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/** Pick a random lettering style, layout, 0 to 2 label stickers and a decoration level. */
export function randomPosterStyle(): PosterStyle {
  const ticketCount = pick([0, 1, 2, 2]);
  const tickets = [...TICKET_WORDS].sort(() => Math.random() - 0.5).slice(0, ticketCount);
  return {
    greeting: pick(GREETING_STYLES),
    names: pick(NAME_STYLES),
    layout: pick(LAYOUTS),
    tickets,
    extras: pick(EXTRAS),
  };
}

/** A short id for logs, e.g. "zebra-yellow/gold-3d/arch-top/t2/none". */
export function posterStyleId(style: PosterStyle): string {
  return [style.greeting.id, style.names.id, style.layout.id, `t${style.tickets.length}`, style.extras.id].join("/");
}

/* ------------------------------------------------------------------ */
/* People. Counted and described before the image call.                 */
/* ------------------------------------------------------------------ */

export interface PeopleInfo {
  count: number;
  /** One short description per person, left to right, e.g. "woman in a blue striped shirt holding a drink". */
  people: string[];
}

/** Text-only model used to count the people. Fast and cheap. */
export const PEOPLE_MODEL = "gemini-2.5-flash";

export const PEOPLE_PROMPT = [
  "Count the people who are the subject of this photo: everyone posing or clearly in the",
  "foreground, including anyone partly cut off at the edge. Do not count distant bystanders,",
  "people in posters, screens or reflections. List them from left to right with a short",
  "visual description of each (clothing, hair, anything they are holding), under 15 words each.",
].join(" ");

function describePeople(info: PeopleInfo): string {
  const n = info.count;
  const noun = n === 1 ? "person" : "people";
  const list = info.people.map((p, i) => `(${i + 1}) ${p}`).join("; ");
  return [
    `This photo shows exactly ${n} ${noun}, from left to right: ${list}.`,
    `The poster must show exactly these ${n} ${noun} and nobody else: ${n} ${noun} in, ${n} ${noun} out.`,
  ].join(" ");
}

/* ------------------------------------------------------------------ */
/* The prompt.                                                          */
/* ------------------------------------------------------------------ */

/** Build the Gemini image prompt for one scheme, one poster style and (if known) the people in the photo. */
export function buildStylePrompt(scheme: ColorScheme, style: PosterStyle, people?: PeopleInfo | null): string {
  const ticketLine =
    style.tickets.length > 0
      ? [
          `Also add ${style.tickets.length === 1 ? "one small label sticker" : "two small label stickers"},`,
          `reading ${style.tickets.map((t) => `"${t}"`).join(" and ")}${style.tickets.length === 2 ? ", stacked and slightly overlapping" : ""}:`,
          "plain cream rectangles with black sans-serif text in normal capitalization, a hard gray drop shadow,",
          "tilted a few degrees, placed in an empty corner away from the faces.",
        ].join(" ")
      : "";

  const words = ["'happy birthday'", "'zach & zoe'", ...style.tickets.map((t) => `'${t}'`)].join(", ");

  return [
    // 1. People first: the most important rule.
    "Turn this photo into a retro early-2000s birthday collage poster, like a Y2K party invite made with Microsoft WordArt.",
    "",
    "PEOPLE (most important rule):",
    people ? describePeople(people) : "Keep exactly the people who are posing in the photo: the same number of people as the input.",
    "Do not add, invent, duplicate or mirror anyone. No extra people, faces, heads, silhouettes, crowds or figures anywhere in the poster: not in the background, not in the decorations, not at the edges.",
    "Leave out any distant bystanders who are not posing.",
    "Do not change the people: keep their real faces, expressions, skin, hair, body shapes, clothes and poses exactly as photographed. No retouching, no cartooning, no warped limbs. Keep them in the same order from left to right and at the same size relative to each other.",
    "",
    // 2. Cutout and background.
    "CUTOUT AND BACKGROUND:",
    `Cut the people out cleanly, like photo-collage stickers, and place them on a smooth, saturated gradient of ${scheme.gradient} that fills the whole image edge to edge.`,
    "Remove everything else from the original photo: the room, walls, sky, trees, furniture, tables, floor. Things a person is holding or wearing stay with them (drinks, bags, umbrellas, hats).",
    "The poster is a tall 9:16 portrait (1080 by 1920). If the photo is wider than that, shrink the group to fit and leave open gradient space above and below them. Fill that open space with the lettering and the gradient, never with extra people. Every head and face must be fully in frame.",
    "Full bleed: no border, no white frame, no letterboxing, no visible rectangle or edge of the original photo.",
    "",
    // 3. Lettering.
    "LETTERING (retro WordArt):",
    `The only words in the image are ${words}. Spell them exactly. 'happy birthday' and 'zach & zoe' are all lowercase. No other words, letters, numbers, dates or captions anywhere.`,
    `'happy birthday': ${style.greeting.text}.`,
    `'zach & zoe': ${style.names.text}.`,
    style.layout.text,
    ...(ticketLine ? [ticketLine] : []),
    "The lettering must look like genuine 1990s/2000s WordArt: bold, a bit cheesy, flat outlines and hard drop shadows. Not modern, not hand-lettered, not neon, not graffiti.",
    "The lettering is big and fills the open gradient space. It never covers a face, head or hair. It may overlap the bottom of someone's legs or clothing a little, like a collage.",
    "",
    // 4. Decorations and mood.
    "DECORATIONS:",
    style.extras.text,
    "Keep it clean and graphic like a cut-and-paste collage: bright gradient, crisp cutout people, big retro lettering.",
    "",
    people
      ? `Before finishing, count the people in the poster: it must be exactly ${people.count}.`
      : "Before finishing, count the people in the poster: it must match the input photo exactly.",
  ].join("\n");
}

/** Gemini image model used for the transform. */
export const IMAGE_MODEL = "gemini-2.5-flash-image";
