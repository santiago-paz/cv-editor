/* The CV fonts, served from public/fonts and set in the preview and the PDF
   alike. The server's Chromium has none of them installed, so without these
   the PDF would fall back to another face and break lines differently from
   the preview. scripts/copy-fonts.mjs puts the files there. */

const LATIN =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329," +
  "U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const LATIN_EXT =
  "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329," +
  "U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";

interface Face {
  family: string;
  file: string;
  weight: 400 | 700;
  style: "normal" | "italic";
}

// Keep in step with FACES in scripts/copy-fonts.mjs.
const FACES: Face[] = [
  { family: "PT Sans", file: "pt-sans", weight: 400, style: "normal" },
  { family: "PT Sans", file: "pt-sans", weight: 400, style: "italic" },
  { family: "PT Sans", file: "pt-sans", weight: 700, style: "normal" },
  { family: "PT Serif", file: "pt-serif", weight: 700, style: "normal" },
  { family: "Inter", file: "inter", weight: 400, style: "normal" },
  { family: "Inter", file: "inter", weight: 400, style: "italic" },
  { family: "Inter", file: "inter", weight: 700, style: "normal" },
];

export const FONT_PATH = "/fonts/";

/** Every file a family needs, as served under FONT_PATH. */
export function fontFiles(families: string[]): string[] {
  return FACES.filter(face => families.includes(face.family)).flatMap(face =>
    ["latin", "latin-ext"].map(subset => `${face.file}-${subset}-${face.weight}-${face.style}.woff2`),
  );
}

/** @font-face rules for the families a template sets. */
export function fontCss(families: string[]): string {
  return FACES.filter(face => families.includes(face.family))
    .flatMap(face =>
      (
        [
          ["latin", LATIN],
          ["latin-ext", LATIN_EXT],
        ] as const
      ).map(
        ([subset, range]) =>
          `@font-face{font-family:"${face.family}";font-style:${face.style};` +
          `font-weight:${face.weight};font-display:block;` +
          `src:url(${FONT_PATH}${face.file}-${subset}-${face.weight}-${face.style}.woff2) format("woff2");` +
          `unicode-range:${range}}`,
      ),
    )
    .join("\n");
}
