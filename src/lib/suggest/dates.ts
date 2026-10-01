import type { Locale } from "@/lib/cv/types";
import { fold } from "./text";

/* Turns quick typing into the dates a CV prints.

     mar22 -        ->  Mar 2022 - Present
     3/22 - 5/23    ->  Mar 2022 - May 2023
     2019 2022      ->  2019 - 2022
     ene 2020 - hoy ->  Jan 2020 - Present   (on an English CV)

   Month words and "present" words are read in English, Spanish and German
   whichever language the CV uses, then written in the CV's own language. What
   cannot be read as a date gives no suggestion, so free text such as "Summer
   2019" is left alone. */

export const MONTHS: Record<Locale, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  es: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
  de: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
};

export const PRESENT: Record<Locale, string> = { en: "Present", es: "Actualidad", de: "Heute" };

/** Every month name the editor reads, folded, in the order of the year. */
const MONTH_NAMES: string[][] = [
  ["january", "enero", "januar"],
  ["february", "febrero", "februar"],
  ["march", "marzo", "marz"],
  ["april", "abril"],
  ["may", "mayo", "mai"],
  ["june", "junio", "juni"],
  ["july", "julio", "juli"],
  ["august", "agosto"],
  ["september", "septiembre", "setiembre"],
  ["october", "octubre", "oktober"],
  ["november", "noviembre"],
  ["december", "diciembre", "dezember"],
];

const PRESENT_WORDS = [
  "present",
  "presente",
  "now",
  "current",
  "currently",
  "ongoing",
  "actual",
  "actualidad",
  "actualmente",
  "hoy",
  "heute",
  "aktuell",
  "jetzt",
  "laufend",
  "gegenwart",
];

/** The month a word names, from its first three letters on. */
function monthOf(word: string): number | null {
  if (!/^[a-z]{3,}$/.test(word)) return null;
  for (let at = 0; at < MONTH_NAMES.length; at++) {
    if (MONTH_NAMES[at].some(name => name.startsWith(word))) return at + 1;
  }
  return null;
}

function isPresent(word: string): boolean {
  return word.length >= 2 && /^[a-z]+$/.test(word) && PRESENT_WORDS.some(name => name.startsWith(word));
}

interface Point {
  month?: number;
  year: number;
}

/** A year from 4 digits, or from 2 digits when the caller allows it. */
function yearOf(digits: string, now: Date, allowShort: boolean): number | null {
  let year: number;
  if (digits.length === 4) year = Number(digits);
  else if (digits.length === 2 && allowShort) {
    const short = Number(digits);
    year = short <= (now.getFullYear() % 100) + 10 ? 2000 + short : 1900 + short;
  } else return null;
  return year >= 1950 && year <= now.getFullYear() + 10 ? year : null;
}

/** One end of a range: "mar 2022", "mar22", "3/22", "2022", "2022 mar". */
function point(text: string, now: Date, inRange: boolean): Point | null {
  const value = text.trim();
  if (!value) return null;

  let match = value.match(/^(\d{4}|\d{2})$/);
  if (match) {
    const year = yearOf(match[1], now, inRange);
    return year ? { year } : null;
  }

  match = value.match(/^([a-z]{3,})\.?[\s./]*(\d{4}|\d{2})$/);
  if (match) {
    const month = monthOf(match[1]);
    const year = yearOf(match[2], now, true);
    return month && year ? { month, year } : null;
  }

  match = value.match(/^(\d{1,2})[\s./](\d{4}|\d{2})$/);
  if (match) {
    const month = Number(match[1]);
    const year = yearOf(match[2], now, true);
    return month >= 1 && month <= 12 && year ? { month, year } : null;
  }

  match = value.match(/^(\d{4})[\s./]+([a-z]{3,})$/);
  if (match) {
    const month = monthOf(match[2]);
    const year = yearOf(match[1], now, false);
    return month && year ? { month, year } : null;
  }
  return null;
}

type End = Point | "present" | "open";

interface Parsed {
  start: Point;
  /** "open" is a dash with nothing after it yet, which means "to today". */
  end: End | null;
}

const SEPARATOR = /\s*(?:-|\bto\b|\buntil\b|\btill\b|\bthrough\b|\bhasta\b|\bal\b|\ba\b|\bbis\b)\s*/;

function parse(input: string, now: Date): Parsed | null {
  const text = fold(input.replace(/[‒-―−]/g, "-"))
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;

  const split = text.match(SEPARATOR);
  if (split && split.index !== undefined) {
    const left = text.slice(0, split.index);
    const right = text.slice(split.index + split[0].length);
    if (SEPARATOR.test(right)) return null;
    const start = point(left, now, true);
    if (!start) return null;
    if (!right) return { start, end: "open" };
    if (isPresent(right)) return { start, end: "present" };
    const end = point(right, now, true);
    return end ? { start, end } : null;
  }

  // No dash: one date, or two years or two month-years typed one after the other.
  const single = point(text, now, false);
  if (single) return { start: single, end: null };

  const words = text.split(" ");
  if (words.length === 2) {
    const start = point(words[0], now, false);
    const end = point(words[1], now, false);
    if (start && end) return { start, end };
  }
  if (words.length === 4) {
    const start = point(`${words[0]} ${words[1]}`, now, false);
    const end = point(`${words[2]} ${words[3]}`, now, false);
    if (start && end) return { start, end };
  }
  return null;
}

function write(at: Point, locale: Locale): string {
  return at.month ? `${MONTHS[locale][at.month - 1]} ${at.year}` : String(at.year);
}

/** The dates a few typed letters could mean, the likeliest first. Empty when
    the text is not a date. */
export function dateSuggestions(input: string, locale: Locale, now = new Date()): string[] {
  const parsed = parse(input, now);
  if (!parsed) return [];
  const start = write(parsed.start, locale);
  const present = `${start} - ${PRESENT[locale]}`;
  const { end } = parsed;
  if (end === null) return [start, present];
  if (end === "open" || end === "present") return [present];
  return [`${start} - ${write(end, locale)}`];
}
