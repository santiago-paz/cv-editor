import type { ReactNode } from "react";

export interface LegalPage {
  /** The page's name, which is also its heading. */
  title: string;
  /** What a search result says about it. */
  description: string;
  body: ReactNode;
}

/** The privacy and terms pages, and the words around them, in one language.
    Every language holds the same sections in the same order, so a person who
    switches language finds the same text, and tests/i18n.test.ts counts the
    headings, lists and links to make sure of it. */
export interface LegalText {
  back: string;
  /** The label of the language button. */
  language: string;
  updated: (date: string) => string;
  privacy: LegalPage;
  terms: LegalPage;
}
