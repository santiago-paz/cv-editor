import { anchor, esc, mailUrl, telUrl, webUrl } from "../../html";
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

/* One column, two pages. Application portals that copy a CV into form fields
   (Workday, SuccessFactors, Taleo) read a single column in order, where the
   sidebar's two columns come out interleaved. */
export const css = `
@page { size: A4; margin: 12mm 15mm 12mm 15mm; }

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 9pt;
  line-height: 1.38;
  color: #000;
  -webkit-font-smoothing: antialiased;
  /* Ligatures export as single glyphs (U+FB01), so "workflows" would
     extract as "workﬂows" and miss an ATS keyword match. */
  font-variant-ligatures: none;
}

.header {
  display: flex;
  align-items: center;
  gap: 14pt;
  margin-bottom: 12pt;
}

.header > div { min-width: 0; }

.header img {
  flex: none;
  width: 62pt;
  height: 62pt;
  border-radius: 8pt;
  object-fit: cover;
}

h1 {
  font-size: 22pt;
  font-weight: 700;
  letter-spacing: -0.4pt;
  line-height: 1.1;
  margin-bottom: 4pt;
}

.headline {
  font-size: 10.4pt;
  font-weight: 700;
  margin-bottom: 3pt;
}

.contact-line {
  font-size: 9pt;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

/* Links stay clickable but look like the rest of the sheet. */
a { color: inherit; text-decoration: none; }

.skills p { margin-bottom: 2.5pt; }
.skills .label { font-weight: 700; }

.summary { margin-bottom: 10pt; }

/* The top margin has to clear .entry's bottom margin to show at all:
   adjacent margins collapse to the larger of the two. */
h2 {
  font-size: 12.5pt;
  font-weight: 700;
  margin-top: 11pt;
  margin-bottom: 5pt;
  page-break-after: avoid;
  break-after: avoid;
}

.entry {
  margin-bottom: 6pt;
  page-break-inside: avoid;
  break-inside: avoid;
  overflow-wrap: break-word;
}

.entry-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12pt;
  margin-bottom: 3pt;
}

.org, .date, .role { font-weight: 700; }

/* The name is already the visible text, so a hairline is all the link needs. */
.org a { border-bottom: 0.4pt solid #999; }

.note { font-weight: 400; color: #555; }

.date { flex: none; white-space: nowrap; }

.role { margin-bottom: 4pt; }

/* Native list markers keep bullets in reading order in the PDF text layer. */
ul {
  list-style: disc outside;
  padding-left: 11pt;
  margin-top: 1.5pt;
}

li { margin-bottom: 1pt; }

.project-title {
  font-weight: 700;
  margin-bottom: 5.5pt;
}

.project-title .repo {
  font-weight: 400;
  font-size: 8.3pt;
  color: #555;
}
`;

function roleEntry(item: Role, ctx: RenderContext, path: string): string {
  const note = item.note.trim() ? ` <span class="note">${esc(item.note.trim())}</span>` : "";
  const title = item.title.trim();
  const orgText = item.org.trim();
  const dates = item.dates.trim() ? `<span class="date">${esc(item.dates.trim())}</span>` : "";

  /* The employer leads, with the role under it. Without an employer, the
     role takes its place on the first line. */
  const lead = orgText
    ? `<span class="org">${anchor(orgText, webUrl(item.url))}</span>`
    : title || note
      ? `<span class="org">${esc(title)}${note}</span>`
      : "";
  const second = orgText && (title || note) ? `<div class="role">${esc(title)}${note}</div>` : "";

  return (
    `<div class="entry"${mark(ctx, path)}>` +
    (lead || dates ? `<div class="entry-head">${lead || "<span></span>"}${dates}</div>` : "") +
    second +
    bulletList(item.bullets, ctx, `${path}.bullets`) +
    `</div>`
  );
}

/** A section the template adds on its own: skills, languages and hobbies,
    which the sidebar keeps in its rail. */
function lineSection(title: string, text: string, ctx: RenderContext, path: string): string {
  return `<h2>${esc(title)}</h2>\n<div class="entry skills"${mark(ctx, path)}><p>${esc(text)}</p></div>`;
}

export function body(cv: Cv, ctx: RenderContext): string {
  const { labels } = ctx;
  const person = cv.person;
  const out: string[] = [];

  const heading: string[] = [];
  if (person.name.trim()) heading.push(`<h1${mark(ctx, "person.name")}>${esc(person.name.trim())}</h1>`);
  if (person.role.trim()) heading.push(`<div class="headline"${mark(ctx, "person.role")}>${esc(person.role.trim())}</div>`);

  const contact = [
    person.location.trim() && `<span${mark(ctx, "person.location")}>${esc(person.location.trim())}</span>`,
    person.email.trim() && `<span${mark(ctx, "person.email")}>${anchor(person.email.trim(), mailUrl(person.email))}</span>`,
    person.phone.trim() && `<span${mark(ctx, "person.phone")}>${anchor(person.phone.trim(), telUrl(person.phone))}</span>`,
  ].filter(Boolean);
  if (contact.length) heading.push(`<div class="contact-line">${contact.join(" | ")}</div>`);

  const links = cv.links
    .filter(item => linkText(item))
    .map(item => `<span${mark(ctx, `links.${item.id}`)}>${anchor(linkText(item), webUrl(item.url))}</span>`);
  if (links.length) heading.push(`<div class="contact-line">${links.join(" | ")}</div>`);

  if (ctx.photo || heading.length) {
    out.push(
      `<header class="header">` +
        (ctx.photo ? `<img src="${esc(ctx.photo)}" alt="${esc(person.name)}"${mark(ctx, "photo")}>` : "") +
        (heading.length ? `<div>\n${heading.join("\n")}\n</div>` : "") +
        `</header>`,
    );
  }

  const summary = summaryText(cv);
  if (summary) out.push(`<p class="summary"${mark(ctx, "summary")}>${summary}</p>`);

  const skills = cv.skills.map(item => item.text.trim()).filter(Boolean);
  if (skills.length) out.push(lineSection(labels.skills, skills.join(", "), ctx, "skills"));

  for (const section of cv.sections) {
    const html = sectionHtml(section, ctx, (item, path) => roleEntry(item, ctx, path));
    if (html) out.push(html);
  }

  const languages = cv.languages
    .filter(item => item.name.trim())
    .map(item => languageLine(item.name, item.level));
  if (languages.length) out.push(lineSection(labels.languages, languages.join(", "), ctx, "languages"));

  if (cv.hobbies.trim()) out.push(lineSection(labels.hobbies, cv.hobbies.trim(), ctx, "hobbies"));

  return out.join("\n");
}
