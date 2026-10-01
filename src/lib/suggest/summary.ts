import type { Cv, Locale } from "@/lib/cv/types";

/* A first draft of the summary, built only from what the person already typed:
   the job title, the city, the skills, the employers and the languages. It
   adds no claim of its own, so nothing on it can be untrue. The person picks
   one and edits it. */

const LIST_LOCALE: Record<Locale, string> = { en: "en-GB", es: "es", de: "de" };

function joined(locale: Locale, items: string[]): string {
  try {
    return new Intl.ListFormat(LIST_LOCALE[locale], { style: "long", type: "conjunction" }).format(items);
  } catch {
    return items.join(", ");
  }
}

interface Facts {
  role: string;
  city: string;
  skills: string[];
  companies: string[];
  languages: string[];
}

function factsOf(cv: Cv): Facts {
  const clean = (text: string) => text.trim().replace(/[.,;\s]+$/, "");
  const unique = (list: string[]) => [...new Set(list.map(clean).filter(Boolean))];
  const companies = cv.sections.flatMap(section =>
    section.kind === "roles" && section.preset !== "education" ? section.items.map(item => item.org) : [],
  );
  return {
    role: clean(cv.person.role),
    city: clean(cv.person.location),
    skills: unique(cv.skills.map(item => item.text)),
    companies: unique(companies),
    languages: unique(cv.languages.map(item => item.name)),
  };
}

type Make = (facts: Facts, list: (items: string[]) => string) => (string | null)[];

const DRAFTS: Record<Locale, Make> = {
  en: (f, list) => [
    `${f.role}${f.city ? ` based in ${f.city}` : ""}.${f.skills.length ? ` Skilled in ${list(f.skills.slice(0, 4))}.` : ""}`,
    f.companies.length
      ? `${f.role} with experience at ${list(f.companies.slice(0, 2))}.${f.skills.length ? ` Strengths include ${list(f.skills.slice(0, 3))}.` : ""}`
      : null,
    f.languages.length > 1 || (f.languages.length && f.skills.length)
      ? `${f.role}.${f.languages.length ? ` Speaks ${list(f.languages.slice(0, 3))}.` : ""}${f.skills.length ? ` Key skills: ${list(f.skills.slice(0, 4))}.` : ""}`
      : null,
  ],
  es: (f, list) => [
    `${f.role}${f.city ? ` residente en ${f.city}` : ""}.${f.skills.length ? ` Conocimientos en ${list(f.skills.slice(0, 4))}.` : ""}`,
    f.companies.length
      ? `${f.role} con experiencia en ${list(f.companies.slice(0, 2))}.${f.skills.length ? ` Puntos fuertes: ${list(f.skills.slice(0, 3))}.` : ""}`
      : null,
    f.languages.length > 1 || (f.languages.length && f.skills.length)
      ? `${f.role}.${f.languages.length ? ` Habla ${list(f.languages.slice(0, 3))}.` : ""}${f.skills.length ? ` Habilidades clave: ${list(f.skills.slice(0, 4))}.` : ""}`
      : null,
  ],
  de: (f, list) => [
    `${f.role}${f.city ? ` in ${f.city}` : ""}.${f.skills.length ? ` Kenntnisse in ${list(f.skills.slice(0, 4))}.` : ""}`,
    f.companies.length
      ? `${f.role} mit Erfahrung bei ${list(f.companies.slice(0, 2))}.${f.skills.length ? ` Stärken: ${list(f.skills.slice(0, 3))}.` : ""}`
      : null,
    f.languages.length > 1 || (f.languages.length && f.skills.length)
      ? `${f.role}.${f.languages.length ? ` Spricht ${list(f.languages.slice(0, 3))}.` : ""}${f.skills.length ? ` Kernkompetenzen: ${list(f.skills.slice(0, 4))}.` : ""}`
      : null,
  ],
};

/** Up to three drafts, as plain text. Empty until there is a job title. */
export function summaryDrafts(cv: Cv): string[] {
  const facts = factsOf(cv);
  if (!facts.role) return [];
  const drafts = DRAFTS[cv.locale]?.(facts, items => joined(cv.locale, items)) ?? [];
  return [...new Set(drafts.filter((text): text is string => !!text))];
}
