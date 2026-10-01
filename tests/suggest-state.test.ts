import { describe, expect, it } from "vitest";
import { cvLabel, exampleFor, isBlank } from "@/lib/cv/blank";
import { blankCv, bullet, duplicate, relocalize, role } from "@/lib/cv/defaults";
import { sampleCv } from "@/lib/cv/sample";
import { historyOf } from "@/lib/suggest/history";
import { search } from "@/lib/suggest/rank";
import { summaryDrafts } from "@/lib/suggest/summary";

describe("isBlank", () => {
  it("is true for a new CV, even with its empty starter rows", () => {
    const cv = blankCv("en");
    expect(cv.links).toHaveLength(1);
    expect(cv.languages).toHaveLength(1);
    expect(isBlank(cv)).toBe(true);
  });

  it("turns false as soon as anything is written", () => {
    const fields: ((cv: ReturnType<typeof blankCv>) => void)[] = [
      cv => (cv.person.name = "A"),
      cv => (cv.person.role = "Nurse"),
      cv => (cv.person.phone = "1"),
      cv => (cv.links[0].url = "github.com/a"),
      cv => (cv.summary = "Hello"),
      cv => cv.skills.push({ id: "s", text: "Go" }),
      cv => (cv.languages[0].name = "Spanish"),
      cv => (cv.hobbies = "Chess"),
      cv => {
        const first = cv.sections[0];
        if (first.kind === "roles") first.items[0].org = "Acme";
      },
      cv => {
        const first = cv.sections[0];
        if (first.kind === "roles") first.items[0].bullets[0].html = "Did things";
      },
    ];
    for (const write of fields) {
      const cv = blankCv("en");
      write(cv);
      expect(isBlank(cv)).toBe(false);
    }
  });

  it("ignores text that is only markup or spaces", () => {
    const cv = blankCv("en");
    cv.summary = "<br>  ";
    cv.person.name = "   ";
    const first = cv.sections[0];
    if (first.kind === "roles") first.items[0].bullets = [bullet("<strong> </strong>")];
    expect(isBlank(cv)).toBe(true);
  });

  it("is false for the sample and for an edited copy of it", () => {
    expect(isBlank(sampleCv())).toBe(false);
    expect(isBlank(duplicate(sampleCv(), "Copy"))).toBe(false);
  });
});

describe("exampleFor", () => {
  it("shows the sample in the CV's own template, color and language", () => {
    const cv = blankCv("de");
    cv.template = "classic";
    cv.accent = "#6B1E2E";
    const example = exampleFor(cv);
    expect(example.id).toBe(cv.id);
    expect(example.template).toBe("classic");
    expect(example.accent).toBe("#6B1E2E");
    expect(example.locale).toBe("de");
    expect(example.person.name).toBe("Alex Moreno");
  });
});

describe("cvLabel", () => {
  it("names an untitled CV after its owner, and keeps a chosen title", () => {
    const cv = blankCv("en");
    expect(cvLabel(cv)).toBe("Untitled CV");
    cv.person.role = "Nurse";
    expect(cvLabel(cv)).toBe("Nurse");
    cv.person.name = "Ana Ruiz";
    expect(cvLabel(cv)).toBe("Ana Ruiz");
    cv.title = "For Acme";
    expect(cvLabel(cv)).toBe("For Acme");
  });
});

describe("summaryDrafts", () => {
  it("builds drafts from what the person already wrote, and nothing more", () => {
    const drafts = summaryDrafts(sampleCv());
    expect(drafts).toEqual([
      "Senior Frontend Engineer based in Berlin, Germany. Skilled in TypeScript, React, Next.js and Node.js.",
      "Senior Frontend Engineer with experience at Northwind Commerce and Kestrel Health. Strengths include TypeScript, React and Next.js.",
      "Senior Frontend Engineer. Speaks Spanish, English and German. Key skills: TypeScript, React, Next.js and Node.js.",
    ]);
  });

  it("offers none until there is a job title", () => {
    expect(summaryDrafts(blankCv("en"))).toEqual([]);
  });

  it("keeps a short CV short", () => {
    const cv = blankCv("en");
    cv.person.role = "Nurse";
    expect(summaryDrafts(cv)).toEqual(["Nurse."]);
  });

  it("writes in the CV's language", () => {
    const cv = sampleCv();
    relocalize(cv, "es");
    expect(summaryDrafts(cv)[0]).toBe(
      "Senior Frontend Engineer residente en Berlin, Germany. Conocimientos en TypeScript, React, Next.js y Node.js.",
    );
    relocalize(cv, "de");
    expect(summaryDrafts(cv)[0]).toMatch(/^Senior Frontend Engineer in Berlin, Germany\. Kenntnisse in TypeScript, React, Next\.js und Node\.js\.$/);
  });

  it("leaves out a school, which is not an employer", () => {
    const cv = blankCv("en");
    cv.person.role = "Analyst";
    const education = cv.sections[1];
    if (education.kind === "roles") education.items[0].org = "State University";
    expect(summaryDrafts(cv).join(" ")).not.toContain("State University");
  });
});

describe("historyOf", () => {
  const mine = (title: string, org: string, skill: string) => {
    const cv = blankCv("en");
    cv.person.role = title;
    cv.skills.push({ id: skill, text: skill });
    const jobs = cv.sections[0];
    if (jobs.kind === "roles") jobs.items[0] = role({ title, org });
    return cv;
  };

  it("offers what the person wrote in their other CVs", () => {
    const a = mine("Barista", "Corner Cafe", "Latte art");
    const b = mine("Line Cook", "Harbor Grill", "Knife skills");
    const history = historyOf([a, b], b.id);
    expect(search(history.titles, "bar").map(hit => hit.text)).toEqual(["Barista"]);
    expect(search(history.companies, "corner").map(hit => hit.text)).toEqual(["Corner Cafe"]);
    expect(search(history.skills, "latte").map(hit => hit.text)).toEqual(["Latte art"]);
  });

  it("leaves out the open CV, so its own half-typed words do not come back", () => {
    const a = mine("Barista", "Corner Cafe", "Latte art");
    const history = historyOf([a], a.id);
    expect(search(history.titles, "bar")).toEqual([]);
  });

  it("leaves out the sample, whose people and companies are made up", () => {
    const history = historyOf([sampleCv()], null);
    expect(search(history.companies, "northwind")).toEqual([]);
  });

  it("puts the most recently changed CV first and shows a word once", () => {
    const old = mine("Barista", "Old Place", "Latte art");
    old.updatedAt = 1;
    const fresh = mine("Barista", "New Place", "Latte art");
    fresh.updatedAt = 2;
    const history = historyOf([old, fresh], null);
    expect(search(history.companies, "place").map(hit => hit.text)).toEqual(["New Place", "Old Place"]);
    expect(search(history.titles, "barista")).toHaveLength(1);
  });
});
