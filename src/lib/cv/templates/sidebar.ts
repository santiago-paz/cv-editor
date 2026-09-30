import { anchor, anchorHtml, breakable, esc, mailUrl, telUrl, webUrl } from "../../html";
import { hex } from "../../color";
import { DEFAULT_ACCENT } from "../defaults";
import type { Cv, Role } from "../types";
import {
  bulletList,
  languageLine,
  linkText,
  mark,
  sectionHtml,
  summaryText,
  type RenderContext,
} from "./shared";

/* One page, a colored rail on the left.

   Three mechanisms carry the layout, and each one is load bearing in
   Chrome's print path:

   1. @page margin is 0, because Chrome paints nothing into the page margin.
      A margin here leaves a white strip above and below the band.
   2. The band is position: fixed, which Chrome repeats on every page. The
      rail's copy is position: absolute, so it stays on page 1.
   3. The main column is a table. thead and tfoot repeat on every page, so
      their empty cells are the top and bottom margins @page no longer gives.

   Geometry, in mm: 66 band + 12 gutter + 117 text + 15 right = 210. */
export const css = `
@page { size: A4; margin: 0; }

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: "PT Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 9pt;
  line-height: 1.34;
  color: #0D111A;
  -webkit-font-smoothing: antialiased;
  /* Ligatures export as single glyphs (U+FB01), so "workflows" would
     extract as "workﬂows" and miss an ATS keyword match. */
  font-variant-ligatures: none;
}

/* Tracking wider than about 0.6pt makes PDF readers take every glyph as its
   own word ("S E N I O R"), so the uppercase labels stay tight and get their
   air from word-spacing instead. */
.headline, .date { letter-spacing: 0.55pt; }
.headline { word-spacing: 2pt; }
.date { word-spacing: 1.2pt; }

a { color: inherit; text-decoration: none; }

/* Fixed, so Chrome paints it again on every page. Backgrounds are dropped
   from print unless print-color-adjust asks for them. */
.band {
  position: fixed;
  top: 0;
  left: 0;
  width: 66mm;
  height: 297mm;
  z-index: -2;
  background: ${DEFAULT_ACCENT};
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

.sidebar {
  position: absolute;
  top: 14mm;
  left: 0;
  z-index: -1;
  width: 66mm;
  padding: 0 11mm 0 14mm;
  color: #fff;
}

.sidebar img {
  display: block;
  width: 20mm;
  height: 20mm;
  margin: 0 auto 6pt;
  border-radius: 50%;
  object-fit: cover;
}

.sidebar h1 {
  font-family: "PT Serif", Georgia, serif;
  font-size: 17.5pt;
  font-weight: 700;
  line-height: 1.12;
  text-align: center;
  overflow-wrap: break-word;
}

/* A short rule ties the name to the role under it. */
.name-rule {
  width: 22pt;
  height: 0.8pt;
  margin: 7pt auto;
  background: rgba(255, 255, 255, 0.5);
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

.headline {
  font-size: 7.2pt;
  font-weight: 700;
  text-transform: uppercase;
  text-align: center;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.5;
}

.sidebar h3 {
  font-family: "PT Serif", Georgia, serif;
  font-size: 11pt;
  font-weight: 700;
  margin: 20pt 0 5pt;
}

.sidebar p, .sidebar li {
  font-size: 8.4pt;
  line-height: 1.42;
  color: rgba(255, 255, 255, 0.92);
}

.sidebar ul { list-style: none; padding: 0; }
.sidebar li { margin-bottom: 2.8pt; }

/* Long addresses in a 41mm column break rather than run into the white. */
.sidebar p, .sidebar li { overflow-wrap: anywhere; }

/* Language bars: the track is the fill's white at 28%, so the two read as
   one object. */
.meter {
  height: 1.6pt;
  margin: 2.5pt 0 5.5pt;
  background: rgba(255, 255, 255, 0.28);
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

.meter span {
  display: block;
  height: 100%;
  background: #fff;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

/* table-layout: fixed, or the declared width is only a suggestion: one long
   URL would widen the cell and push the column into the right margin. */
table.main {
  table-layout: fixed;
  margin-left: 66mm;
  width: 144mm;
  border-collapse: collapse;
}

table.main td { padding: 0; vertical-align: top; }

/* The repeating top and bottom margins. */
table.main td.pad-top { height: 14mm; }
table.main td.pad-bottom { height: 11mm; }

/* Qualified with table.main, or the rule above wins on specificity. */
table.main td.flow {
  padding: 0 15mm 0 12mm;
  overflow-wrap: break-word;
}

h2 {
  font-family: "PT Serif", Georgia, serif;
  font-size: 12.5pt;
  font-weight: 700;
  margin: 12pt 0 4pt;
  page-break-after: avoid;
  break-after: avoid;
}

table.main td.flow > h2:first-child { margin-top: 0; }

.entry {
  margin-bottom: 5pt;
  page-break-inside: avoid;
  break-inside: avoid;
}

.entry-head { margin-bottom: 1pt; }

.role, .org {
  font-size: 9.6pt;
  font-weight: 700;
}

.org a { border-bottom: 0.4pt solid #A9B2BD; }

.date {
  display: block;
  font-size: 7.4pt;
  text-transform: uppercase;
  color: #8C929B;
  margin: 1.5pt 0 3pt;
}

.note { font-weight: 400; color: #555; }

.summary { margin-top: 5pt; }

/* Native list markers keep bullets in reading order in the PDF text layer.
   Markers drawn some other way are extracted apart from their text, which
   breaks ATS parsing. */
ul {
  list-style: disc outside;
  padding-left: 22pt;
  margin-top: 1.5pt;
}

li { margin-bottom: 1pt; }

.skills p { margin-bottom: 2.5pt; }
.skills .label { font-weight: 700; }

.project-title {
  font-size: 9.6pt;
  font-weight: 700;
  margin-bottom: 2.5pt;
}

/* The address is spelled out rather than hidden behind the title: it
   survives printing. */
.project-title .repo {
  font-weight: 400;
  font-size: 8.2pt;
  color: #6B7280;
}
`;

function roleEntry(item: Role, ctx: RenderContext, path: string): string {
  const note = item.note.trim() ? ` <span class="note">${esc(item.note.trim())}</span>` : "";
  const title = item.title.trim() ? `<span class="role">${esc(item.title.trim())}${note}</span>` : "";
  const orgText = item.org.trim();
  const org = orgText ? `<span class="org">${anchor(orgText, webUrl(item.url))}</span>` : "";
  const head = [title, org].filter(Boolean).join(", ") || (note ? `<span class="role">${note}</span>` : "");
  const date = item.dates.trim() ? `\n<span class="date">${esc(item.dates.trim())}</span>` : "";
  return (
    `<div class="entry"${mark(ctx, path)}>` +
    (head || date ? `<div class="entry-head">${head}${date}</div>` : "") +
    bulletList(item.bullets, ctx, `${path}.bullets`) +
    `</div>`
  );
}

export function body(cv: Cv, ctx: RenderContext): string {
  const { labels } = ctx;
  const person = cv.person;
  const rail: string[] = [];

  if (ctx.photo) rail.push(`<img src="${esc(ctx.photo)}" alt="${esc(person.name)}"${mark(ctx, "photo")}>`);
  if (person.name.trim()) rail.push(`<h1${mark(ctx, "person.name")}>${esc(person.name.trim())}</h1>`);
  if (person.name.trim() && person.role.trim()) rail.push(`<div class="name-rule"></div>`);
  if (person.role.trim()) rail.push(`<div class="headline"${mark(ctx, "person.role")}>${esc(person.role.trim())}</div>`);

  const details = [
    person.location.trim() && `<p${mark(ctx, "person.location")}>${esc(person.location.trim())}</p>`,
    person.phone.trim() && `<p${mark(ctx, "person.phone")}>${anchor(person.phone.trim(), telUrl(person.phone))}</p>`,
    person.email.trim() &&
      `<p${mark(ctx, "person.email")}>${anchorHtml(breakable(person.email.trim()), mailUrl(person.email))}</p>`,
  ].filter(Boolean);
  if (details.length) rail.push(`<h3>${esc(labels.details)}</h3>`, ...(details as string[]));

  const skills = cv.skills.filter(item => item.text.trim());
  if (skills.length) {
    rail.push(
      `<h3>${esc(labels.skills)}</h3>`,
      `<ul${mark(ctx, "skills")}>` +
        skills.map(item => `<li${mark(ctx, `skills.${item.id}`)}>${esc(item.text.trim())}</li>`).join("\n") +
        `</ul>`,
    );
  }

  const links = cv.links.filter(item => linkText(item));
  if (links.length) {
    rail.push(
      `<h3>${esc(labels.links)}</h3>`,
      `<ul class="links"${mark(ctx, "links")}>` +
        links
          .map(item => `<li${mark(ctx, `links.${item.id}`)}>${anchorHtml(breakable(linkText(item)), webUrl(item.url))}</li>`)
          .join("\n") +
        `</ul>`,
    );
  }

  const languages = cv.languages.filter(item => item.name.trim());
  if (languages.length) {
    rail.push(`<h3>${esc(labels.languages)}</h3>`);
    for (const item of languages) {
      rail.push(`<p${mark(ctx, `languages.${item.id}`)}>${esc(languageLine(item.name, item.level))}</p>`);
      const percent = Math.max(0, Math.min(100, Math.round(item.percent)));
      if (percent > 0) rail.push(`<div class="meter"><span style="width: ${percent}%"></span></div>`);
    }
  }

  if (cv.hobbies.trim()) {
    rail.push(`<h3>${esc(labels.hobbies)}</h3>`, `<p${mark(ctx, "hobbies")}>${esc(cv.hobbies.trim())}</p>`);
  }

  const flow: string[] = [];
  const summary = summaryText(cv);
  if (summary) {
    if (cv.summaryTitle.trim()) flow.push(`<h2${mark(ctx, "summaryTitle")}>${esc(cv.summaryTitle.trim())}</h2>`);
    flow.push(`<p class="summary"${mark(ctx, "summary")}>${summary}</p>`);
  }
  for (const section of cv.sections) {
    const html = sectionHtml(section, ctx, (item, path) => roleEntry(item, ctx, path));
    if (html) flow.push(html);
  }

  const accent = hex(cv.accent) || DEFAULT_ACCENT;
  return [
    `<div class="band" style="background-color: ${accent}"></div>`,
    `<aside class="sidebar">\n${rail.join("\n")}\n</aside>`,
    `<table class="main">`,
    `<thead><tr><td class="pad-top"></td></tr></thead>`,
    `<tfoot><tr><td class="pad-bottom"></td></tr></tfoot>`,
    `<tbody><tr><td class="flow">\n${flow.join("\n")}\n</td></tr></tbody>`,
    `</table>`,
  ].join("\n");
}
