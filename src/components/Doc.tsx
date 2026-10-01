import Link from "next/link";
import type { ReactNode } from "react";
import { Mark } from "./icons";

/* The frame of the privacy and terms pages: the brand, a way back to the
   editor, the title with the marker under it, and when the page last changed.
   The pages keep the editor's type and colors, so they read as part of it. */

export function Doc({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <main className="doc">
      <div className="doc-inner">
        <header className="doc-top">
          <Link href="/" className="doc-brand">
            <Mark />
            <span>
              <span className="brand-cv">CV</span> Editor
            </span>
          </Link>
          <Link href="/" className="doc-back">
            Back to the editor
          </Link>
        </header>
        <h1>
          <span className="doc-mark">{title}</span>
        </h1>
        <p className="doc-updated">Last updated {updated}</p>
        {children}
      </div>
    </main>
  );
}
