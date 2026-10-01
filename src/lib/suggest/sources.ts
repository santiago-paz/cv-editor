import type { Locale, PresetId } from "@/lib/cv/types";
import { bulletsFor, catalogOf, familyOf, skillsFor } from "./catalog";
import { emailSuggestions, linkSuggestions } from "./contact";
import { dateSuggestions } from "./dates";
import { CEFR, LEVELS, NOTES, ROW_LABELS, SUMMARY_HEADINGS } from "./data/misc";
import type { History } from "./history";
import { buildIndex, firstOf, search, searchMany, type Hit, type Index } from "./rank";
import { fold, splitEntry } from "./text";
import type { Suggestion } from "./types";

/* What each box of the editor suggests. The box calls one of these with the
   text typed so far and gets lines back. Nothing here touches the network:
   the lists ship with the editor and the person's own words never leave it. */

export interface SuggestContext {
  locale: Locale;
  history: History;
  /** The job title the person gave, which decides the skills and bullets. */
  role: string;
}

/** A person's own earlier words lead the built in list by this much. */
const LEAD = 12;

const REMOTE: Record<Locale, string> = { en: "Remote", es: "Remoto", de: "Remote" };
const NEAR: Record<Locale, string> = { en: "Your time zone", es: "Tu zona horaria", de: "Deine Zeitzone" };

const line = (hit: Hit): Suggestion => ({ value: hit.text, ranges: hit.ranges, strong: hit.strong });

/* "sr" and "jr" stand for the level words people abbreviate. */
const levelWords = (query: string) =>
  query.replace(/\bsr\.?(?=\s|$)/gi, "senior").replace(/\bjr\.?(?=\s|$)/gi, "junior");

/** Where the browser says the person is, as a city from the list. Only a
    city whose name matches the time zone's exactly is offered. */
function guessCity(locale: Locale): string | null {
  let zone = "";
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {
    return null;
  }
  const name = zone.split("/").pop()?.replace(/_/g, " ");
  if (!name) return null;
  const [hit] = search(catalogOf(locale).cities, name, { limit: 1 });
  return hit && hit.match >= 92 ? hit.text : null;
}

/* ------------------------------------------------------------- levels */

const LEVEL_PERCENT = new Map<string, number>();
for (const list of [...Object.values(LEVELS), CEFR]) {
  for (const level of list) {
    for (const name of [level.name, ...level.aliases]) LEVEL_PERCENT.set(fold(name), level.percent);
  }
}

/** How full the language bar is for a level the person wrote, or null when the
    level is not one the editor knows. "C1 (Advanced)" counts as "C1". */
export function levelPercent(text: string): number | null {
  const key = fold(text).replace(/\(.*\)/, "").trim();
  if (!key) return null;
  const direct = LEVEL_PERCENT.get(key);
  if (direct !== undefined) return direct;
  const scale = key.match(/^([abc][12])\b/);
  return scale ? (LEVEL_PERCENT.get(scale[1]) ?? null) : null;
}

/* -------------------------------------------------------------- bullets */

const bulletIndexes = new Map<string, Index>();

function bulletIndex(title: string, locale: Locale): Index {
  const family = familyOf(title);
  const key = `${family?.id ?? "generic"}:${locale}`;
  let index = bulletIndexes.get(key);
  if (!index) {
    index = buildIndex(bulletsFor(family, locale), { pop: false });
    bulletIndexes.set(key, index);
  }
  return index;
}

/* ------------------------------------------------------------ the sources */

export interface Suggesters {
  /** The CV's language. */
  locale: Locale;
  title(query: string): Suggestion[];
  company(query: string): Suggestion[];
  school(query: string): Suggestion[];
  degree(query: string): Suggestion[];
  city(query: string): Suggestion[];
  email(query: string): Suggestion[];
  link(query: string): Suggestion[];
  dates(query: string): Suggestion[];
  level(query: string): Suggestion[];
  summaryHeading(query: string): Suggestion[];
  sectionHeading(query: string): Suggestion[];
  rowLabel(query: string, preset: PresetId | undefined): Suggestion[];
  note(query: string, study: boolean): Suggestion[];
  skill(query: string, have: string[]): Suggestion[];
  language(query: string, have: string[]): Suggestion[];
  hobby(query: string, have: string[]): Suggestion[];
  /** Bullets for a job, as complete lines. Only when the line still starts
      the way a suggestion does. */
  bullet(query: string, used: string[], title: string): Suggestion[];
  /** The skills people in this job list, for one click, minus those added. */
  suggestedSkills(have: string[], limit?: number): string[];
  /** The skills the editor offers before anything is typed. */
  skillsFor(have: string[], limit?: number): Suggestion[];
  /** The job family's name, for the heading over its suggestions. */
  family: string | null;
}

export function makeSuggesters({ locale, history, role }: SuggestContext): Suggesters {
  /* Built the first time a box asks, so opening the editor does not wait for it. */
  const catalog = () => catalogOf(locale);
  const family = familyOf(role);
  const familySkills = skillsFor(family, locale).map(entry => splitEntry(entry)[0]);
  const boosts = new Map(familySkills.map((name, at) => [fold(name), Math.max(2, 14 - at * 0.7)]));

  const both = (mine: Index, builtIn: Index, query: string, options = {}) =>
    searchMany([{ index: mine, lead: LEAD }, { index: builtIn }], query, options).map(line);

  const folded = (list: string[]) => new Set(list.map(fold));
  const skillOptions = (have: string[], limit: number): Suggestion[] => {
    const skip = folded(have);
    return familySkills
      .filter(name => !skip.has(fold(name)))
      .slice(0, limit)
      .map(value => ({ value }));
  };
  const fromList = (list: string[], query: string): Suggestion[] => {
    const index = buildIndex(list, { pop: true });
    return query.trim() ? search(index, query, { limit: 8 }).map(line) : firstOf(index, 8).map(hit => ({ value: hit.text }));
  };

  return {
    locale,
    family: family?.id ?? null,

    title: query => both(history.titles, catalog().titles, levelWords(query)),
    company: query => both(history.companies, catalog().companies, query),
    school: query => both(history.schools, catalog().schools, query),
    degree: query => both(history.degrees, catalog().degrees, query),

    city: query => {
      if (!query.trim()) {
        const guess = guessCity(locale);
        return [...(guess ? [{ value: guess, hint: NEAR[locale] }] : []), { value: REMOTE[locale] }];
      }
      const found = both(history.cities, catalog().cities, query);
      const remote = fold(REMOTE[locale]).startsWith(fold(query.trim())) ? [{ value: REMOTE[locale], strong: false }] : [];
      return [...found, ...remote].slice(0, 8);
    },

    email: query => emailSuggestions(query, locale),
    link: query => linkSuggestions(query),

    dates: query =>
      dateSuggestions(query, locale).map((value, at) => ({ value, strong: at === 0 })),

    level: query => {
      const index = catalog().levels;
      if (!query.trim()) return firstOf(index, LEVELS[locale].length).map(hit => ({ value: hit.text }));
      return search(index, query, { limit: 6 }).map(line);
    },

    summaryHeading: query => fromList(SUMMARY_HEADINGS[locale], query),
    sectionHeading: query => {
      const index = catalog().sections;
      return query.trim() ? search(index, query, { limit: 6 }).map(line) : firstOf(index, 6).map(hit => ({ value: hit.text }));
    },
    rowLabel: (query, preset) => fromList(ROW_LABELS[locale][preset === "awards" ? "awards" : "keySkills"], query),
    note: (query, study) => {
      const words = NOTES[locale];
      const year = new Date().getFullYear();
      return fromList(study ? [...words.study, words.expected(year), words.expected(year + 1)] : words.job, query);
    },

    skill: (query, have) => {
      if (!query.trim()) return skillOptions(have, 8);
      const skip = folded(have);
      return searchMany(
        [{ index: history.skills, lead: LEAD }, { index: catalog().skills }],
        query,
        { skip: text => skip.has(fold(text)), bonus: text => boosts.get(fold(text)) ?? 0 },
      ).map(line);
    },

    language: (query, have) => {
      const skip = folded(have);
      if (!query.trim()) return firstOf(catalog().languages, 8, text => skip.has(fold(text))).map(hit => ({ value: hit.text }));
      return searchMany([{ index: history.languages, lead: LEAD }, { index: catalog().languages }], query, {
        skip: text => skip.has(fold(text)),
      }).map(line);
    },

    hobby: (query, have) => {
      const skip = folded(have);
      if (!query.trim()) return firstOf(catalog().hobbies, 8, text => skip.has(fold(text))).map(hit => ({ value: hit.text }));
      return searchMany([{ index: history.hobbies, lead: LEAD }, { index: catalog().hobbies }], query, {
        skip: text => skip.has(fold(text)),
      }).map(line);
    },

    bullet: (query, used, title) => {
      const index = bulletIndex(title, locale);
      const skip = folded(used);
      const skipText = (text: string) => skip.has(fold(text));
      if (!query.trim()) return firstOf(index, 6, skipText).map(hit => ({ value: hit.text }));
      // Only a line that still begins the way the person began it is taken by Enter.
      return search(index, query, { limit: 6, skip: skipText }).map(hit => ({ ...line(hit), strong: hit.match >= 92 }));
    },

    suggestedSkills: (have, limit = 10) => {
      const skip = folded(have);
      return familySkills.filter(name => !skip.has(fold(name))).slice(0, limit);
    },

    skillsFor: (have, limit = 8) => skillOptions(have, limit),
  };
}
