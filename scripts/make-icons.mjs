/* Draws the icons that a plain SVG cannot cover, from the same artwork as
   src/app/icon.svg: favicon.ico for old browsers and crawlers, the Apple touch
   icon, and the PNGs the web app manifest lists. Run `npm run icons` after
   changing the artwork, and commit the files it writes.

   The Apple icon and the maskable icon are full squares with no rounded
   corners, because iOS and Android round them (and fill any gap with black or
   a color of their own). The maskable icon also keeps the glyph inside the
   inner 80 percent circle that Android may crop to. The colors are the ones in
   icon.svg: ultramarine, white, the marker and the ink.

   It uses sharp, which comes with Next as an optional dependency and is not
   listed in package.json. Do not add it with `npm install`: npm 11 then drops the
   other platforms' build bindings from package-lock.json. */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const glyph = `
  <rect x="9" y="6" width="14" height="20" rx="3" fill="#fff"/>
  <rect x="11" y="13" width="10" height="5" rx="2.5" fill="#FFD23F"/>
  <path d="M12.5 10h7M12.5 15.5h7M12.5 22h4.5" stroke="#14172B" stroke-width="1.6" stroke-linecap="round" fill="none"/>`;

const svg = (radius, scale = 1) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="${radius}" fill="#3B3DF5"/>
  <g transform="translate(16 16) scale(${scale}) translate(-16 -16)">${glyph}</g>
</svg>`;

const png = (markup, size) => sharp(Buffer.from(markup), { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

/** An .ico file that holds PNG images: a 6-byte header, a 16-byte entry for each
    image, then the images. */
function ico(images) {
  const head = Buffer.alloc(6 + 16 * images.length);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(images.length, 4);
  let offset = head.length;
  images.forEach(({ size, data }, index) => {
    const at = 6 + 16 * index;
    head.writeUInt8(size === 256 ? 0 : size, at);
    head.writeUInt8(size === 256 ? 0 : size, at + 1);
    head.writeUInt16LE(1, at + 4);
    head.writeUInt16LE(32, at + 6);
    head.writeUInt32LE(data.length, at + 8);
    head.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });
  return Buffer.concat([head, ...images.map(image => image.data)]);
}

const rounded = svg(8);
const square = svg(0);

const write = async (path, data) => {
  const file = join(root, path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, data);
  console.log(`${path}  ${data.length} bytes`);
};

await write(
  "src/app/favicon.ico",
  ico(await Promise.all([16, 32, 48].map(async size => ({ size, data: await png(rounded, size) })))),
);
await write("src/app/apple-icon.png", await png(square, 180));
await write("public/icon-192.png", await png(rounded, 192));
await write("public/icon-512.png", await png(rounded, 512));
await write("public/icon-maskable-512.png", await png(svg(0, 0.78), 512));
