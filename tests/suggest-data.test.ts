import { describe, expect, it } from "vitest";
import type { City, Family } from "@/lib/suggest/types";

/* Every suggestion list ships to the browser and ends up on somebody's CV, so
   each one is held to the same rules: plain hyphens, no stray spaces, no
   duplicates, and counts big enough to be useful. A failing line names the
   entry that broke the rule. */

const LOCALES = ["en", "es", "de"] as const;
type L = (typeof LOCALES)[number];

const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/** "Display|alias|alias" -> the parts. A "|" inside [brackets] belongs to a
    gender mark such as "Enfermer[o|a]" and does not split the entry. */
function parts(entry: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of entry) {
    if (char === "[") depth++;
    if (char === "]") depth = Math.max(0, depth - 1);
    if (char === "|" && depth === 0) {
      out.push(current.trim());
      current = "";
    } else current += char;
  }
  out.push(current.trim());
  return out;
}

function checkText(label: string, value: string, max: number) {
  expect(typeof value, `${label}: not a string`).toBe("string");
  expect(value, `${label}: has spaces at an end`).toBe(value.trim());
  expect(value.length, `${label}: empty`).toBeGreaterThan(0);
  expect(value.length, `${label}: too long`).toBeLessThanOrEqual(max);
  expect(value, `${label}: uses a long dash, use a plain hyphen`).not.toMatch(/[‐-―−]/);
  expect(value, `${label}: uses a curly quote, use ' or "`).not.toMatch(/[‘’‚“”„]/);
  expect(value, `${label}: double space, tab or line break`).not.toMatch(/\s{2,}|[\t\n\r]/);
  expect(value, `${label}: control character`).not.toMatch(/[\u0000-\u001f\u007f]/);
  expect(value, `${label}: emoji`).not.toMatch(/\p{Extended_Pictographic}/u);
  expect(value, `${label}: not in NFC form`).toBe(value.normalize("NFC"));
}

/** Checks a list of "Display|alias" entries and returns the display names. */
function checkList(label: string, list: unknown, { min, max = 80 }: { min: number; max?: number }): string[] {
  expect(Array.isArray(list), `${label}: not an array`).toBe(true);
  const items = list as string[];
  expect(items.length, `${label}: only ${items.length} entries, needs ${min}`).toBeGreaterThanOrEqual(min);
  const seen = new Map<string, string>();
  const names: string[] = [];
  for (const entry of items) {
    checkText(`${label} ${JSON.stringify(entry)}`, entry, max + 60);
    const [display, ...aliases] = parts(entry);
    expect(display, `${label} ${JSON.stringify(entry)}: empty display name`).not.toBe("");
    for (const alias of aliases) expect(alias, `${label} ${JSON.stringify(entry)}: empty alias`).not.toBe("");
    // A trailing * only marks a title that takes Senior and Junior, so two
    // entries that differ only by it are the same title.
    const key = fold(display.replace(/\*$/, ""));
    expect(seen.has(key), `${label}: ${JSON.stringify(display)} is listed twice (also as ${JSON.stringify(seen.get(key))})`).toBe(false);
    seen.set(key, display);
    names.push(display);
  }
  return names;
}

async function load<T>(path: string): Promise<T> {
  const loaded = (await import(/* @vite-ignore */ path)) as { default: T };
  return loaded.default;
}

/* ------------------------------------------------------------- job titles */

describe("titles", () => {
  const MIN: Record<L, number> = { en: 420, es: 260, de: 220 };
  for (const locale of LOCALES) {
    it(`has a good ${locale} list`, async () => {
      const list = await load<string[]>(`@/lib/suggest/data/titles.${locale}`);
      checkList(`titles.${locale}`, list, { min: MIN[locale], max: 70 });
      for (const entry of list) {
        const [display] = parts(entry);
        const label = `titles.${locale} ${JSON.stringify(entry)}`;
        // A trailing * marks a title that also takes Senior, Junior and Lead.
        expect(display.replace(/\*$/, ""), `${label}: * is only allowed at the end`).not.toContain("*");
        const brackets = display.match(/\[[^\]]*\]/g) ?? [];
        if (locale === "en") {
          expect(brackets, `${label}: English titles take no [a|b] gender marks`).toEqual([]);
        }
        for (const bracket of brackets) {
          expect(bracket, `${label}: a gender mark looks like [masculine|feminine]`).toMatch(/^\[[^\[\]|]*\|[^\[\]|]*\]$/);
        }
        expect(display.replace(/\[[^\]]*\]/g, ""), `${label}: stray bracket`).not.toMatch(/[\[\]]/);
      }
    });
  }
});

/* ---------------------------------------------------------------- skills */

describe("skills", () => {
  const MIN: Record<L, number> = { en: 700, es: 300, de: 260 };
  for (const locale of LOCALES) {
    it(`has a good ${locale} list`, async () => {
      const list = await load<string[]>(`@/lib/suggest/data/skills.${locale}`);
      checkList(`skills.${locale}`, list, { min: MIN[locale], max: 50 });
    });
  }
});

/* -------------------------------------------------------------- families */

const FAMILY_FILES = ["tech", "business", "people"] as const;

describe("families", () => {
  for (const file of FAMILY_FILES) {
    it(`reads well in families.${file}`, async () => {
      const families = await load<Family[]>(`@/lib/suggest/data/families.${file}`);
      expect(Array.isArray(families), "not an array").toBe(true);
      expect(families.length, "needs at least 14 families").toBeGreaterThanOrEqual(14);
      const ids = new Set<string>();
      for (const family of families) {
        const at = `family ${JSON.stringify(family.id)}`;
        expect(family.id, `${at}: id must be lowercase letters and hyphens`).toMatch(/^[a-z][a-z-]*$/);
        expect(ids.has(family.id), `${at}: id repeated in this file`).toBe(false);
        ids.add(family.id);
        for (const locale of LOCALES) {
          const match = family.match?.[locale];
          expect(match?.length ?? 0, `${at}.match.${locale}: needs 3 or more`).toBeGreaterThanOrEqual(3);
          for (const word of match) {
            expect(word, `${at}.match.${locale} ${JSON.stringify(word)}: lowercase, no accents, no pipes`).toBe(
              fold(word).replace(/\|/g, ""),
            );
            expect(word.length, `${at}.match.${locale} ${JSON.stringify(word)}: too short`).toBeGreaterThanOrEqual(3);
          }

          const skills = family.skills?.[locale];
          checkList(`${at}.skills.${locale}`, skills, { min: 10, max: 50 });
          expect(skills.length, `${at}.skills.${locale}: keep it to 20 or fewer`).toBeLessThanOrEqual(20);

          const bullets = family.bullets?.[locale];
          expect(bullets?.length ?? 0, `${at}.bullets.${locale}: needs 7 to 12`).toBeGreaterThanOrEqual(7);
          expect(bullets.length, `${at}.bullets.${locale}: needs 7 to 12`).toBeLessThanOrEqual(12);
          const seen = new Set<string>();
          for (const bullet of bullets) {
            const label = `${at}.bullets.${locale} ${JSON.stringify(bullet)}`;
            checkText(label, bullet, 150);
            expect(bullet.length, `${label}: too short to be a full line`).toBeGreaterThanOrEqual(24);
            expect(bullet, `${label}: start with a capital`).toMatch(/^\p{Lu}/u);
            expect(bullet, `${label}: end with a full stop`).toMatch(/\.$/);
            expect(bullet, `${label}: no numbers or money, the person adds their own`).not.toMatch(/[\d%$€£]/);
            expect(seen.has(fold(bullet)), `${label}: listed twice`).toBe(false);
            seen.add(fold(bullet));
          }
        }
      }
    });
  }

  it("uses each id once across all files", async () => {
    const all = (await Promise.all(FAMILY_FILES.map(file => load<Family[]>(`@/lib/suggest/data/families.${file}`)))).flat();
    const ids = all.map(family => family.id);
    expect(ids.filter((id, at) => ids.indexOf(id) !== at), "ids used twice").toEqual([]);
    expect(all.length).toBeGreaterThanOrEqual(45);
  });
});

/* ------------------------------------------------------ companies, schools */

describe("companies and schools", () => {
  it("lists companies", async () => {
    checkList("companies", await load<string[]>("@/lib/suggest/data/companies"), { min: 330, max: 50 });
  });
  it("lists schools", async () => {
    checkList("schools", await load<string[]>("@/lib/suggest/data/schools"), { min: 280, max: 80 });
  });
});

/* ---------------------------------------------------------------- degrees */

describe("degrees", () => {
  for (const locale of LOCALES) {
    it(`has a good ${locale} list`, async () => {
      const data = await load<{ types: string[]; fields: string[]; standalone: string[] }>(
        `@/lib/suggest/data/degrees.${locale}`,
      );
      checkList(`degrees.${locale}.types`, data.types, { min: 10, max: 40 });
      checkList(`degrees.${locale}.fields`, data.fields, { min: 90, max: 50 });
      checkList(`degrees.${locale}.standalone`, data.standalone, { min: 25, max: 70 });
    });
  }
});

/* ---------------------------------------------------------------- places */

describe("cities", () => {
  it("lists cities with a country each", async () => {
    const cities = await load<City[]>("@/lib/suggest/data/cities");
    expect(cities.length).toBeGreaterThanOrEqual(400);
    const seen = new Set<string>();
    for (const city of cities) {
      const label = `city ${JSON.stringify(city.name)}`;
      checkText(label, city.name, 50);
      expect(city.cc, `${label}: country code`).toMatch(/^[A-Z]{2}$/);
      if (city.region) {
        expect(["US", "CA"], `${label}: only US and CA cities take a region`).toContain(city.cc);
        expect(city.region, `${label}: region`).toMatch(/^[A-Z]{2}$/);
      }
      for (const extra of [city.es, city.de, ...(city.alias ?? [])]) if (extra !== undefined) checkText(`${label} extra`, extra, 50);
      const key = `${fold(city.name)}|${city.cc}|${city.region ?? ""}`;
      expect(seen.has(key), `${label}: listed twice`).toBe(false);
      seen.add(key);
    }
    // The spread matters as much as the count: a long list of one region is no use.
    const countries = new Set(cities.map(city => city.cc));
    expect(countries.size, "cities should cover 60 or more countries").toBeGreaterThanOrEqual(60);
  });
});
