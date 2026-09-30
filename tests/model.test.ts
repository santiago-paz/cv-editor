// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { BAND_COLORS, MIN_CONTRAST, hex, railContrast } from "@/lib/color";
import { copyTitle } from "@/lib/cv/defaults";
import { sampleCv } from "@/lib/cv/sample";
import { isPhotoUri, readCv, readPhoto } from "@/lib/cv/schema";
import { css as sidebarCss } from "@/lib/cv/templates/sidebar";
import { paginate } from "@/lib/paginate";
import { backup, loadCvs, loadUi, readBackup, saveCvs, saveUi } from "@/lib/storage";

describe("readCv", () => {
  it("reads a CV back unchanged", () => {
    const cv = sampleCv();
    expect(readCv(JSON.parse(JSON.stringify(cv)))).toEqual(cv);
  });

  it("repairs what is missing or broken instead of refusing it", () => {
    const cv = readCv({ title: "", template: "fancy", accent: "blue", person: 7, skills: [null, { text: "Go" }] });
    expect(cv).not.toBeNull();
    expect(cv!.title).toBe("Untitled CV");
    expect(cv!.template).toBe("sidebar");
    expect(cv!.accent).toBe("#10365C");
    expect(cv!.person.name).toBe("");
    expect(cv!.skills.map(item => item.text)).toEqual(["Go"]);
    expect(cv!.skills[0].id).toMatch(/^[a-z0-9]+$/);
  });

  it("cuts strings and lists at their limits", () => {
    const cv = readCv({ person: { name: "x".repeat(5000) }, skills: Array.from({ length: 100 }, () => ({ text: "a" })) });
    expect(cv!.person.name.length).toBe(300);
    expect(cv!.skills.length).toBe(40);
  });

  it("drops sections of a kind it does not know", () => {
    const cv = readCv({ sections: [{ kind: "video", title: "x" }, { kind: "text", title: "About", html: "hi" }] });
    expect(cv!.sections.map(item => item.kind)).toEqual(["text"]);
  });

  it("is not fooled by something that is not a CV", () => {
    expect(readCv(null)).toBeNull();
    expect(readCv("cv")).toBeNull();
  });
});

describe("photos", () => {
  it("takes only base64 image data URIs", () => {
    expect(isPhotoUri("data:image/jpeg;base64,/9j/4AAQ")).toBe(true);
    expect(isPhotoUri("data:image/svg+xml;base64,PHN2Zz4=")).toBe(false);
    expect(isPhotoUri('data:image/jpeg;base64,AA" onerror="x')).toBe(false);
    expect(isPhotoUri("https://example.com/me.jpg")).toBe(false);
    expect(readPhoto({ src: "javascript:alert(1)" })).toBeNull();
  });
});

describe("storage", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips the CVs", () => {
    const cvs = [sampleCv()];
    expect(saveCvs(cvs)).toEqual({ ok: true });
    expect(loadCvs()).toEqual(cvs);
  });

  it("tells a first visit from an emptied list", () => {
    expect(loadCvs()).toBeNull();
    saveCvs([]);
    expect(loadCvs()).toEqual([]);
  });

  it("merges view settings", () => {
    saveUi({ theme: "dark" });
    saveUi({ openId: "abc" });
    saveUi({ theme: undefined });
    expect(loadUi()).toEqual({ openId: "abc" });
  });

  it("restores a backup and says why when it cannot", () => {
    const cv = sampleCv();
    const restored = readBackup(backup([cv], { src: "data:image/jpeg;base64,AAAA" }));
    expect(restored.cvs).toEqual([cv]);
    expect(restored.photo?.src).toBe("data:image/jpeg;base64,AAAA");
    expect(() => readBackup("not json")).toThrow(/not a backup/);
    expect(() => readBackup("{}")).toThrow(/no CVs/);
  });
});

describe("colors", () => {
  it("reads the notations people type", () => {
    expect(hex("#10365c")).toBe("#10365C");
    expect(hex("136")).toBe("#113366");
    expect(hex("rgb(16, 54, 92)")).toBe("#10365C");
    expect(hex("navy")).toBe("");
  });

  it("keeps every preset readable under the rail's faintest text", () => {
    for (const { name, color } of BAND_COLORS) {
      expect(railContrast(color), name).toBeGreaterThanOrEqual(MIN_CONTRAST);
    }
  });

  it("offers the template's own navy first", () => {
    expect(sidebarCss).toContain(`background: ${BAND_COLORS[0].color};`);
  });
});

describe("copyTitle", () => {
  it("numbers copies of copies", () => {
    expect(copyTitle("Frontend CV", [])).toBe("Frontend CV (copy)");
    expect(copyTitle("Frontend CV (copy)", ["Frontend CV (copy)"])).toBe("Frontend CV (copy 2)");
  });
});

describe("paginate", () => {
  const block = (top: number, height: number, heading = false) => ({ top, height, heading });

  it("keeps a short flow on one page", () => {
    const layout = paginate([block(0, 100), block(110, 100)], 0, 210, 1000);
    expect(layout.count).toBe(1);
    expect(layout.lastFill).toBeCloseTo(0.21);
  });

  it("moves a block that does not fit to the next page, whole", () => {
    const layout = paginate([block(0, 600), block(610, 600)], 0, 1210, 1000);
    expect(layout.count).toBe(2);
    expect(layout.cuts[0]).toMatchObject({ at: 610, dead: 390, last: 0 });
  });

  it("takes a heading along with the block under it", () => {
    const layout = paginate([block(0, 800), block(810, 30, true), block(850, 400)], 0, 1250, 1000);
    expect(layout.cuts[0]).toMatchObject({ at: 810, last: 0 });
  });

  it("splits a block taller than a page", () => {
    const layout = paginate([block(0, 2500)], 0, 2500, 1000);
    expect(layout.count).toBe(3);
  });
});
