import type { Locale, PresetId, SectionKind } from "./types";

/* The words a template prints on its own: the rail headings, the heading over
   the summary, and the word in the PDF's title. Everything else on the page is
   the person's own text. */
export interface Labels {
  profile: string;
  details: string;
  skills: string;
  links: string;
  languages: string;
  hobbies: string;
  /** Goes in the PDF title and the file name: "Alex Moreno - Designer CV". */
  document: string;
}

export const LABELS: Record<Locale, Labels> = {
  en: {
    profile: "Profile",
    details: "Details",
    skills: "Skills",
    links: "Links",
    languages: "Languages",
    hobbies: "Hobbies",
    document: "CV",
  },
  es: {
    profile: "Perfil",
    details: "Contacto",
    skills: "Habilidades",
    links: "Enlaces",
    languages: "Idiomas",
    hobbies: "Intereses",
    document: "CV",
  },
  de: {
    profile: "Profil",
    details: "Kontakt",
    skills: "Kenntnisse",
    links: "Links",
    languages: "Sprachen",
    hobbies: "Hobbys",
    document: "Lebenslauf",
  },
};

export const LOCALES: { id: Locale; name: string }[] = [
  { id: "en", name: "English" },
  { id: "es", name: "Español" },
  { id: "de", name: "Deutsch" },
];

export interface Preset {
  kind: SectionKind;
  /** What the "Add a section" menu calls it. */
  name: string;
  hint: string;
  title: Record<Locale, string>;
}

export const PRESETS: Record<PresetId, Preset> = {
  experience: {
    kind: "roles",
    name: "Experience",
    hint: "Jobs, with dates and bullets",
    title: { en: "Experience", es: "Experiencia", de: "Berufserfahrung" },
  },
  education: {
    kind: "roles",
    name: "Education",
    hint: "Degrees and courses",
    title: { en: "Education", es: "Formación", de: "Ausbildung" },
  },
  projects: {
    kind: "projects",
    name: "Projects",
    hint: "Things you built, with links",
    title: { en: "Projects", es: "Proyectos", de: "Projekte" },
  },
  keySkills: {
    kind: "rows",
    name: "Skills by group",
    hint: "Lines like “Frontend: React, CSS”",
    title: { en: "Key Skills", es: "Habilidades clave", de: "Kernkompetenzen" },
  },
  awards: {
    kind: "rows",
    name: "Awards and certificates",
    hint: "One labeled line each",
    title: { en: "Awards", es: "Premios", de: "Auszeichnungen" },
  },
  highlights: {
    kind: "list",
    name: "Bullet list",
    hint: "A plain list of points",
    title: { en: "Highlights", es: "Logros", de: "Highlights" },
  },
  text: {
    kind: "text",
    name: "Paragraph",
    hint: "Free text under a heading",
    title: { en: "About", es: "Sobre mí", de: "Über mich" },
  },
};

export const PRESET_ORDER: PresetId[] = [
  "experience",
  "education",
  "projects",
  "keySkills",
  "awards",
  "highlights",
  "text",
];

/** The locale a new CV starts in: the browser's, when the editor knows it. */
export function guessLocale(language: string | undefined): Locale {
  const code = (language || "").slice(0, 2).toLowerCase();
  return code === "es" || code === "de" ? code : "en";
}
