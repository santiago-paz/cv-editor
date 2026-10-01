/* The languages the editor itself speaks. A CV has a language of its own
   (`Locale` in cv/types.ts), and that one is what the CV prints. This one is
   only what the buttons, menus and messages say. */

export const LANGS = ["es", "en", "de", "pt"] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "en";

/** Each language in its own words, so a person can find theirs on a page they
    cannot read. */
export const LANG_NAMES: Record<Lang, string> = { es: "Español", en: "English", de: "Deutsch", pt: "Português" };

/** The tag Intl takes for dates. The Portuguese is the Brazilian one. */
export const LANG_TAGS: Record<Lang, string> = { es: "es", en: "en-GB", de: "de", pt: "pt-BR" };

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

/** The first of the browser's languages that the editor speaks: "es-AR" is
    Spanish, "pt-PT" is Portuguese. */
export function fromBrowser(preferred: readonly string[] | undefined): Lang | null {
  for (const tag of preferred ?? []) {
    const code = String(tag).split("-")[0].toLowerCase();
    if (isLang(code)) return code;
  }
  return null;
}

/** What to show: the language the person chose, else the browser's, else English. */
export function resolveLang(chosen: unknown, preferred?: readonly string[]): Lang {
  return isLang(chosen) ? chosen : (fromBrowser(preferred) ?? DEFAULT_LANG);
}
