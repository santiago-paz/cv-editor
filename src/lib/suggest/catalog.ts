import type { Locale } from "@/lib/cv/types";
import cities from "./data/cities";
import companies from "./data/companies";
import degreesDe from "./data/degrees.de";
import degreesEn from "./data/degrees.en";
import degreesEs from "./data/degrees.es";
import familiesBusiness from "./data/families.business";
import familiesPeople from "./data/families.people";
import familiesTech from "./data/families.tech";
import {
  CEFR,
  GENERIC,
  HOBBIES,
  LANGUAGE_CODES,
  LEVELS,
  SECTION_CHOICES,
  type Level,
} from "./data/misc";
import schools from "./data/schools";
import skillsDe from "./data/skills.de";
import skillsEn from "./data/skills.en";
import skillsEs from "./data/skills.es";
import titlesDe from "./data/titles.de";
import titlesEn from "./data/titles.en";
import titlesEs from "./data/titles.es";
import { buildIndex, buildIndexFrom, type Index } from "./rank";
import { expandGender, fold, splitEntry } from "./text";
import type { ByLocale, Family } from "./types";

/* Everything the editor can suggest, as searchable indexes in the CV's
   language. The raw lists are plain text files; this turns them into what the
   search reads. Each catalog is built once, the first time its language is
   used. */

const TITLES: ByLocale<string[]> = { en: titlesEn, es: titlesEs, de: titlesDe };
const SKILLS: ByLocale<string[]> = { en: skillsEn, es: skillsEs, de: skillsDe };
const DEGREES = { en: degreesEn, es: degreesEs, de: degreesDe };

export const FAMILIES: Family[] = [...familiesTech, ...familiesBusiness, ...familiesPeople];

/** The words that turn "Frontend Engineer" into "Senior Frontend Engineer",
    and on which side each language puts them. */
const SENIORITY: ByLocale<{ words: string[]; after: boolean }> = {
  en: { words: ["Senior", "Junior", "Lead"], after: false },
  es: { words: ["Senior", "Junior"], after: true },
  de: { words: ["Senior", "Junior", "Lead"], after: false },
};

interface Entry {
  text: string;
  aliases: string[];
  pop: number;
}

function add(out: Entry[], seen: Set<string>, entry: Entry) {
  const key = fold(entry.text);
  if (seen.has(key)) return;
  seen.add(key);
  out.push(entry);
}

function titleEntries(locale: Locale): Entry[] {
  const out: Entry[] = [];
  const seen = new Set<string>();
  const order: Locale[] = locale === "en" ? ["en"] : [locale, "en"];

  /* A title that is English, such as "Product Owner" in a Spanish list, takes
     Senior in front the way English does, not after it the way Spanish does. */
  const english = new Set<string>();
  for (const raw of TITLES.en) {
    for (const form of expandGender(splitEntry(raw)[0].replace(/\*$/, ""))) english.add(fold(form));
  }

  order.forEach((language, which) => {
    const list = TITLES[language];
    list.forEach((raw, position) => {
      const [display, ...aliases] = splitEntry(raw);
      const levelled = display.endsWith("*");
      const forms = expandGender(levelled ? display.slice(0, -1) : display);
      const aliasForms = aliases.flatMap(expandGender);
      const pop = 5 * (1 - position / list.length) - (which ? 1.5 : 0);
      for (const form of forms) add(out, seen, { text: form, aliases: aliasForms, pop });
      if (!levelled) return;
      for (const form of forms) {
        const rules = language === "en" || english.has(fold(form)) ? SENIORITY.en : SENIORITY[language];
        const withWord = (text: string, word: string) => (rules.after ? `${text} ${word}` : `${word} ${text}`);
        for (const word of rules.words) {
          add(out, seen, {
            text: withWord(form, word),
            aliases: aliasForms.map(alias => withWord(alias, word)),
            pop: Math.max(0, pop - 1.5),
          });
        }
      }
    });
  });
  return out;
}

function skillList(locale: Locale): string[] {
  if (locale === "en") return SKILLS.en;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const entry of [...SKILLS[locale], ...SKILLS.en]) {
    const key = fold(splitEntry(entry)[0] ?? "");
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(entry);
    }
  }
  return out;
}

/* Some kinds of degree only go with some subjects: a law degree with law, an
   engineering degree with engineering. The rest go with anything. */
const LAW_TYPE = /^(ll\.?[bm]|[12]\. staatsexamen|staatsexamen)/;
const LAW_FIELD = /law|legal|derecho|juridic|jurisprudenz|recht|justic|crimin|notar|abogac/;
const ENGINEERING_TYPE = /^(b\.?eng|m\.?eng|dipl\.?-?ing|diplom-?ing)/;
const ENGINEERING_FIELD =
  /engineer|ingenier|ingenieur|technik|tech|comput|software|informat|electr|elektr|mechan|civil|chemi|industri|data|robot|aero|network|cyber|system|architect|arquitect|construc|bau|material|manufactur|energ|environment|ambient|umwelt|biomedic|telecom|automat|mecatr|mechatr|physic|fisica|physik|mathemat|matem|statist|estad/;

function compatible(type: string, field: string): boolean {
  const kind = fold(type);
  const subject = fold(field);
  if (LAW_TYPE.test(kind)) return LAW_FIELD.test(subject);
  if (ENGINEERING_TYPE.test(kind)) return ENGINEERING_FIELD.test(subject);
  return true;
}

/** Each kind of degree with each subject: "B.Sc." and "Computer Science" give
    "B.Sc. Computer Science", found by "bsc comp" or "bsc cs". */
function degreeEntries(locale: Locale): Entry[] {
  const data = DEGREES[locale];
  const out: Entry[] = [];
  const seen = new Set<string>();
  const types = data.types.map(splitEntry);
  const fields = data.fields.map(splitEntry);

  fields.forEach(([field, ...fieldAliases], fieldAt) => {
    types.forEach(([type, ...typeAliases], typeAt) => {
      if (!compatible(type, field)) return;
      const aliases = [
        ...typeAliases.map(alias => `${alias} ${field}`),
        ...fieldAliases.map(alias => `${type} ${alias}`),
        ...typeAliases.slice(0, 2).flatMap(ta => fieldAliases.slice(0, 2).map(fa => `${ta} ${fa}`)),
      ];
      add(out, seen, {
        text: `${type} ${field}`,
        aliases,
        pop: Math.max(0, 5 * (1 - fieldAt / fields.length) - typeAt * 0.3),
      });
    });
  });
  data.standalone.forEach((raw, position) => {
    const [text, ...aliases] = splitEntry(raw);
    add(out, seen, { text, aliases, pop: 5 * (1 - position / data.standalone.length) });
  });
  return out;
}

function regionName(names: Intl.DisplayNames | null, code: string): string {
  try {
    return names?.of(code) ?? code;
  } catch {
    return code;
  }
}

function makeDisplayNames(locales: string[], type: "region" | "language"): Intl.DisplayNames | null {
  try {
    return new Intl.DisplayNames(locales, { type });
  } catch {
    return null;
  }
}

/** "City, Country" in the CV's language, or "City, TX" in the United States
    and Canada. */
export function placeOf(city: (typeof cities)[number], locale: Locale, names: Intl.DisplayNames | null): string {
  const local = (locale === "es" ? city.es : locale === "de" ? city.de : undefined) ?? city.name;
  return `${local}, ${city.region ?? regionName(names, city.cc)}`;
}

function cityEntries(locale: Locale): Entry[] {
  const names = makeDisplayNames([locale], "region");
  const english = makeDisplayNames(["en"], "region");
  const out: Entry[] = [];
  const seen = new Set<string>();
  cities.forEach((city, position) => {
    const text = placeOf(city, locale, names);
    const local = (locale === "es" ? city.es : locale === "de" ? city.de : undefined) ?? city.name;
    const aliases = [
      local,
      city.name,
      city.es,
      city.de,
      `${city.name}, ${city.region ?? regionName(english, city.cc)}`,
      ...(city.alias ?? []),
    ].filter((alias): alias is string => !!alias && fold(alias) !== fold(text));
    add(out, seen, { text, aliases: [...new Set(aliases)], pop: 5 * (1 - position / cities.length) });
  });
  return out;
}

const capitalized = (text: string) => (text ? text[0].toLocaleUpperCase() + text.slice(1) : text);

function languageEntries(locale: Locale): Entry[] {
  const local = makeDisplayNames([locale], "language");
  const english = makeDisplayNames(["en"], "language");
  const out: Entry[] = [];
  const seen = new Set<string>();
  LANGUAGE_CODES.forEach((code, position) => {
    let name: string | undefined;
    let englishName: string | undefined;
    let ownName: string | undefined;
    try {
      name = local?.of(code);
      englishName = english?.of(code);
      ownName = makeDisplayNames([code], "language")?.of(code);
    } catch {
      return;
    }
    if (!name || name === code) return;
    const text = capitalized(name);
    const aliases = [englishName, ownName && capitalized(ownName), code].filter(
      (alias): alias is string => !!alias && fold(alias) !== fold(text),
    );
    add(out, seen, { text, aliases: [...new Set(aliases)], pop: 5 * (1 - position / LANGUAGE_CODES.length) });
  });
  return out;
}

export interface Catalog {
  locale: Locale;
  titles: Index;
  skills: Index;
  companies: Index;
  schools: Index;
  degrees: Index;
  cities: Index;
  hobbies: Index;
  languages: Index;
  levels: Index;
  levelList: Level[];
  sections: Index;
}

const cache = new Map<Locale, Catalog>();

export function catalogOf(locale: Locale): Catalog {
  const known = cache.get(locale);
  if (known) return known;

  const levelList = [...LEVELS[locale], ...CEFR];
  const hobbies = locale === "en" ? HOBBIES.en : [...HOBBIES[locale], ...HOBBIES.en];
  const made: Catalog = {
    locale,
    titles: buildIndexFrom(titleEntries(locale)),
    skills: buildIndex(skillList(locale)),
    companies: buildIndex(companies),
    schools: buildIndex(schools),
    degrees: buildIndexFrom(degreeEntries(locale)),
    cities: buildIndexFrom(cityEntries(locale)),
    hobbies: buildIndex(hobbies),
    languages: buildIndexFrom(languageEntries(locale)),
    levels: buildIndexFrom(levelList.map((level, at) => ({ text: level.name, aliases: level.aliases, pop: 5 - at * 0.3 }))),
    levelList,
    sections: buildIndexFrom(SECTION_CHOICES[locale].map(choice => ({ text: choice.title, aliases: choice.aliases }))),
  };
  cache.set(locale, made);
  return made;
}

/* ---------------------------------------------------------------- families */

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Hyphens read as spaces, so "Front-End" and "front end" are the same words. */
const spaced = (text: string) => fold(text).replace(/-/g, " ").replace(/\s+/g, " ").trim();

/* A family is found by words in the job title. How much may follow a word
   depends on the language it comes from:
   - German words may run on into a compound or an ending ("projektleit" finds
     Projektleiterin), so they only have to start a word. A German phrase of
     several words, such as "head of product", must end at the end of a word,
     or takes a German ending.
   - Spanish words take the endings of gender and number ("contador" finds
     Contadora and "gerente de proyecto" finds Gerente de Proyectos).
   - English words take a plural and nothing else, so "head of product" does not
     find "Head of Production". */
const MATCHERS = FAMILIES.map(family => {
  const words = new Map<string, RegExp>();
  const start = "(^|[^a-z0-9])";
  for (const word of family.match.de) {
    const key = spaced(word);
    const end = key.includes(" ") ? "(?:in|innen|e|en|er|n|s)?(?![a-z0-9])" : "";
    words.set(key, new RegExp(`${start}${escape(key)}${end}`));
  }
  for (const word of family.match.es) {
    const key = spaced(word);
    if (!words.has(key)) words.set(key, new RegExp(`${start}${escape(key)}(?:a|o|as|os|es|s)?(?![a-z0-9])`));
  }
  for (const word of family.match.en) {
    const key = spaced(word);
    if (!words.has(key)) words.set(key, new RegExp(`${start}${escape(key)}(?:s|es)?(?![a-z0-9])`));
  }
  return { family, words: [...words].map(([word, test]) => ({ length: word.length, test })) };
});

/** The family a job title belongs to, by the longest matching phrase, or null
    when nothing fits. */
export function familyOf(title: string): Family | null {
  const text = spaced(title);
  if (!text) return null;
  let best: { family: Family; length: number } | null = null;
  for (const { family, words } of MATCHERS) {
    for (const word of words) {
      if (word.length > (best?.length ?? 0) && word.test.test(text)) best = { family, length: word.length };
    }
  }
  return best?.family ?? null;
}

export function skillsFor(family: Family | null, locale: Locale): string[] {
  return family?.skills[locale] ?? family?.skills.en ?? GENERIC.skills[locale];
}

export function bulletsFor(family: Family | null, locale: Locale): string[] {
  return family?.bullets[locale] ?? family?.bullets.en ?? GENERIC.bullets[locale];
}
