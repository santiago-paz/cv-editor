import { anchor, esc, textOf, webUrl } from "../../html";
import type { Labels } from "../labels";
import type { Bullet, Cv, Link, Project, Section } from "../types";

export interface RenderContext {
  labels: Labels;
  /** The photo to print, as a data URI, or null for none. */
  photo: string | null;
  /** Mark printed elements with the field they come from, so a click on the
      preview can find its field. Never set for the PDF. */
  annotate: boolean;
}

/** ` data-edit="path"` in the preview, nothing in the PDF. */
export function mark(ctx: RenderContext, path: string): string {
  return ctx.annotate ? ` data-edit="${esc(path)}"` : "";
}

const filled = (html: string) => textOf(html) !== "";

export function bulletList(bullets: Bullet[], ctx: RenderContext, path: string): string {
  const items = bullets
    .filter(item => filled(item.html))
    .map(item => `<li${mark(ctx, `${path}.${item.id}`)}>${item.html}</li>`);
  return items.length ? `\n<ul>${items.join("\n")}</ul>` : "";
}

/** A link printed as its label, or as the bare address when it has none. */
export function linkText(item: Link): string {
  return item.label.trim() || item.url.trim().replace(/^[a-z]+:\/\/(www\.)?/i, "").replace(/\/+$/, "");
}

export function projectEntry(item: Project, ctx: RenderContext, path: string): string {
  const links = item.links
    .filter(one => linkText(one))
    .map(one => {
      const href = webUrl(one.url);
      const text = `· ${linkText(one)}`;
      return href ? anchor(text, href, ' class="repo"') : `<span class="repo">${esc(text)}</span>`;
    });
  const title = [esc(item.name), ...links].filter(Boolean).join(" ");
  return (
    `<div class="entry"${mark(ctx, path)}>` +
    (title ? `<div class="project-title">${title}</div>` : "") +
    bulletList(item.bullets, ctx, `${path}.bullets`) +
    `</div>`
  );
}

/** Whether a section has anything to print under its heading. */
export function hasEntries(section: Section): boolean {
  switch (section.kind) {
    case "roles":
    case "projects":
      return section.items.length > 0;
    case "rows":
      return section.rows.length > 0;
    case "list":
      return section.bullets.length > 0;
    case "text":
      return filled(section.html);
  }
}

/** The parts every template prints the same way: labeled rows, bullet lists
    and paragraphs. Roles and projects differ by template and are passed in. */
export function sectionHtml(
  section: Section,
  ctx: RenderContext,
  roleEntry: (role: Extract<Section, { kind: "roles" }>["items"][number], path: string) => string,
): string {
  if (!hasEntries(section)) return "";
  const path = `sections.${section.id}`;
  const heading = section.title.trim()
    ? `<h2${mark(ctx, `${path}.title`)}>${esc(section.title)}</h2>\n`
    : "";

  switch (section.kind) {
    case "roles":
      return heading + section.items.map(item => roleEntry(item, `${path}.${item.id}`)).join("\n");
    case "projects":
      return heading + section.items.map(item => projectEntry(item, ctx, `${path}.${item.id}`)).join("\n");
    case "rows": {
      const rows = section.rows
        .filter(item => item.label.trim() || filled(item.html))
        .map(item => {
          const label = item.label.trim() ? `<span class="label">${esc(item.label.trim())}:</span> ` : "";
          return `<p${mark(ctx, `${path}.${item.id}`)}>${label}${item.html}</p>`;
        });
      return heading + `<div class="entry skills"${mark(ctx, path)}>${rows.join("\n")}</div>`;
    }
    case "list":
      return heading + `<div class="entry"${mark(ctx, path)}>${bulletList(section.bullets, ctx, path)}</div>`;
    case "text":
      return heading + `<div class="entry"${mark(ctx, path)}><p class="text">${section.html}</p></div>`;
  }
}

export function summaryText(cv: Cv): string {
  return filled(cv.summary) ? cv.summary : "";
}

export function languageLine(name: string, level: string): string {
  const parts = [name.trim(), level.trim() ? `(${level.trim()})` : ""].filter(Boolean);
  return parts.join(" ");
}
