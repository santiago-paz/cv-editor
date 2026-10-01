"use client";

import dynamic from "next/dynamic";
import { Mark } from "./icons";

/* The editor reads localStorage as it starts, which the server has none of,
   so it renders in the browser only. Until it arrives, the bar and a blank
   sheet hold its place, so the page does not jump when it lands. */
const Editor = dynamic(() => import("./Editor"), {
  ssr: false,
  loading: () => (
    <div className="app" aria-busy="true">
      <header className="topbar">
        <p className="brand">
          <Mark />
          <span className="brand-name">
            <span className="brand-cv">CV</span> Editor
          </span>
        </p>
      </header>
      <section className="write" aria-label="Loading" />
      <div className="stage-wrap">
        <main className="stage">
          <div className="stage-inner">
            <div className="loading-sheet" />
          </div>
        </main>
      </div>
    </div>
  ),
});

export default function EditorLoader() {
  return <Editor />;
}
