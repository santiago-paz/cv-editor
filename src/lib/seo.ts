import type { Metadata } from "next";
import { LANGS } from "./i18n";
import { PITCH } from "./pitch";
import { AUTHOR } from "./site";

/* What search engines, link previews and AI tools learn about the site, from
   one place: the address every page answers to, the title and description of
   each page, and the structured data that says what CV Editor is.

   The editor is the home page and draws in the browser only, so its server HTML
   carries the title, the description, this structured data and the short text on
   its loading sheet (pitch.ts). The server cannot know a visitor's language, so
   all of it is English. tests/seo.test.ts holds the rules. */

const FALLBACK_URL = "https://trycveditor.com";

function origin(value: string | undefined): string {
  try {
    const url = new URL(value ?? "");
    return url.protocol === "https:" ? url.origin : FALLBACK_URL;
  } catch {
    return FALLBACK_URL;
  }
}

/** The one address the site answers to. Canonical links, the sitemap, the
    structured data and the shared picture all use it, so a page never counts
    twice under two hosts. A fork sets NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = origin(process.env.NEXT_PUBLIC_SITE_URL);

export const SITE_NAME = "CV Editor";

export const REPO_URL = "https://github.com/santiago-paz/cv-editor";
const REPO_OWNER_URL = "https://github.com/santiago-paz";

/** What a search result and a shared link say about the editor. */
export const HOME = {
  title: "CV Editor - free online CV maker, no account needed",
  description:
    "Free online CV editor. Type a few letters, press Enter, and each box fills in. Preview every page and save a PDF. No account. Your CV stays in your browser.",
  imageAlt: "CV Editor, a free online CV editor. A CV page with one line lit by a yellow marker.",
} as const;

const INDEXABLE: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
};

/** The picture a shared link shows comes from src/app/opengraph-image.tsx, which
    Next adds to every page, so only the words are set here. */
function card(url: string, title: string, description: string): Metadata {
  return {
    openGraph: { type: "website", url, siteName: SITE_NAME, title, description, locale: "en_GB" },
    twitter: { card: "summary_large_image", title, description },
  };
}

const BASE: Metadata = {
  applicationName: SITE_NAME,
  authors: [{ name: AUTHOR.name, ...(AUTHOR.url ? { url: AUTHOR.url } : {}) }],
  creator: AUTHOR.name,
  robots: INDEXABLE,
  formatDetection: { email: false, address: false, telephone: false },
};

/** The metadata of the editor, which is the home page. */
export const HOME_METADATA: Metadata = {
  ...BASE,
  title: { absolute: HOME.title },
  description: HOME.description,
  alternates: { canonical: SITE_URL },
  ...card(SITE_URL, HOME.title, HOME.description),
};

/** The metadata of a page that has one address for every language, such as the
    privacy page and the terms. */
export function pageMetadata(args: { path: string; title: string; description: string }): Metadata {
  const url = `${SITE_URL}${args.path}`;
  const title = `${args.title} · ${SITE_NAME}`;
  return {
    ...BASE,
    title: { absolute: title },
    description: args.description,
    alternates: { canonical: url },
    ...card(url, title, args.description),
  };
}

const id = (name: string) => `${SITE_URL}/#${name}`;

/** The structured data of the home page: the site, the web app and the person
    who makes it, which point at each other by `@id`. It claims no rating,
    review or price the product does not have. */
export function homeSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": id("website"),
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        alternateName: ["CVEditor", "trycveditor.com"],
        inLanguage: [...LANGS],
        publisher: { "@id": id("author") },
      },
      {
        "@type": "WebApplication",
        "@id": id("app"),
        name: SITE_NAME,
        url: SITE_URL,
        description: PITCH.lead,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: [...PITCH.features],
        inLanguage: [...LANGS],
        author: { "@id": id("author") },
        sameAs: [REPO_URL],
      },
      {
        "@type": "Person",
        "@id": id("author"),
        name: AUTHOR.name,
        sameAs: [AUTHOR.url, REPO_OWNER_URL].filter(Boolean),
      },
    ],
  };
}

/** What a script tag may hold: `<` is written as its escape, so no text in the
    data can close the tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
