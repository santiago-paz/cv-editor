"use client";

import dynamic from "next/dynamic";
import { loadDict } from "@/lib/i18n/load";
import { startLang } from "@/lib/i18n/store";
import { PITCH } from "@/lib/pitch";
import { I18nProvider } from "./i18n";
import { Mark } from "./icons";

/* The editor reads localStorage as it starts, which the server has none of,
   so it renders in the browser only. It also needs its words, in the language
   the person chose or the browser speaks, and fetches them while the editor
   itself loads, so neither waits on the other. Until both are in, the bar and a
   sheet hold their place, so the page does not jump when they land. The sheet
   says what the editor is, in English (see pitch.ts): it is the only text in the
   page's server HTML, so a crawler that runs no script, and a person whose
   script never arrives, still read it. It fades in after a beat, so a quick
   load never shows it. */
const Editor = dynamic(
  async () => {
    const lang = startLang();
    const [{ default: Editor }, dict] = await Promise.all([import("./Editor"), loadDict(lang)]);
    return function EditorInLanguage() {
      return (
        <I18nProvider initial={{ lang, dict }}>
          <Editor />
        </I18nProvider>
      );
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="app" aria-busy="true">
        <header className="topbar">
          <p className="brand">
            <Mark />
            <span className="brand-name" translate="no">
              <span className="brand-cv">CV</span> Editor
            </span>
          </p>
        </header>
        <section className="write" />
        <div className="stage-wrap">
          <main className="stage">
            <div className="stage-inner">
              <div className="loading-sheet">
                <h1>{PITCH.heading}</h1>
                <p>{PITCH.lead}</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    ),
  },
);

export default function EditorLoader() {
  return <Editor />;
}
