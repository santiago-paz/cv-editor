import { fold, initials, splitEntry, tokens, type Tok } from "./text";

/* Finds entries in a list from the few letters a person has typed, and puts
   the likeliest first. The aim is "type a little, press Enter": "sen fr" finds
   "Senior Frontend Engineer", so does "sfe", and "ts" finds "TypeScript".

   Each entry may have aliases, which match but are never written. A match is
   scored by how tightly it fits, from the whole text down to letters found in
   the middle of a word. Entries earlier in their list, and ones the person
   used before, win ties. */

export interface Item {
  /** What gets written when the entry is picked. */
  text: string;
  /** Every spelling that can match: the text first, then its aliases. */
  keys: Tok[][];
  /** A small lead for entries near the top of their list, 0 to 5. */
  pop: number;
}

export interface Index {
  items: Item[];
}

export interface Hit {
  text: string;
  /** The ranking score: how tight the match is, plus small leads. */
  score: number;
  /** How tight the match is, on its own: 100 exact, 92 a start, 84 and under
      words found further in, 48 letters inside a word. */
  match: number;
  /** Where the typed letters fall in `text`, for drawing them in bold. */
  ranges: [number, number][];
  /** True when the match is tight enough that Enter should take it. */
  strong: boolean;
}

export interface SearchOptions {
  limit?: number;
  /** Entries to leave out, such as a skill already added. */
  skip?: (text: string) => boolean;
  /** Extra points for an entry, such as a skill common in the person's job. */
  bonus?: (text: string) => number;
}

/** Scores from this up are tight enough to be taken by Enter. */
export const STRONG = 64;

/** Builds an index from "Display|alias|alias" entries. */
export function buildIndex(entries: string[], options: { pop?: boolean } = {}): Index {
  const count = Math.max(entries.length, 1);
  const items: Item[] = [];
  entries.forEach((entry, position) => {
    const [text, ...aliases] = splitEntry(entry);
    if (!text) return;
    items.push({
      text,
      keys: [text, ...aliases].map(tokens).filter(key => key.length),
      pop: options.pop === false ? 0 : 5 * (1 - position / count),
    });
  });
  return { items };
}

/** An index whose entries are already split into text and aliases, for lists
    built in code (degrees, cities). */
export function buildIndexFrom(entries: { text: string; aliases?: string[]; pop?: number }[]): Index {
  const count = Math.max(entries.length, 1);
  return {
    items: entries.map((entry, position) => ({
      text: entry.text,
      keys: [entry.text, ...(entry.aliases ?? [])].map(tokens).filter(key => key.length),
      pop: entry.pop ?? 5 * (1 - position / count),
    })),
  };
}

interface Scored {
  score: number;
  ranges: [number, number][];
}

/** Each query word must start a word of the key, in order. Returns the key
    word each one landed on, and how many key words were skipped on the way. */
function matchOrdered(query: Tok[], key: Tok[]): { used: number[]; gaps: number } | null {
  const used: number[] = [];
  let from = 0;
  for (const word of query) {
    let found = -1;
    for (let at = from; at < key.length; at++) {
      if (key[at].n.startsWith(word.n)) {
        found = at;
        break;
      }
    }
    if (found < 0) return null;
    used.push(found);
    from = found + 1;
  }
  return { used, gaps: used[used.length - 1] + 1 - query.length };
}

/** Each query word must start a different word of the key, in any order. */
function matchAnyOrder(query: Tok[], key: Tok[]): number[] | null {
  const taken = new Set<number>();
  const used: number[] = [];
  for (const word of query) {
    let found = -1;
    for (let at = 0; at < key.length; at++) {
      if (!taken.has(at) && key[at].n.startsWith(word.n)) {
        found = at;
        break;
      }
    }
    if (found < 0) return null;
    taken.add(found);
    used.push(found);
  }
  return used;
}

function merge(ranges: [number, number][]): [number, number][] {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const out: [number, number][] = [];
  for (const range of sorted) {
    const last = out[out.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else out.push([range[0], range[1]]);
  }
  return out;
}

function rangesOf(query: Tok[], key: Tok[], used: number[]): [number, number][] {
  return merge(
    used.map((at, i) => {
      const word = key[at];
      const length = Math.min(query[i].n.length, word.at.length);
      return [word.at[0], word.at[length - 1] + 1] as [number, number];
    }),
  );
}

function scoreKey(query: Tok[], joined: string, key: Tok[]): Scored | null {
  const flat = key.map(word => word.n).join(" ");
  if (flat === joined) return { score: 100, ranges: rangesOf(query, key, key.map((_, at) => at)) };

  const ordered = matchOrdered(query, key);
  if (ordered) {
    const score = ordered.gaps === 0 ? 92 : Math.max(70, 84 - 3 * ordered.gaps);
    return { score, ranges: rangesOf(query, key, ordered.used) };
  }

  const loose = matchAnyOrder(query, key);
  if (loose) return { score: 68, ranges: rangesOf(query, key, loose) };

  // "sfe" for "Senior Frontend Engineer".
  if (query.length === 1 && query[0].n.length >= 2 && key.length >= 2 && initials(key).startsWith(query[0].n)) {
    const ranges = key.slice(0, query[0].n.length).map(word => [word.at[0], word.at[0] + 1] as [number, number]);
    return { score: STRONG, ranges: merge(ranges) };
  }

  // Letters found inside a word, such as "script" in "TypeScript".
  if (joined.length >= 3 && flat.includes(joined)) return { score: 48, ranges: [] };
  return null;
}

/** The entries of one index that fit the query, best first. */
export function search(index: Index, query: string, options: SearchOptions = {}): Hit[] {
  const words = tokens(query);
  if (!words.length) return [];
  const joined = words.map(word => word.n).join(" ");
  const hits: (Hit & { order: number })[] = [];

  for (let order = 0; order < index.items.length; order++) {
    const item = index.items[order];
    if (options.skip?.(item.text)) continue;
    let best: Scored | null = null;
    let onText = false;
    for (let at = 0; at < item.keys.length; at++) {
      const scored = scoreKey(words, joined, item.keys[at]);
      if (scored && (!best || scored.score > best.score)) {
        best = scored;
        onText = at === 0;
      }
    }
    if (!best) continue;
    hits.push({
      text: item.text,
      score: best.score + item.pop + (options.bonus?.(item.text) ?? 0),
      match: best.score,
      ranges: onText ? best.ranges : [],
      strong: best.score >= STRONG,
      order,
    });
  }

  hits.sort((a, b) => b.score - a.score || a.text.length - b.text.length || a.order - b.order);
  return hits
    .slice(0, options.limit ?? 8)
    .map(hit => ({ text: hit.text, score: hit.score, match: hit.match, ranges: hit.ranges, strong: hit.strong }));
}

/** Searches several indexes at once, each with a lead of its own, such as
    what the person wrote before ahead of the built in list. The same text from
    two lists is shown once. */
export function searchMany(
  sources: { index: Index; lead?: number }[],
  query: string,
  options: SearchOptions = {},
): Hit[] {
  const limit = options.limit ?? 8;
  const best = new Map<string, Hit>();
  for (const { index, lead = 0 } of sources) {
    for (const hit of search(index, query, { ...options, limit: limit * 3 })) {
      const key = fold(hit.text);
      const scored = { ...hit, score: hit.score + lead };
      const other = best.get(key);
      if (!other || scored.score > other.score) best.set(key, scored);
    }
  }
  return [...best.values()]
    .sort((a, b) => b.score - a.score || a.text.length - b.text.length)
    .slice(0, limit);
}

/** The first few entries, for a box that offers a list before anything is typed. */
export function firstOf(index: Index, count: number, skip?: (text: string) => boolean): Hit[] {
  return index.items
    .filter(item => !skip?.(item.text))
    .slice(0, count)
    .map(item => ({ text: item.text, score: 0, match: 0, ranges: [], strong: false }));
}
