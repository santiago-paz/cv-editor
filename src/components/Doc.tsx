import Link from "next/link";
import { LANGS, LANG_TAGS, type Lang } from "@/lib/i18n";
import { LEGAL, LEGAL_UPDATED } from "@/lib/i18n/legal";
import { DocTitle } from "./DocTitle";
import { Mark } from "./icons";
import LanguageMenu from "./LanguageMenu";

/* The frame of the privacy and terms pages: the brand, a way back to the
   editor, the title with the marker under it, and when the page last changed.
   The pages keep the editor's type and colors, so they read as part of it.

   The page holds all four languages, and the style sheet shows the one that
   <html lang> names (see .doc-lang in globals.css). The head script sets that
   before the first paint, so there is no flash of the wrong language, and the
   page needs no script of its own to be right. */

const date = (lang: Lang) =>
  new Intl.DateTimeFormat(LANG_TAGS[lang], { dateStyle: "long", timeZone: "UTC" }).format(new Date(LEGAL_UPDATED));

/** One entry for each language, taken from a field of its text. */
const eachLang = (pick: (lang: Lang) => string) =>
  Object.fromEntries(LANGS.map(lang => [lang, pick(lang)])) as Record<Lang, string>;

export function Doc({ page }: { page: "privacy" | "terms" }) {
  return (
    <main className="doc">
      <div className="doc-inner">
        <header className="doc-top">
          <Link href="/" className="doc-brand">
            <Mark />
            <span translate="no">
              <span className="brand-cv">CV</span> Editor
            </span>
          </Link>
          <div className="doc-top-end">
            <Link href="/" className="doc-back">
              {LANGS.map(lang => (
                <span key={lang} lang={lang} className="doc-lang">
                  {LEGAL[lang].back}
                </span>
              ))}
            </Link>
            <LanguageMenu label={eachLang(lang => LEGAL[lang].language)} />
          </div>
        </header>
        {LANGS.map(lang => (
          <div key={lang} lang={lang} className="doc-lang">
            <h1>
              <span className="doc-mark">{LEGAL[lang][page].title}</span>
            </h1>
            <p className="doc-updated">{LEGAL[lang].updated(date(lang))}</p>
            {LEGAL[lang][page].body}
          </div>
        ))}
        <DocTitle titles={eachLang(lang => LEGAL[lang][page].title)} />
      </div>
    </main>
  );
}
