import { describe, expect, it } from "vitest";
import { bulletsFor, familyOf, skillsFor } from "@/lib/suggest/catalog";
import { historyOf } from "@/lib/suggest/history";
import { levelPercent, makeSuggesters } from "@/lib/suggest/sources";
import type { Locale } from "@/lib/cv/types";

/* What a person would really type, and what they should get first. The lists
   grow, but these have to keep working: each is a case where a few letters
   and Enter must land on the right thing. */

const history = historyOf([], null);
const sources = (locale: Locale, role = "") => makeSuggesters({ locale, history, role });
const first = (list: { value: string }[]) => list[0]?.value;
const values = (list: { value: string }[]) => list.map(item => item.value);

describe("job titles", () => {
  const en = sources("en");

  it("finds a title from the first letters of its words", () => {
    expect(first(en.title("sen fr"))).toMatch(/^Senior Frontend/);
    expect(first(en.title("rn"))).toBe("Registered Nurse");
    expect(first(en.title("cash"))).toBe("Cashier");
    expect(first(en.title("data sci"))).toBe("Data Scientist");
  });

  it("offers Senior, Junior and Lead forms, and reads Sr and Jr", () => {
    expect(values(en.title("soft eng"))).toEqual(
      expect.arrayContaining(["Software Engineer", "Senior Software Engineer", "Junior Software Engineer"]),
    );
    expect(first(en.title("jr acc"))).toBe("Junior Accountant");
  });

  it("writes both forms of a Spanish or German title", () => {
    expect(values(sources("es").title("enfer"))).toEqual(expect.arrayContaining(["Enfermero", "Enfermera"]));
    expect(values(sources("de").title("softw"))).toEqual(expect.arrayContaining(["Softwareentwickler", "Softwareentwicklerin"]));
  });

  it("puts Senior after the title in Spanish and before it in English titles", () => {
    const es = sources("es");
    expect(values(es.title("ing civ"))).toEqual(expect.arrayContaining(["Ingeniero Civil Senior"]));
    expect(values(es.title("product ow"))).toEqual(expect.arrayContaining(["Senior Product Owner"]));
    expect(values(es.title("product ow")).some(text => text.endsWith("Product Owner Senior"))).toBe(false);
  });
});

describe("employers and schools", () => {
  const en = sources("en");

  it("finds well known names", () => {
    expect(first(en.company("goo"))).toBe("Google");
    expect(first(en.company("mercado"))).toBe("Mercado Libre");
    expect(first(en.school("uba"))).toBe("Universidad de Buenos Aires");
    expect(first(en.school("mit"))).toBe("Massachusetts Institute of Technology");
  });
});

describe("degrees", () => {
  it("builds a degree from a kind and a subject", () => {
    const en = sources("en");
    expect(first(en.degree("bsc comp"))).toBe("B.Sc. Computer Science");
    expect(first(en.degree("msc dat"))).toBe("M.Sc. Data Science");
    expect(first(en.degree("mba"))).toBe("MBA");
    expect(first(en.degree("high sch"))).toBe("High School Diploma");
  });

  it("keeps a law degree with law and an engineering degree with engineering", () => {
    const en = sources("en");
    expect(first(en.degree("llb"))).toBe("LL.B. Law");
    expect(values(en.degree("llb")).every(text => text.startsWith("LL.B."))).toBe(true);
    expect(values(en.degree("beng")).every(text => !/nursing|history/i.test(text))).toBe(true);
  });

  it("speaks Spanish and German", () => {
    expect(first(sources("es").degree("lic adm"))).toBe("Licenciatura en Administración de Empresas");
    expect(first(sources("de").degree("abi"))).toBe("Abitur");
  });
});

describe("places", () => {
  it("names the city in the CV's language", () => {
    expect(first(sources("en").city("cdmx"))).toBe("Mexico City, Mexico");
    expect(first(sources("es").city("cdmx"))).toBe("Ciudad de México, México");
    expect(first(sources("de").city("muen"))).toBe("München, Deutschland");
    expect(first(sources("es").city("lon"))).toBe("Londres, Reino Unido");
    expect(first(sources("en").city("nyc"))).toBe("New York, NY");
  });

  it("finds a city typed without its accents", () => {
    expect(first(sources("en").city("sao"))).toBe("São Paulo, Brazil");
    expect(first(sources("en").city("cord"))).toBe("Córdoba, Argentina");
  });

  it("offers Remote, and the time zone's city before anything is typed", () => {
    const list = values(sources("en").city(""));
    expect(list).toContain("Remote");
    expect(sources("es").city("rem").map(item => item.value)).toContain("Remoto");
  });
});

describe("skills", () => {
  const en = sources("en", "Senior Frontend Developer");

  it("takes a short name and writes the real one", () => {
    expect(first(en.skill("ts", []))).toBe("TypeScript");
    expect(first(en.skill("k8s", []))).toBe("Kubernetes");
    expect(first(en.skill("postgres", []))).toBe("PostgreSQL");
    expect(first(en.skill("js", []))).toBe("JavaScript");
  });

  it("leaves out what is already added", () => {
    expect(values(en.skill("ts", ["TypeScript"]))).not.toContain("TypeScript");
  });

  it("favors the skills of the person's own job", () => {
    expect(first(en.skill("re", []))).toBe("React");
    expect(first(sources("en", "Recruiter").skill("rec", []))).toMatch(/^Recruit/);
  });

  it("suggests the job's own skills before anything is typed", () => {
    expect(values(en.skill("", [])).slice(0, 3)).toEqual(["JavaScript", "TypeScript", "React"]);
    expect(en.suggestedSkills(["React"], 4)).not.toContain("React");
  });

  it("speaks Spanish and German, and keeps the English names", () => {
    expect(first(sources("es").skill("trab", []))).toBe("Trabajo en equipo");
    expect(first(sources("de").skill("zeit", []))).toBe("Zeitmanagement");
    expect(first(sources("es").skill("ts", []))).toBe("TypeScript");
  });
});

describe("languages and levels", () => {
  it("names the language in the CV's language", () => {
    expect(first(sources("en").language("spa", []))).toBe("Spanish");
    expect(first(sources("es").language("ale", []))).toBe("Alemán");
    expect(first(sources("de").language("eng", []))).toBe("Englisch");
    expect(values(sources("en").language("spa", ["Spanish"]))).not.toContain("Spanish");
  });

  it("offers the levels, and reads the European scale", () => {
    const en = sources("en");
    expect(values(en.level("")).slice(0, 5)).toEqual(["Native", "Fluent", "Advanced", "Intermediate", "Basic"]);
    expect(first(en.level("c1"))).toBe("C1");
    expect(first(sources("es").level("nat"))).toBe("Nativo");
  });

  it("turns a level into the bar the sidebar draws", () => {
    expect(levelPercent("Native")).toBe(100);
    expect(levelPercent("fluent")).toBe(88);
    expect(levelPercent("Muttersprache")).toBe(100);
    expect(levelPercent("C1 (Advanced)")).toBe(88);
    expect(levelPercent("B2")).toBe(75);
    expect(levelPercent("so-so")).toBeNull();
    expect(levelPercent("")).toBeNull();
  });
});

describe("contact details", () => {
  const en = sources("en");

  it("finishes an email from its name and from the start of its domain", () => {
    expect(first(en.email("mia"))).toBe("mia@gmail.com");
    expect(first(en.email("mia.torres@out"))).toBe("mia.torres@outlook.com");
    expect(values(en.email("mia@")).length).toBeGreaterThan(3);
    expect(en.email("mia@acme.example")).toEqual([]);
    expect(en.email("m")).toEqual([]);
  });

  it("starts a link for the person to finish", () => {
    const [line] = en.link("lin");
    expect(line).toMatchObject({ value: "linkedin.com/in/", label: "LinkedIn", keep: true });
    expect(en.link("github.com/mia")).toEqual([]);
    expect(values(en.link("")).length).toBeGreaterThan(3);
  });
});

describe("dates", () => {
  it("fills the date from a shorthand, in the CV's language", () => {
    expect(first(sources("en").dates("3/22 -"))).toBe("Mar 2022 - Present");
    expect(first(sources("es").dates("ene20 -"))).toBe("Ene 2020 - Actualidad");
    expect(first(sources("de").dates("2019 2022"))).toBe("2019 - 2022");
    expect(sources("en").dates("summer")).toEqual([]);
  });
});

describe("bullets", () => {
  const en = sources("en");

  it("suggests whole lines for the job, none already used", () => {
    const lines = values(en.bullet("", [], "Senior Frontend Developer"));
    expect(lines.length).toBeGreaterThanOrEqual(5);
    expect(lines[0]).toMatch(/^Built responsive/);
    expect(values(en.bullet("", [lines[0]], "Senior Frontend Developer"))).not.toContain(lines[0]);
  });

  it("lets Enter take a line only when it starts the way the person started", () => {
    const [top] = en.bullet("bu", [], "Senior Frontend Developer");
    expect(top.strong).toBe(true);
    const inside = en.bullet("stable", [], "Senior Frontend Developer");
    expect(inside.length).toBeGreaterThan(0);
    expect(inside.every(line => !line.strong)).toBe(true);
  });

  it("falls back to lines that fit any job when the title is unknown", () => {
    const lines = values(en.bullet("", [], "Xyzzy Wrangler"));
    expect(lines.length).toBeGreaterThan(3);
    expect(lines[0]).toMatch(/^Worked with colleagues/);
  });

  it("writes them in the CV's language", () => {
    expect(first(sources("es").bullet("", [], "Desarrolladora Frontend"))).toMatch(/^Desarroll/);
    expect(first(sources("de").bullet("", [], "Softwareentwickler"))).toMatch(/^Entwarf|^Entwickelte/);
  });
});

describe("job families", () => {
  it("places a title in its family, whatever the language or the level", () => {
    expect(familyOf("Senior Frontend Developer")?.id).toBe("frontend");
    expect(familyOf("Registered Nurse")?.id).toBe("nurse");
    expect(familyOf("Enfermera")?.id).toBe("nurse");
    expect(familyOf("Electrician")?.id).toBe("construction-trades");
    expect(familyOf("Barista")?.id).toBe("hospitality-service");
    expect(familyOf("Kundenberater")?.id).toBe("customer-service");
    expect(familyOf("xyzzy")).toBeNull();
    expect(familyOf("")).toBeNull();
  });

  it("has skills and bullets for every family in every language", () => {
    for (const title of ["Senior Frontend Developer", "Registered Nurse", "Account Manager", "Truck Driver"]) {
      const family = familyOf(title);
      for (const locale of ["en", "es", "de"] as const) {
        expect(skillsFor(family, locale).length, `${title} ${locale} skills`).toBeGreaterThanOrEqual(10);
        expect(bulletsFor(family, locale).length, `${title} ${locale} bullets`).toBeGreaterThanOrEqual(7);
      }
    }
  });
});
