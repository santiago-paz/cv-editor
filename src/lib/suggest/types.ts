import type { Locale } from "@/lib/cv/types";

/* Shapes shared by the suggestion data files in ./data and the engine that
   reads them.

   Most lists are plain strings in one format: "Display|alias|alias". The first
   part is what gets written into the CV. The aliases only help matching, so
   typing "ts" finds "TypeScript|TS" and "postgres" finds "PostgreSQL|Postgres". */

export type ByLocale<T> = Record<Locale, T>;

/** A group of related jobs, with what people in it usually list. The group is
    found from the job title the person typed, and drives the suggested skills
    and the suggested bullets. */
export interface Family {
  id: string;
  /** Lowercase words and phrases that put a job title in this family. A title
      matches when it contains one of them. Write them without accents. */
  match: ByLocale<string[]>;
  /** The skills most CVs in this family list, most common first. */
  skills: ByLocale<string[]>;
  /** Complete bullet lines for one job of this family. No numbers, and no
      claim of a result: the person adds those. */
  bullets: ByLocale<string[]>;
}

/** One line in a suggestion list. */
export interface Suggestion {
  /** The text written into the box when this line is taken. */
  value: string;
  /** What the list shows, when that differs from `value`. */
  label?: string;
  /** Where the typed letters fall in `label` (or `value`), shown in bold. */
  ranges?: [number, number][];
  /** A small note at the right, such as the address a link name stands for. */
  hint?: string;
  /** True when the match is tight enough for Enter to take it at once. */
  strong?: boolean;
  /** Takes the line but stays in the box, for a start the person finishes,
      such as "github.com/" before the user name. */
  keep?: boolean;
}

export type Suggest = (query: string) => Suggestion[];

/** A city for the location field. */
export interface City {
  /** The name in English, as it is most often written on a CV. */
  name: string;
  /** ISO 3166-1 alpha-2 country code, uppercase. */
  cc: string;
  /** Only for the United States and Canada: "TX", "ON". Printed after the
      name in place of the country. */
  region?: string;
  /** The name when it differs in Spanish or German. */
  es?: string;
  de?: string;
  /** Other spellings or short forms worth matching, such as "NYC". */
  alias?: string[];
}
