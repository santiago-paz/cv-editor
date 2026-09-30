"use client";

import dynamic from "next/dynamic";
import { Mark } from "./icons";

/* The editor reads localStorage as it starts, which the server has none of,
   so it renders in the browser only. Until it arrives, an empty board with a
   blank sheet holds its place, with the header's mark where it will stay. */
const Editor = dynamic(() => import("./Editor"), {
  ssr: false,
  loading: () => (
    <div className="app" aria-busy="true">
      <header className="top">
        <span className="iconbtn rail-toggle" aria-hidden="true" />
        <p className="mark">
          <Mark /> CV Editor
        </p>
      </header>
      <nav className="rail-left" aria-label="Your CVs" />
      <main className="stage">
        <div className="stage-inner">
          <div className="loading-sheet" />
        </div>
      </main>
      <aside className="rail-right" />
      <footer className="foot" />
    </div>
  ),
});

export default function EditorLoader() {
  return <Editor />;
}
