import { LABELS, PRESETS } from "./labels";
import type {
  Bullet,
  Cv,
  Language,
  Link,
  Locale,
  PresetId,
  Project,
  Role,
  Row,
  Section,
  Skill,
} from "./types";

/* Ids only have to be unique inside one browser's list. crypto.randomUUID is
   missing on plain-http pages other than localhost, so this does without. */
let counter = 0;
export function uid(): string {
  counter = (counter + 1) % 1296;
  return (
    Date.now().toString(36) +
    counter.toString(36).padStart(2, "0") +
    Math.random().toString(36).slice(2, 7)
  );
}

/** The sidebar template's own navy. */
export const DEFAULT_ACCENT = "#10365C";

/** The title a CV carries until it is named. It is a marker inside the data,
    not a word to show: lists use `cvLabel`, which says what the editor calls
    such a CV in the language it speaks. */
export const UNTITLED = "Untitled CV";

export const bullet = (html = ""): Bullet => ({ id: uid(), html });
export const link = (label = "", url = ""): Link => ({ id: uid(), label, url });
export const skill = (text = ""): Skill => ({ id: uid(), text });
export const row = (label = "", html = ""): Row => ({ id: uid(), label, html });

export function language(name = "", level = "", percent = 0): Language {
  return { id: uid(), name, level, percent };
}

export function role(fields: Partial<Omit<Role, "id">> = {}): Role {
  return {
    id: uid(),
    title: "",
    org: "",
    url: "",
    dates: "",
    note: "",
    bullets: [bullet()],
    ...fields,
  };
}

export function project(fields: Partial<Omit<Project, "id">> = {}): Project {
  return { id: uid(), name: "", links: [], bullets: [bullet()], ...fields };
}

/** A new section from a preset, with one empty entry to fill in. */
export function section(preset: PresetId, locale: Locale): Section {
  const { kind, title } = PRESETS[preset];
  const base = { id: uid(), title: title[locale], preset };
  switch (kind) {
    case "roles":
      return { ...base, kind, items: [role()] };
    case "projects":
      return { ...base, kind, items: [project()] };
    case "rows":
      return { ...base, kind, rows: [row()] };
    case "list":
      return { ...base, kind, bullets: [bullet()] };
    case "text":
      return { ...base, kind, html: "" };
  }
}

export function blankCv(locale: Locale, title = UNTITLED): Cv {
  const now = Date.now();
  return {
    id: uid(),
    title,
    createdAt: now,
    updatedAt: now,
    template: "sidebar",
    locale,
    accent: DEFAULT_ACCENT,
    showPhoto: true,
    person: { name: "", role: "", location: "", email: "", phone: "" },
    // One empty row each, so the first link and the first language are ready to type into.
    links: [link()],
    summaryTitle: LABELS[locale].profile,
    summary: "",
    skills: [],
    languages: [language()],
    hobbies: "",
    sections: [section("experience", locale), section("education", locale)],
  };
}

/** A copy with fresh ids, so the two can be edited apart. */
export function duplicate(cv: Cv, title: string): Cv {
  const now = Date.now();
  const copy: Cv = JSON.parse(JSON.stringify(cv));
  reId(copy);
  return { ...copy, id: uid(), title, createdAt: now, updatedAt: now, sample: undefined };
}

/* Every object in the tree that carries an id gets a new one. */
function reId(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(reId);
    return;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.id === "string") record.id = uid();
    Object.values(record).forEach(reId);
  }
}

/** What each language of the editor calls a copy. A copy made in one language
    is still recognized as a copy in another. */
export const COPY_WORDS = ["copy", "copia", "Kopie", "cópia"];
const COPY_SUFFIX = new RegExp(`\\s*\\((?:${COPY_WORDS.join("|")})(?: \\d+)?\\)$`, "i");

/** "Frontend CV" -> "Frontend CV (copy)", then "(copy 2)" and so on, with the
    word of the editor's language. */
export function copyTitle(title: string, taken: string[], word = "copy"): string {
  const base = title.replace(COPY_SUFFIX, "") || UNTITLED;
  let next = `${base} (${word})`;
  for (let n = 2; taken.includes(next); n++) next = `${base} (${word} ${n})`;
  return next;
}

/* Switching a CV's language retitles what still carries a default title, so a
   heading the person wrote themselves is never overwritten. Mutates in place,
   for use inside an immer recipe. */
export function relocalize(cv: Cv, to: Locale): void {
  const from = cv.locale;
  if (from === to) return;
  if (cv.summaryTitle === LABELS[from].profile) cv.summaryTitle = LABELS[to].profile;
  for (const item of cv.sections) {
    const preset = item.preset && PRESETS[item.preset];
    if (preset && item.title === preset.title[from]) item.title = preset.title[to];
  }
  cv.locale = to;
}
