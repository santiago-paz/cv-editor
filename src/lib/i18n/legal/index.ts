import type { Lang } from "../index";
import de from "./de";
import en from "./en";
import es from "./es";
import pt from "./pt";
import type { LegalText } from "./types";

export type { LegalPage, LegalText } from "./types";

/** The pages in every language. Only the privacy and terms pages import this,
    on the server: the editor never carries it. */
export const LEGAL: Record<Lang, LegalText> = { es, en, de, pt };

/** When the privacy and terms pages last changed, whichever the language. */
export const LEGAL_UPDATED = "2026-10-01";
