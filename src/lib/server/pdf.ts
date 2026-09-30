import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, PDFHeader, PDFName } from "pdf-lib";
import type { HTTPRequest, Page } from "puppeteer-core";
import { esc } from "../html";
import { fontFiles } from "../cv/fonts";
import { documentHtml, fileName, renderCv, type Rendered } from "../cv/render";
import { sanitizeCv } from "../cv/sanitize-cv";
import { TEMPLATES } from "../cv/templates";
import type { Cv } from "../cv/types";
import { getBrowser } from "./chrome";
import { sanitizeServer } from "./sanitize";

/* A CV in, a PDF out. Nothing is written to disk and nothing is kept.

   The page the CV is printed from can reach nothing: the markup is built here
   from checked data rather than taken from the request, a Content Security
   Policy blocks scripts and every source but its own, and every request the
   page makes is refused except the fonts, which are answered from disk under
   a host that cannot resolve. */

const HOST = "https://cv.invalid/";

const CSP =
  `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; ` +
  `img-src data:; font-src ${HOST}fonts/; style-src 'unsafe-inline'">` +
  `<base href="${HOST}">`;

const fonts = new Map<string, Buffer>();

async function font(name: string): Promise<Buffer> {
  let bytes = fonts.get(name);
  if (!bytes) {
    bytes = await readFile(join(process.cwd(), "public", "fonts", name));
    fonts.set(name, bytes);
  }
  return bytes;
}

export interface Made {
  bytes: Uint8Array;
  name: string;
  pages: number;
}

export async function makePdf(input: Cv, photo: string | null): Promise<Made> {
  return withCv(input, photo, async (page, cv, rendered) => {
    const raw = await page.pdf({ printBackground: true, preferCSSPageSize: true });
    return finish(raw, rendered, fileName(cv));
  });
}

/** Opens a Chrome page holding the CV, its fonts loaded, and hands it to `run`.
    The page is closed afterwards, whatever happens. */
export async function withCv<T>(
  input: Cv,
  photo: string | null,
  run: (page: Page, cv: Cv, rendered: Rendered) => Promise<T>,
): Promise<T> {
  const cv = sanitizeCv(structuredClone(input), sanitizeServer);
  const rendered = renderCv(cv, { photo });
  const allowed = new Set(fontFiles(TEMPLATES[cv.template].families));

  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    page.setDefaultTimeout(20_000);
    await page.setRequestInterception(true);
    page.on("request", (request: HTTPRequest) => {
      void answer(request, allowed);
    });
    await page.setContent(documentHtml(rendered, CSP), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    return await run(page, cv, rendered);
  } finally {
    await page.close().catch(() => undefined);
  }
}

async function answer(request: HTTPRequest, allowed: Set<string>): Promise<void> {
  const url = request.url();
  try {
    if (url.startsWith("data:")) return await request.continue();
    const name = url.startsWith(`${HOST}fonts/`) ? url.slice(`${HOST}fonts/`.length) : "";
    if (allowed.has(name)) {
      return await request.respond({ status: 200, contentType: "font/woff2", body: await font(name) });
    }
    await request.abort();
  } catch {
    await request.abort().catch(() => undefined);
  }
}

/* Chrome signs the file as HeadlessChrome and Skia. This writes the CV's own
   title, author, subject and keywords instead, in the Info dictionary and in
   XMP, since an ATS may read either. */
async function finish(raw: Uint8Array, rendered: Rendered, name: string): Promise<Made> {
  const doc = await PDFDocument.load(raw, { updateMetadata: false });
  const signer = rendered.author || "CV";
  const now = new Date();

  doc.setTitle(rendered.title, { showInWindowTitleBar: true });
  doc.setAuthor(rendered.author);
  doc.setSubject(rendered.description);
  // pdf-lib joins a list with spaces, which would run "CSS and Tailwind" into
  // the next skill. One string keeps the commas.
  doc.setKeywords(rendered.keywords ? [rendered.keywords] : []);
  doc.setCreator(signer);
  doc.setProducer(signer);
  doc.setCreationDate(now);
  doc.setModificationDate(now);
  doc.setLanguage(rendered.lang);

  const xmp = new TextEncoder().encode(xmpPacket(rendered, signer));
  const stream = doc.context.stream(xmp, { Type: "Metadata", Subtype: "XML" });
  doc.catalog.set(PDFName.of("Metadata"), doc.context.register(stream));
  doc.context.header = PDFHeader.forVersion(1, 7);

  return { bytes: await doc.save({ useObjectStreams: false }), name, pages: doc.getPageCount() };
}

function xmpPacket(rendered: Rendered, signer: string): string {
  const alt = (value: string) => `<rdf:Alt><rdf:li xml:lang="x-default">${esc(value)}</rdf:li></rdf:Alt>`;
  return `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:pdf="http://ns.adobe.com/pdf/1.3/"
    xmlns:xmp="http://ns.adobe.com/xap/1.0/">
   <dc:title>${alt(rendered.title)}</dc:title>
   <dc:creator><rdf:Seq><rdf:li>${esc(rendered.author)}</rdf:li></rdf:Seq></dc:creator>
   <dc:description>${alt(rendered.description)}</dc:description>
   <dc:language><rdf:Bag><rdf:li>${esc(rendered.lang)}</rdf:li></rdf:Bag></dc:language>
   <dc:format>application/pdf</dc:format>
   <pdf:Keywords>${esc(rendered.keywords)}</pdf:Keywords>
   <pdf:Producer>${esc(signer)}</pdf:Producer>
   <xmp:CreatorTool>${esc(signer)}</xmp:CreatorTool>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}
