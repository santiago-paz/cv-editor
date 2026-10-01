"use client";

import { useEffect, useSyncExternalStore } from "react";
import { DEFAULT_LANG, type Lang } from "@/lib/i18n";
import { currentLang, subscribeLang } from "@/lib/i18n/store";

/* The server can only say the page's name in one language, so the tab's title
   follows the language on screen once the page is in the browser. */
export function DocTitle({ titles }: { titles: Record<Lang, string> }) {
  const lang = useSyncExternalStore(subscribeLang, currentLang, () => DEFAULT_LANG);
  useEffect(() => {
    document.title = `${titles[lang]} · CV Editor`;
  }, [lang, titles]);
  return null;
}
