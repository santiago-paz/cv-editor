import { describe, expect, it } from "vitest";
import { blankCv, duplicate, relocalize, section } from "@/lib/cv/defaults";
import { documentHtml, fileName, renderCv } from "@/lib/cv/render";
import { sampleCv } from "@/lib/cv/sample";
import { bareUrl, breakable, safeUrl, textOf, webUrl } from "@/lib/html";

describe("renderCv", () => {
  it("escapes every plain-text field", () => {
    const cv = sampleCv();
    cv.person.name = '<img src=x onerror="alert(1)">';
    cv.person.role = "R&D <lead>";
    cv.skills[0].text = "<script>";
    cv.hobbies = '"quoted"';
    for (const template of ["sidebar", "classic"] as const) {
      cv.template = template;
      const { body, title } = renderCv(cv, { photo: null });
      expect(body).not.toContain("<img src=x");
      expect(body).not.toContain("<script>");
      expect(body).toContain("R&amp;D &lt;lead&gt;");
      expect(title).toContain("R&D <lead>");
    }
  });

  it("prints no link for an unsafe address", () => {
    const cv = sampleCv();
    cv.links[0].url = "javascript:alert(1)";
    expect(renderCv(cv, { photo: null }).body).not.toContain("javascript:");
  });

  it("prints the photo only when the CV asks for it", () => {
    const cv = sampleCv();
    const photo = "data:image/jpeg;base64,AAAA";
    expect(renderCv(cv, { photo }).body).toContain(photo);
    cv.showPhoto = false;
    expect(renderCv(cv, { photo }).body).not.toContain(photo);
  });

  it("marks fields for the preview and never for the PDF", () => {
    const cv = sampleCv();
    expect(renderCv(cv, { photo: null, annotate: true }).body).toContain('data-edit="person.name"');
    expect(renderCv(cv, { photo: null }).body).not.toContain("data-edit");
  });

  it("puts the rail's lists in Classic as sections of their own", () => {
    const cv = sampleCv();
    cv.template = "classic";
    const { body } = renderCv(cv, { photo: null });
    expect(body).toContain("<h2>Skills</h2>");
    expect(body).toContain("Spanish (Native), English (Fluent)");
    expect(body.indexOf("<h2>Skills</h2>")).toBeLessThan(body.indexOf(">Experience</h2>"));
    expect(body.indexOf(">Awards</h2>")).toBeLessThan(body.indexOf("<h2>Languages</h2>"));
  });

  it("leaves out empty bullets and sections with nothing in them", () => {
    const cv = blankCv("en");
    const { body } = renderCv(cv, { photo: null });
    expect(body).not.toContain("<li>");
    expect(body).not.toContain("<h2>Profile</h2>");
    // A new section keeps its heading, so it shows up as soon as it is added.
    expect(body).toContain(">Experience</h2>");
  });

  it("writes a full document with the CV's own title and metadata", () => {
    const html = documentHtml(renderCv(sampleCv(), { photo: null }));
    expect(html).toMatch(/^<!DOCTYPE html>/);
    expect(html).toContain("<title>Alex Moreno - Senior Frontend Engineer CV</title>");
    expect(html).toContain('<meta name="keywords" content="TypeScript, React');
    expect(html).toContain('<html lang="en">');
  });

  it("uses the CV's language for the words the template prints", () => {
    const cv = sampleCv();
    relocalize(cv, "de");
    const { body, title } = renderCv(cv, { photo: null });
    expect(body).toContain("<h3>Kenntnisse</h3>");
    expect(body).toContain(">Berufserfahrung</h2>");
    expect(title.endsWith("Lebenslauf")).toBe(true);
  });
});

describe("relocalize", () => {
  it("translates default headings and keeps renamed ones", () => {
    const cv = blankCv("en");
    cv.sections.push(section("projects", "en"));
    cv.sections[1].title = "Schooling";
    relocalize(cv, "es");
    expect(cv.sections.map(item => item.title)).toEqual(["Experiencia", "Schooling", "Proyectos"]);
    expect(cv.summaryTitle).toBe("Perfil");
  });
});

describe("duplicate", () => {
  it("gives every part of the copy a new id", () => {
    const cv = sampleCv();
    const copy = duplicate(cv, "Copy");
    const ids = (value: unknown): string[] =>
      Array.isArray(value)
        ? value.flatMap(ids)
        : value && typeof value === "object"
          ? Object.entries(value).flatMap(([key, inner]) => (key === "id" ? [inner as string] : ids(inner)))
          : [];
    const before = new Set(ids(cv));
    expect(ids(copy).some(id => before.has(id))).toBe(false);
    expect(copy.sample).toBeUndefined();
  });
});

describe("fileName", () => {
  it("keeps accented names and drops what a file system trips on", () => {
    const cv = sampleCv();
    cv.person.name = "José  Müller/Ñandú";
    expect(fileName(cv)).toBe("José_MüllerÑandú_CV.pdf");
    cv.person.name = "";
    expect(fileName(cv)).toBe("CV.pdf");
  });
});

describe("addresses", () => {
  it("adds https to a bare domain and refuses other schemes", () => {
    expect(webUrl("example.com/me")).toBe("https://example.com/me");
    expect(webUrl("javascript:alert(1)")).toBe("");
    expect(safeUrl("ftp://example.com")).toBe("");
    expect(bareUrl("https://www.example.com/me/")).toBe("example.com/me");
  });

  it("lets an address wrap after its slashes and dots", () => {
    expect(breakable("github.com/you")).toBe("github.<wbr>com/<wbr>you");
    expect(textOf("a <strong>b</strong>&amp;c<br>d")).toBe("a b&c d");
  });
});
