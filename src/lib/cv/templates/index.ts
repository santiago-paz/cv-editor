import type { Cv, TemplateId } from "../types";
import * as classic from "./classic";
import type { RenderContext } from "./shared";
import * as sidebar from "./sidebar";

export interface Template {
  id: TemplateId;
  name: string;
  /** The most pages the template is meant to fill. The gauge turns red past it. */
  pages: number;
  /** The @page margin, in mm. The preview draws it as the paper around the proof. */
  margin: { top: number; right: number; bottom: number; left: number };
  /** The photo frame: its width in mm, and its corner radius as a share of that
      width, so 0.5 is a circle. */
  frame: { mm: number; round: number };
  /** The faces the stylesheet sets, which the fonts module serves. */
  families: string[];
  /** Where the flow sits in the markup, and the spacer cells that give each
      printed page its top and bottom margin, if the template has them. */
  flow: string | null;
  spacers: [string, string] | null;
  css: string;
  body: (cv: Cv, ctx: RenderContext) => string;
  note: string;
}

export const TEMPLATES: Record<TemplateId, Template> = {
  sidebar: {
    id: "sidebar",
    name: "Sidebar",
    pages: 1,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    frame: { mm: 20, round: 0.5 },
    families: ["PT Sans", "PT Serif"],
    flow: "td.flow",
    spacers: ["td.pad-top", "td.pad-bottom"],
    css: sidebar.css,
    body: sidebar.body,
    note: "One page, with a colored rail for your contact details, skills and languages.",
  },
  classic: {
    id: "classic",
    name: "Classic",
    pages: 2,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    frame: { mm: 62 * (25.4 / 72), round: 8 / 62 },
    families: ["Inter"],
    flow: "td.flow",
    spacers: ["td.pad-top", "td.pad-bottom"],
    css: classic.css,
    body: classic.body,
    note: "One column, up to two pages. Job portals that copy your CV into their forms read it best.",
  },
};

export const TEMPLATE_ORDER: TemplateId[] = ["sidebar", "classic"];
