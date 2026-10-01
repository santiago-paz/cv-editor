import { describe, expect, it } from "vitest";
import { familyOf } from "@/lib/suggest/catalog";

/* A job title finds its family by the words in it. These are the titles where a
   loose match went wrong, or nearly did: a word hidden inside a longer word, a
   word that means two things, a title in another language than its list. */

const idOf = (title: string) => familyOf(title)?.id ?? null;

const CASES: [string, string | null][] = [
  // A word of one family inside a title of another
  ["Server-Side Developer", "backend"],
  ["Server", "hospitality-service"],
  ["Head of Production", "operations"],
  ["Head of Product", "product-manager"],
  ["Product Designer", "ux-design"],
  ["Product Marketing Manager", "marketing"],
  ["Sales Engineer", "sales"],
  ["Executive Chef", "cook-chef"],
  ["Executive Assistant", "office-admin"],
  ["Creative Director", "graphic-creative"],
  ["Director of Engineering", "engineering-manager"],
  ["Support Engineer", "it-support"],
  ["Hardware Engineer", "embedded-engineer"],
  ["Web Designer", "ux-design"],
  ["Web Developer", "frontend"],

  // A word that only starts another word
  ["Medical Coder", null],
  ["Hosting Engineer", null],
  ["Teamleiter", null],

  // English takes a plural, and nothing else
  ["Nurses", "nurse"],
  ["Accountants", "accountant"],
  ["Sales Representatives", "sales"],

  // Spanish takes the endings of gender and number
  ["Contadora Pública", "accountant"],
  ["Gerente de Proyectos", "project-management"],
  ["Jefe de Producción", "operations"],
  ["Jefa de Producción", "operations"],
  ["Operaria", "manufacturing"],
  ["Desarrolladora Frontend", "frontend"],
  ["Enfermera", "nurse"],
  ["Abogada", "legal"],
  ["Notaria", "legal"],

  // German runs on into compounds and into "-in"
  ["Softwareentwicklerin", "software-engineer"],
  ["Projektleiterin", "project-management"],
  ["Chefbuchhalter", "accountant"],
  ["Notarin", "legal"],
  ["Notarfachangestellte", "legal"],
  ["Notarzt", "healthcare-clinician"],
  ["Lagerlogistiker", "warehouse"],
  ["Recruiterin", "hr-recruiting"],
  ["Key Account Managerin", "account-management"],
  ["Kfz-Mechatroniker", "automotive-mechanic"],
  ["Marketingmanager", "marketing"],

  // Hyphens read as spaces
  ["Front-End Engineer", "frontend"],
  ["Back End Developer", "backend"],
];

describe("family of a job title", () => {
  for (const [title, family] of CASES) {
    it(`${title} is ${family ?? "no family"}`, () => {
      expect(idOf(title)).toBe(family);
    });
  }

  it("takes the longest matching phrase", () => {
    // "chef" alone is a cook, but the whole phrase names a manager of a kitchen brigade
    expect(idOf("Sous Chef")).toBe("cook-chef");
    // "manager" alone matches nothing, "product manager" matches a family
    expect(idOf("Manager")).toBeNull();
  });

  it("is empty for a blank title", () => {
    expect(familyOf("")).toBeNull();
    expect(familyOf("   ")).toBeNull();
  });
});
