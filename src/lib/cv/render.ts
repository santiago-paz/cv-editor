import { esc, textOf } from "../html";
import { fontCss } from "./fonts";
import { LABELS } from "./labels";
import { TEMPLATES } from "./templates";
import type { Cv } from "./types";

/* One renderer for the preview and the PDF, so what the page shows is what
   the file prints. */

export interface Rendered {
  lang: string;
  title: string;
  author: string;
  description: string;
  keywords: string;
  /** @font-face rules, then the template's stylesheet. */
  css: string;
  body: string;
}

export interface RenderOptions {
  /** The photo as a data URI, or null to print none. */
  photo: string | null;
  annotate?: boolean;
}

export function renderCv(cv: Cv, options: RenderOptions): Rendered {
  const template = TEMPLATES[cv.template] ?? TEMPLATES.sidebar;
  const labels = LABELS[cv.locale] ?? LABELS.en;
  const name = cv.person.name.trim();
  const role = cv.person.role.trim();

  const title = [name, role].filter(Boolean).join(" - ") + (name || role ? " " : "") + labels.document;
  const summary = textOf(cv.summary);

  return {
    lang: cv.locale,
    title,
    author: name,
    description: summary.length > 300 ? summary.slice(0, 297).trimEnd() + "..." : summary,
    keywords: cv.skills
      .map(item => item.text.trim())
      .filter(Boolean)
      .join(", "),
    css: fontCss(template.families) + "\n" + template.css,
    body: template.body(cv, {
      labels,
      photo: cv.showPhoto && options.photo ? options.photo : null,
      annotate: !!options.annotate,
    }),
  };
}

/** A whole HTML document, for the PDF and for printing. `head` goes first in
    <head>, before anything that could load. */
export function documentHtml(rendered: Rendered, head = ""): string {
  const meta = [
    `<meta charset="utf-8">`,
    head,
    `<title>${esc(rendered.title)}</title>`,
    rendered.author && `<meta name="author" content="${esc(rendered.author)}">`,
    rendered.description && `<meta name="description" content="${esc(rendered.description)}">`,
    rendered.keywords && `<meta name="keywords" content="${esc(rendered.keywords)}">`,
    `<style>\n${rendered.css}\n</style>`,
  ].filter(Boolean);
  return (
    `<!DOCTYPE html>\n<html lang="${esc(rendered.lang)}">\n<head>\n${meta.join("\n")}\n</head>\n` +
    `<body>\n${rendered.body}\n</body>\n</html>\n`
  );
}

/** "Alex Moreno" -> "Alex_Moreno_CV.pdf". Letters from any alphabet stay;
    what a file system could trip on goes. */
export function fileName(cv: Cv): string {
  const labels = LABELS[cv.locale] ?? LABELS.en;
  const name = cv.person.name
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}\s.'-]/gu, "")
    .trim()
    .replace(/\s+/g, "_");
  return `${name ? name + "_" : ""}${labels.document}.pdf`;
}
