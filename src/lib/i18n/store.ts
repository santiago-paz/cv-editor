import { loadUi, saveUi } from "../ui-prefs";
import { DEFAULT_LANG, isLang, resolveLang, type Lang } from "./index";

/* The language in use is the one <html lang> names. The head script sets it
   before the first paint (see boot.ts), so the page is right from the start,
   and a choice made here sets it again and saves it with the other view
   settings. The editor, the language button and the privacy page all read it
   from there, so they cannot disagree. */

const listeners = new Set<() => void>();

export function currentLang(): Lang {
  const value = typeof document === "undefined" ? "" : document.documentElement.lang;
  return isLang(value) ? value : DEFAULT_LANG;
}

/** The language to open the editor in, with the page set to match. The head
    script has already done both; this is for the day it could not run. */
export function startLang(): Lang {
  const browser = navigator.languages?.length ? navigator.languages : [navigator.language];
  const lang = resolveLang(loadUi().lang, browser);
  document.documentElement.lang = lang;
  return lang;
}

/** Switches the page to a language and remembers the choice. Choosing the
    language already on screen only remembers it. */
export function chooseLang(lang: Lang): void {
  const changed = lang !== currentLang();
  document.documentElement.lang = lang;
  saveUi({ lang });
  if (changed) listeners.forEach(listener => listener());
}

export function subscribeLang(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
