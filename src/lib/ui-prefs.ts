import type { Lang } from "./i18n";
import { KEYS, read, write } from "./kv";

/* The view settings: the theme, the zoom, the language and the CV that was
   open. They hold no CV, so they stay in localStorage whichever store the CVs
   use, and they live apart from storage.ts so a page that only needs them, such
   as the privacy page, does not carry the CV schema along. */

export interface Ui {
  openId?: string;
  theme?: "light" | "dark";
  zoom?: "fit" | "actual";
  /** The language the editor speaks, once the person has chosen one. */
  lang?: Lang;
  /** Set when the CV list is folded away. */
  library?: "collapsed";
  /** Set when the person has closed the note under the Next button. */
  serversNote?: "closed";
}

export function loadUi(): Ui {
  const value = read(KEYS.ui);
  return value && typeof value === "object" ? (value as Ui) : {};
}

/** Merges a change into the saved view settings. */
export function saveUi(change: Partial<Ui>): void {
  const next = { ...loadUi(), ...change };
  for (const key of Object.keys(next) as (keyof Ui)[]) {
    if (next[key] === undefined) delete next[key];
  }
  write(KEYS.ui, next);
}
