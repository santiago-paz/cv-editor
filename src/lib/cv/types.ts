/* The CV, as the editor keeps it.
 *
 * Plain data: the templates turn it into markup, localStorage keeps it as
 * JSON, and the PDF route gets it in a POST body. Fields named `html` hold rich
 * text, cut down to what sanitize.ts allows: bold, italics, links and line
 * breaks. Every other string is plain text and gets escaped where it prints.
 */

export type TemplateId = "sidebar" | "classic";
export type Locale = "en" | "es" | "de";

export interface Link {
  id: string;
  label: string;
  url: string;
}

export interface Skill {
  id: string;
  text: string;
}

export interface Language {
  id: string;
  name: string;
  level: string;
  /** How full the sidebar's bar is drawn, 0 to 100. 0 draws no bar. */
  percent: number;
}

export interface Bullet {
  id: string;
  html: string;
}

/** A job, or a degree: the same shape prints both. */
export interface Role {
  id: string;
  title: string;
  org: string;
  url: string;
  dates: string;
  /** A quiet qualifier after the title, such as "(completed)". */
  note: string;
  bullets: Bullet[];
}

export interface Project {
  id: string;
  name: string;
  links: Link[];
  bullets: Bullet[];
}

/** A labeled line, such as "Frontend: React, Next.js". */
export interface Row {
  id: string;
  label: string;
  html: string;
}

export type PresetId =
  | "experience"
  | "education"
  | "projects"
  | "keySkills"
  | "awards"
  | "highlights"
  | "text";

interface SectionBase {
  id: string;
  title: string;
  /** The preset it started from. A title still equal to the preset's own is
      translated when the CV's language changes. */
  preset?: PresetId;
}

export interface RolesSection extends SectionBase {
  kind: "roles";
  items: Role[];
}

export interface ProjectsSection extends SectionBase {
  kind: "projects";
  items: Project[];
}

export interface RowsSection extends SectionBase {
  kind: "rows";
  rows: Row[];
}

export interface ListSection extends SectionBase {
  kind: "list";
  bullets: Bullet[];
}

export interface TextSection extends SectionBase {
  kind: "text";
  html: string;
}

export type Section = RolesSection | ProjectsSection | RowsSection | ListSection | TextSection;
export type SectionKind = Section["kind"];

export interface Person {
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
}

export interface Cv {
  id: string;
  /** The CV's name in the list, never printed. */
  title: string;
  createdAt: number;
  updatedAt: number;
  /** True only for the sample the editor starts with. */
  sample?: boolean;
  template: TemplateId;
  locale: Locale;
  /** The sidebar's band color, "#RRGGBB". */
  accent: string;
  showPhoto: boolean;
  person: Person;
  links: Link[];
  summaryTitle: string;
  summary: string;
  skills: Skill[];
  languages: Language[];
  hobbies: string;
  sections: Section[];
}

/** The headshot. One photo serves every CV; each CV decides whether to print it. */
export interface Photo {
  /** The printed square, as a JPEG data URI. */
  src: string;
  /** The original, shrunk, so the crop can move later. */
  source?: string;
  /** Where the square sits on the original, in the original's pixels. */
  crop?: { width: number; height: number; left: number; top: number; side: number };
}
