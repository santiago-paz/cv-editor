// Copies the CV fonts from @fontsource into public/fonts.
//
// The preview and the PDF must set type in the same faces, or a line that fits
// in the browser breaks differently on the server. So the fonts ship with the
// app instead of coming from the operating system: the server's Chromium has
// none of them. Run it after bumping an @fontsource package:
//
//   node scripts/copy-fonts.mjs

import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "fonts");
mkdirSync(out, { recursive: true });

// Keep in step with FACES in src/lib/cv/fonts.ts.
const FACES = [
  ["pt-sans", "400-normal"],
  ["pt-sans", "400-italic"],
  ["pt-sans", "700-normal"],
  ["pt-serif", "700-normal"],
  ["inter", "400-normal"],
  ["inter", "400-italic"],
  ["inter", "700-normal"],
];

for (const [family, style] of FACES) {
  const files = join(root, "node_modules", "@fontsource", family, "files");
  for (const subset of ["latin", "latin-ext"]) {
    const name = `${family}-${subset}-${style}.woff2`;
    copyFileSync(join(files, name), join(out, name));
  }
}

// The OFL asks for the license to travel with the fonts.
for (const family of new Set(FACES.map(([family]) => family))) {
  copyFileSync(
    join(root, "node_modules", "@fontsource", family, "LICENSE"),
    join(out, `${family}-LICENSE.txt`),
  );
}

console.log(`copied ${readdirSync(out).length} files to public/fonts`);
