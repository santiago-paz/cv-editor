import { textOf } from "../html";
import { sampleCv } from "./sample";
import type { Cv, Section } from "./types";

/* A CV nobody has typed into yet shows an example on the sheet, in its own
   template and color, so the first thing a person sees is what they will get.
   The moment they type, the sheet shows their CV instead. */

const empty = (text: string) => !text.trim();

function sectionIsBlank(section: Section): boolean {
  switch (section.kind) {
    case "roles":
      return section.items.every(
        item =>
          empty(item.title) &&
          empty(item.org) &&
          empty(item.url) &&
          empty(item.dates) &&
          empty(item.note) &&
          item.bullets.every(one => !textOf(one.html)),
      );
    case "projects":
      return section.items.every(
        item =>
          empty(item.name) &&
          item.links.every(one => empty(one.label) && empty(one.url)) &&
          item.bullets.every(one => !textOf(one.html)),
      );
    case "rows":
      return section.rows.every(item => empty(item.label) && !textOf(item.html));
    case "list":
      return section.bullets.every(item => !textOf(item.html));
    case "text":
      return !textOf(section.html);
  }
}

/** True when the CV holds nothing the person wrote. */
export function isBlank(cv: Cv): boolean {
  const person = cv.person;
  return (
    !cv.sample &&
    empty(person.name) &&
    empty(person.role) &&
    empty(person.location) &&
    empty(person.email) &&
    empty(person.phone) &&
    cv.links.every(item => empty(item.label) && empty(item.url)) &&
    !textOf(cv.summary) &&
    cv.skills.every(item => empty(item.text)) &&
    cv.languages.every(item => empty(item.name) && empty(item.level)) &&
    empty(cv.hobbies) &&
    cv.sections.every(sectionIsBlank)
  );
}

/** The sample's words on this CV's template, color and language. */
export function exampleFor(cv: Cv): Cv {
  return { ...sampleCv(), id: cv.id, template: cv.template, accent: cv.accent, locale: cv.locale };
}

/** What the CV is called in lists. A CV still named "Untitled CV" takes its
    owner's name once there is one, so a list of them can be told apart. */
export function cvLabel(cv: Cv): string {
  const title = cv.title.trim();
  if (title && title !== "Untitled CV") return title;
  return cv.person.name.trim() || cv.person.role.trim() || "Untitled CV";
}
