"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Lang } from "@/lib/i18n";
import type { Dict } from "@/lib/i18n/en";
import { loadDict } from "@/lib/i18n/load";
import { chooseLang, currentLang, subscribeLang } from "@/lib/i18n/store";

/* The editor's words, for every component under it. The language itself lives
   in <html lang> (see lib/i18n/store.ts). This keeps the words of that language
   at hand, and swaps them when the language changes: the new file is fetched
   first, so the screen goes from one language to the other in one step. */

interface Loaded {
  lang: Lang;
  dict: Dict;
}

const Context = createContext<Loaded | null>(null);

export function I18nProvider({ initial, children }: { initial: Loaded; children: ReactNode }) {
  const [loaded, setLoaded] = useState(initial);
  const shown = useRef(initial.lang);
  const wanted = useRef(initial.lang);

  useEffect(
    () =>
      subscribeLang(() => {
        const lang = currentLang();
        wanted.current = lang;
        loadDict(lang).then(
          dict => {
            if (wanted.current !== lang) return;
            shown.current = lang;
            setLoaded({ lang, dict });
          },
          () => {
            // The file did not come: stay in the language that is on screen.
            if (wanted.current === lang) chooseLang(shown.current);
          },
        );
      }),
    [],
  );

  return <Context value={loaded}>{children}</Context>;
}

function useLoaded(): Loaded {
  const value = useContext(Context);
  if (!value) throw new Error("The editor's words are missing: wrap it in I18nProvider.");
  return value;
}

/** The editor's words in the language on screen. */
export const useT = (): Dict => useLoaded().dict;

/** The language of those words. */
export const useLang = (): Lang => useLoaded().lang;
