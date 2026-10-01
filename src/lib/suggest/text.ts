/* Text helpers for matching what a person types against the suggestion lists.

   Matching ignores case and accents, so "munchen" finds "München" and
   "ingenieria" finds "Ingeniería". The folded text keeps the length of the
   original, one character for one character, so a match can be drawn back
   onto the original. */

const SPECIAL: Record<string, string> = { ß: "s", æ: "a", œ: "o", ø: "o", đ: "d", ł: "l", ð: "d", þ: "t", ı: "i" };

/** One UTF-16 unit, lowercased with its accent taken off. "" for a bare
    combining mark, which has nothing to match. */
function foldUnit(unit: string): string {
  const lower = unit.toLowerCase();
  const special = SPECIAL[lower[0] ?? ""];
  if (special) return special;
  const base = lower.normalize("NFD")[0] ?? "";
  return /[̀-ͯ]/.test(base) ? "" : base;
}

export function fold(text: string): string {
  let out = "";
  for (let at = 0; at < text.length; at++) out += foldUnit(text[at]);
  return out;
}

/** A word of a phrase, folded, with where each of its letters sat in the
    original text. */
export interface Tok {
  n: string;
  at: number[];
}

const SEPARATOR = /[\s/\-(),:;_|·•]/;
/** Dots and apostrophes join a word rather than split it: "B.Sc." is "bsc",
    "Node.js" is "nodejs", "Bachelor's" is "bachelors". */
const JOINER = /[.'’`]/;

export function tokens(text: string): Tok[] {
  const out: Tok[] = [];
  let current: Tok | null = null;
  for (let at = 0; at < text.length; at++) {
    const unit = foldUnit(text[at]);
    if (unit === "") continue;
    if (SEPARATOR.test(unit)) {
      current = null;
      continue;
    }
    if (JOINER.test(unit)) continue;
    if (!current) {
      current = { n: "", at: [] };
      out.push(current);
    }
    current.n += unit;
    current.at.push(at);
  }
  return out;
}

/** The first letter of each word: "Senior Frontend Engineer" -> "sfe". */
export const initials = (toks: Tok[]) => toks.map(tok => tok.n[0]).join("");

/** Splits "Display|alias|alias" on the bars that are not inside [brackets].
    A bar in brackets belongs to a gender mark such as "Enfermer[o|a]". */
export function splitEntry(entry: string): string[] {
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
  return out.filter(Boolean);
}

/** "Enfermer[o|a] Jef[e|a]" -> ["Enfermero Jefe", "Enfermera Jefa"]. Text
    without a mark comes back as it is. */
export function expandGender(text: string): string[] {
  if (!text.includes("[")) return [text];
  const mark = /\[([^\]|]*)\|([^\]|]*)\]/g;
  const masculine = text.replace(mark, "$1");
  const feminine = text.replace(mark, "$2");
  return masculine === feminine ? [masculine] : [masculine, feminine];
}

/** A phrase with a capital at the start of every word, for the month names and
    the like. Leaves the rest of each word as it is. */
export const capital = (word: string) => (word ? word[0].toUpperCase() + word.slice(1) : word);
