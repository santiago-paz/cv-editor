import { createElement, Fragment, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ago } from "@/components/CvMenu";
import { BAND_COLORS } from "@/lib/color";
import { cvLabel } from "@/lib/cv/blank";
import { COPY_WORDS, UNTITLED, blankCv, copyTitle } from "@/lib/cv/defaults";
import { AI_CODES, BackupError, PDF_CODES, PdfError } from "@/lib/errors";
import { LANGS, LANG_NAMES, fromBrowser, isLang, resolveLang, type Lang } from "@/lib/i18n";
import { LANG_SCRIPT } from "@/lib/i18n/boot";
import de from "@/lib/i18n/de";
import en, { type Dict } from "@/lib/i18n/en";
import { aiMessage, backupMessage, pdfMessage } from "@/lib/i18n/errors";
import es from "@/lib/i18n/es";
import { LEGAL } from "@/lib/i18n/legal";
import pt from "@/lib/i18n/pt";
import { OPERATOR } from "@/lib/operator";

/* The editor speaks four languages from one source of truth, en.tsx. The
   compiler already refuses a language that misses a line or changes what a
   function takes. These tests hold what it cannot: that every line is
   really translated, that a name or a number put into a line comes out of it,
   that no line carries a typographic dash, and that the privacy and terms pages
   say the same things in every language. */

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => createElement("a", { href }, children),
}));

const DICTS: Record<Lang, Dict> = { es, en, de, pt };
const OTHERS = LANGS.filter(lang => lang !== "en");

type Leaf = string | ((...args: unknown[]) => ReactNode);

function leaves(value: unknown, path = ""): [string, Leaf][] {
  if (typeof value === "string" || typeof value === "function") return [[path, value as Leaf]];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) =>
    leaves(item, path ? `${path}.${key}` : key),
  );
}

const html = (node: ReactNode) => renderToStaticMarkup(createElement(Fragment, null, node));

/** What a line says. A function is called with 111, 222, 333 and 444 for its
    arguments, so a name or a number that goes into it can be looked for. */
function say(leaf: Leaf): string {
  return typeof leaf === "string" ? leaf : html(leaf(111, 222, 333, 444));
}

const tags = (markup: string) => markup.match(/<\/?[a-z0-9]+/g) ?? [];

describe("the languages", () => {
  it("name themselves, once each", () => {
    expect(new Set(LANGS).size).toBe(LANGS.length);
    expect(new Set(LANGS.map(lang => LANG_NAMES[lang])).size).toBe(LANGS.length);
    expect(LANGS.every(isLang)).toBe(true);
    expect(isLang("fr")).toBe(false);
  });

  it("are picked from the choice, then from the browser, then English", () => {
    expect(resolveLang("de", ["en"])).toBe("de");
    expect(resolveLang(undefined, ["es-AR", "en"])).toBe("es");
    expect(resolveLang(undefined, ["pt-PT"])).toBe("pt");
    expect(resolveLang(undefined, ["fr-FR", "de-CH", "en"])).toBe("de");
    expect(resolveLang("xx", ["pt-BR"])).toBe("pt");
    expect(resolveLang(null, [])).toBe("en");
    expect(resolveLang(undefined, ["fr"])).toBe("en");
    expect(fromBrowser(undefined)).toBeNull();
    expect(fromBrowser(["est"])).toBeNull();
  });
});

describe("the script that sets the page's language before it paints", () => {
  /* It is a copy of resolveLang in ES5, so it is run against the same cases. */
  function run(stored: string | null | "throws", languages: string[] | undefined, language = "") {
    const root = { lang: "en" };
    const storage = {
      getItem(): string | null {
        if (stored === "throws") throw new Error("blocked");
        return stored;
      },
    };
    const client = languages === undefined ? { language } : { languages, language: languages[0] ?? language };
    new Function("localStorage", "navigator", "document", LANG_SCRIPT)(storage, client, { documentElement: root });
    return root.lang;
  }

  const cases: [string | null | "throws", string[] | undefined, string?][] = [
    [null, ["es-AR", "en"]],
    [null, ["fr", "pt-PT"]],
    [null, ["fr"]],
    [null, []],
    [null, undefined, "de-AT"],
    ['{"lang":"de"}', ["en"]],
    ['{"lang":"xx"}', ["pt-BR"]],
    ['{"theme":"dark"}', ["es"]],
    ["not json", ["de"]],
    ["throws", ["pt"]],
    ['{"lang":"es"}', undefined, "en"],
  ];

  it.each(cases)("agrees with resolveLang for %j and %j", (stored, languages, language) => {
    let chosen: unknown;
    try {
      if (stored !== "throws") chosen = (JSON.parse(stored ?? "{}") as { lang?: unknown }).lang;
    } catch {
      chosen = undefined;
    }
    const browser = languages === undefined ? [language ?? ""] : languages;
    expect(run(stored, languages, language)).toBe(resolveLang(chosen, browser));
  });
});

describe("every language", () => {
  const english = leaves(en);

  it.each(OTHERS)("%s has the lines of the English, the same kind of each", lang => {
    const own = new Map(leaves(DICTS[lang]));
    expect([...own.keys()].sort()).toEqual(english.map(([path]) => path).sort());
    for (const [path, line] of english) {
      const mine = own.get(path)!;
      expect(typeof mine, path).toBe(typeof line);
      if (typeof line === "function") expect((mine as () => void).length, `${path}: arguments`).toBe(line.length);
    }
  });

  it.each(OTHERS)("%s is written out, not left in English", lang => {
    /* A few words are the same in more than one language. Anything else that
       matches the English is a line nobody translated. */
    const same = new Set([
      "common.cancel",
      "common.ctrl",
      "pdf.printWord",
      "pdf.fileWord",
      "pdf.fileMore",
      "pdf.fileLabel",
      "settings.actualSize",
      "settings.zoom",
      "photo.zoom",
      "style.hex",
      "style.colors.Cobalt",
      "style.colors.Petrol",
      "photo.dpi",
      "meter.mm",
      "toolbar.link",
      "templates.classic.name",
      "style.layout",
      "style.button",
      "settings.auto",
      "panel.you",
      "you.email",
      "tokens.addAnother",
      "you.name",
      "you.links",
      "roles.website",
      "sections.projectLinks",
      "sections.text",
      "links.label",
      "photo.optional",
      "photo.size",
    ]);
    const own = new Map(leaves(DICTS[lang]));
    const untranslated = english
      .filter(([path, line]) => say(own.get(path)!) === say(line))
      .map(([path]) => path)
      .filter(path => !same.has(path));
    expect(untranslated).toEqual([]);
  });

  it.each(LANGS)("%s has no empty line and no typographic dash", lang => {
    for (const [path, line] of leaves(DICTS[lang])) {
      const text = say(line);
      expect(text.trim(), `${path}: empty`).not.toBe("");
      expect(text, `${path}: a typographic dash`).not.toMatch(/[\u2010-\u2015\u2212]/);
    }
  });

  it.each(OTHERS)("%s keeps every name and number that goes into a line", lang => {
    const own = new Map(leaves(DICTS[lang]));
    for (const [path, line] of english) {
      if (typeof line !== "function") continue;
      const wanted = say(line);
      const got = say(own.get(path)!);
      for (const sentinel of ["111", "222", "333", "444"]) {
        if (wanted.includes(sentinel)) expect(got, `${path}: lost ${sentinel}`).toContain(sentinel);
      }
    }
  });

  it.each(OTHERS)("%s keeps the markup of the lines that carry some", lang => {
    const own = new Map(leaves(DICTS[lang]));
    for (const [path, line] of english) {
      if (typeof line !== "function") continue;
      expect(tags(say(own.get(path)!)), path).toEqual(tags(say(line)));
    }
  });

  it.each(LANGS)("%s keeps a number and its unit, and a key and its letter, together", lang => {
    const t = DICTS[lang];
    const together = [
      t.photo.dpi(300),
      t.photo.size(20, t.photo.circle),
      t.photo.prints(20, t.photo.circle, "X"),
      t.meter.mm(12),
      t.toolbar.boldTitle,
      t.toolbar.italicTitle,
      t.toolbar.addLinkTitle,
    ];
    for (const line of together) expect(line, line).toContain("\u00a0");
  });

  it.each(LANGS)("%s names every color of the sidebar", lang => {
    for (const color of BAND_COLORS) {
      expect(DICTS[lang].style.colors, color.name).toHaveProperty(color.name);
    }
  });

  it.each(LANGS)("%s says its word for a copy the way the title code expects", lang => {
    const word = DICTS[lang].cvs.copyWord;
    expect(COPY_WORDS).toContain(word);
    expect(copyTitle("Frontend CV", [], word)).toBe(`Frontend CV (${word})`);
    expect(copyTitle(`Frontend CV (${word})`, [`Frontend CV (${word})`], word)).toBe(`Frontend CV (${word} 2)`);
  });

  it.each(LANGS)("%s says how long ago a CV changed, then gives the date", lang => {
    const t = DICTS[lang].cvs;
    const now = Date.UTC(2026, 9, 1, 12);
    expect(ago(now - 10_000, t, lang, now)).toBe(t.justNow);
    expect(ago(now - 5 * 60_000, t, lang, now)).toBe(t.minutesAgo(5));
    expect(ago(now - 3 * 3_600_000, t, lang, now)).toBe(t.hoursAgo(3));
    expect(ago(now - 2 * 86_400_000, t, lang, now)).toBe(t.daysAgo(2));
    expect(ago(now - 30 * 86_400_000, t, lang, now)).toMatch(/\d/);
  });

  it.each(LANGS)("%s names a CV that has no name yet", lang => {
    const cv = blankCv("en");
    expect(cv.title).toBe(UNTITLED);
    expect(cvLabel(cv, DICTS[lang].cvs.untitled)).toBe(DICTS[lang].cvs.untitled);
    cv.person.name = "Ana Ruiz";
    expect(cvLabel(cv, DICTS[lang].cvs.untitled)).toBe("Ana Ruiz");
  });

  it.each(LANGS)("%s has words for every refusal the server and the backup reader can give", lang => {
    const t = DICTS[lang].errors;
    for (const code of PDF_CODES) expect(typeof t.pdf[code], `pdf ${code}`).toBe("string");
    for (const code of AI_CODES) expect(t.ai[code], `ai ${code}`).toBeTruthy();
    expect(pdfMessage(t.pdf, new PdfError("tooLarge", "English"))).toBe(t.pdf.tooLarge);
    expect(pdfMessage(t.pdf, new PdfError("status", "English", 504))).toBe(t.pdf.status(504));
    expect(pdfMessage(t.pdf, new PdfError("somethingNew", "The server's English"))).toBe("The server's English");
    expect(pdfMessage(t.pdf, new Error("boom"))).toBe(t.pdf.generic);
    expect(aiMessage(t.ai, "busy", "English")).toBe(t.ai.busy);
    expect(aiMessage(t.ai, "limitDay", "English")).toContain("10");
    expect(aiMessage(t.ai, "somethingNew", "The server's English")).toBe("The server's English");
    expect(backupMessage(t.backup, new BackupError("noCvs", "English"))).toBe(t.backup.noCvs);
    expect(backupMessage(t.backup, new Error("boom"))).toBe(t.backup.fallback);
  });
});

describe("the privacy and terms pages", () => {
  const pages = ["privacy", "terms"] as const;
  const count = (markup: string, tag: string) => (markup.match(new RegExp(`<${tag}[ >]`, "g")) ?? []).length;

  const numbers = (markup: string) =>
    (markup.replace(/<[^>]*>/g, " ").replace(/&(?:#x?[0-9a-f]+|[a-z]+);/gi, " ").match(/\d+(?:\.\d+)?/g) ?? []).sort();
  const spanish = (markup: string) => markup.match(/<p lang="es">.*?<\/p>/g) ?? [];

  it.each(pages.flatMap(page => OTHERS.map(lang => [page, lang] as const)))(
    "%s in %s has the sections, lists and links of the English",
    (page, lang) => {
      const wanted = html(LEGAL.en[page].body);
      const got = html(LEGAL[lang][page].body);
      for (const tag of ["h2", "p", "ul", "li", "a", "code"]) expect(count(got, tag), `<${tag}>`).toBe(count(wanted, tag));
      expect(got.match(/href="[^"]*"/g)).toEqual(wanted.match(/href="[^"]*"/g));
      expect(got).not.toBe(wanted);
    },
  );

  it.each(pages.flatMap(page => OTHERS.map(lang => [page, lang] as const)))(
    "%s in %s keeps every number, and the notice the law asks to print in Spanish",
    (page, lang) => {
      const wanted = html(LEGAL.en[page].body);
      const got = html(LEGAL[lang][page].body);
      expect(numbers(got)).toEqual(numbers(wanted));
      expect(spanish(got)).toEqual(spanish(wanted));
    },
  );

  it("names the country that the translations name", () => {
    /* The pages say "from Argentina" in each language's own word for it, and
       follow Argentina's law. A different country needs the pages rewritten. */
    expect(OPERATOR.country).toBe("Argentina");
  });

  it.each(LANGS)("%s says its name, when it was updated, and its way back", lang => {
    const text = LEGAL[lang];
    for (const line of [text.back, text.language, text.privacy.title, text.privacy.description, text.terms.title]) {
      expect(line.trim()).not.toBe("");
    }
    expect(text.updated("DATE")).toContain("DATE");
  });

  it.each(LANGS)("%s has no typographic dash", lang => {
    const text = LEGAL[lang];
    const all = [
      text.back,
      text.language,
      text.updated("x"),
      ...(["privacy", "terms"] as const).flatMap(page => [
        text[page].title,
        text[page].description,
        html(text[page].body),
      ]),
    ];
    for (const line of all) expect(line).not.toMatch(/[\u2010-\u2015\u2212]/);
  });
});
