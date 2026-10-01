import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GET as llms } from "@/app/llms.txt/route";
import manifest from "@/app/manifest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { LEGAL_UPDATED } from "@/lib/i18n/legal";
import { PITCH } from "@/lib/pitch";
import { HOME, HOME_METADATA, homeSchema, jsonLd, pageMetadata, REPO_URL, SITE_NAME, SITE_URL } from "@/lib/seo";

/* What a search engine, a link preview and an AI tool read from the site. The
   editor is the home page and draws in the browser only, so its server HTML
   carries the title, the description, the structured data and the short text on
   its loading sheet. These tests hold the lengths a search result keeps, that
   the sitemap and robots.txt say the right things, that the structured data
   claims nothing the product lacks, and that the files a crawler asks for are
   there. */

const root = join(__dirname, "..");
const source = (path: string) => readFileSync(join(root, path), "utf8");
const DASHES = /[\u2010-\u2015\u2212]/;

/** Every string in a value. */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("the words", () => {
  it("fit a search result", () => {
    expect(HOME.title.length).toBeGreaterThanOrEqual(30);
    expect(HOME.title.length).toBeLessThanOrEqual(62);
    expect(HOME.title).toContain(SITE_NAME);
    expect(HOME.description.length).toBeGreaterThanOrEqual(110);
    expect(HOME.description.length).toBeLessThanOrEqual(165);
  });

  it("hold no typographic dash and no stray space", () => {
    for (const text of strings([HOME, PITCH])) {
      expect(text).not.toMatch(DASHES);
      expect(text).not.toMatch(/ {2}|\n/);
    }
  });

  it("make a tagline that reads as one sentence around the marked key", () => {
    const { before, mark, after } = PITCH.tagline;
    expect(mark).toBe("Enter");
    expect(`${before}${mark}${after}`).toMatch(/^[A-Z][^.]*\.$/);
  });

  it("say the timing the README measures", () => {
    // The README wraps its lines, so its words are read with single spaces.
    const readme = source("README.md").replace(/\s+/g, " ");
    expect(readme).toContain("needs 42 seconds when they take the suggested bullets, and 58 when they type every bullet");
  });
});

describe("the address", () => {
  it("is one https origin with no path", () => {
    expect(SITE_URL).toMatch(/^https:\/\/[^/]+$/);
  });
});

describe("the metadata", () => {
  it("of the home page is its own canonical, indexable, with cards that say the same", () => {
    expect(HOME_METADATA.alternates?.canonical).toBe(SITE_URL);
    expect(HOME_METADATA.robots).toMatchObject({ index: true, follow: true });
    expect(HOME_METADATA.title).toEqual({ absolute: HOME.title });
    expect(HOME_METADATA.description).toBe(HOME.description);
    expect(HOME_METADATA.openGraph).toMatchObject({ url: SITE_URL, siteName: SITE_NAME, title: HOME.title });
    expect(HOME_METADATA.twitter).toMatchObject({ card: "summary_large_image", title: HOME.title });
  });

  it("of the privacy page and the terms is indexed, under its own address", () => {
    const meta = pageMetadata({ path: "/privacy", title: "Privacy", description: "What the editor keeps." });
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/privacy`);
    expect(meta.robots).toMatchObject({ index: true });
    expect(meta.title).toEqual({ absolute: "Privacy · CV Editor" });
  });

  /* The pages hold these as source, because they import the editor, which only
     draws in a browser. A page that dropped its export would fall back to the
     layout's words and still pass every other test. */
  it("is set by each page and by the layout", () => {
    expect(source("src/app/page.tsx")).toContain("HOME_METADATA");
    expect(source("src/app/page.tsx")).toContain("homeSchema");
    expect(source("src/app/privacy/page.tsx")).toContain('path: "/privacy"');
    expect(source("src/app/terms/page.tsx")).toContain('path: "/terms"');
    expect(source("src/app/layout.tsx")).toContain("metadataBase");
  });

  it("has a picture for a shared link, drawn from the site's own type", () => {
    expect(existsSync(join(root, "src/app/opengraph-image.tsx"))).toBe(true);
    expect(existsSync(join(root, "src/app/twitter-image.tsx"))).toBe(true);
    for (const file of ["bricolage-grotesque-latin-700-normal.woff", "figtree-latin-600-normal.woff"]) {
      expect(existsSync(join(root, "src/app/_og", file)), file).toBe(true);
    }
    expect(HOME_METADATA.openGraph).not.toHaveProperty("images");
  });
});

describe("the loading sheet", () => {
  it("says what the editor is, so a crawler that runs no script reads it", () => {
    const loader = source("src/components/EditorLoader.tsx");
    expect(loader).toContain("PITCH.heading");
    expect(loader).toContain("PITCH.lead");
  });
});

describe("the structured data", () => {
  type Node = Record<string, unknown> & { "@type": string; "@id": string };
  const nodes = homeSchema()["@graph"] as Node[];
  const find = (type: string) => nodes.find(node => node["@type"] === type) as Node;

  it("says what the product is, once", () => {
    expect(nodes.map(node => node["@type"]).sort()).toEqual(["Person", "WebApplication", "WebSite"]);
    expect(new Set(nodes.map(node => node["@id"])).size).toBe(nodes.length);
    const app = find("WebApplication") as Node & { offers: { price: string }; featureList: string[] };
    expect(app.name).toBe(SITE_NAME);
    expect(app.url).toBe(SITE_URL);
    expect(app.description).toBe(PITCH.lead);
    expect(app.isAccessibleForFree).toBe(true);
    expect(app.offers.price).toBe("0");
    expect(app.featureList).toEqual([...PITCH.features]);
    expect(find("WebSite").name).toBe(SITE_NAME);
  });

  it("points only at nodes that exist", () => {
    const ids = new Set(nodes.map(node => node["@id"]));
    const refs = [...JSON.stringify(nodes).matchAll(/\{"@id":"([^"]+)"\}/g)].map(match => match[1]);
    expect(refs.length).toBeGreaterThan(1);
    for (const ref of refs) expect(ids.has(ref), ref).toBe(true);
  });

  it("claims no rating, review or question it does not print", () => {
    expect(JSON.stringify(homeSchema())).not.toMatch(/aggregateRating|"review"|ratingValue|reviewCount|FAQPage/);
  });

  it("cannot close its own script tag", () => {
    expect(jsonLd({ text: "</script><script>alert(1)</script>" })).not.toContain("<");
    expect(JSON.parse(jsonLd({ text: "a < b" }))).toEqual({ text: "a < b" });
  });
});

describe("the sitemap", () => {
  const entries = sitemap();

  it("lists the editor, the privacy page and the terms, and nothing else", () => {
    expect(entries.map(entry => entry.url)).toEqual([SITE_URL, `${SITE_URL}/privacy`, `${SITE_URL}/terms`]);
  });

  it("dates the legal pages by the day their text changed", () => {
    expect(entries[0].lastModified).toBeUndefined();
    expect(entries[1].lastModified).toBe(LEGAL_UPDATED);
    expect(entries[2].lastModified).toBe(LEGAL_UPDATED);
    expect(LEGAL_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("robots.txt", () => {
  it("opens the site to every crawler, shuts the API, and names the sitemap", () => {
    const { rules, sitemap: map } = robots();
    expect(rules).toEqual({ userAgent: "*", allow: "/", disallow: "/api/" });
    expect(map).toBe(`${SITE_URL}/sitemap.xml`);
  });
});

describe("the web app manifest and the icons", () => {
  it("opens the editor, and its icons are files", () => {
    const m = manifest();
    expect(m.start_url).toBe("/");
    expect(m.name).toBe(SITE_NAME);
    expect(strings(m).some(text => DASHES.test(text))).toBe(false);
    for (const icon of m.icons ?? []) expect(existsSync(join(root, "public", icon.src)), icon.src).toBe(true);
    for (const file of ["src/app/favicon.ico", "src/app/apple-icon.png", "src/app/icon.svg"]) {
      expect(existsSync(join(root, file)), file).toBe(true);
    }
  });
});

describe("llms.txt", () => {
  it("is plain text, names the pages and the source, and holds no typographic dash", async () => {
    const response = llms();
    expect(response.headers.get("content-type")).toContain("text/plain");
    const text = await response.text();
    expect(text.startsWith(`# ${SITE_NAME}`)).toBe(true);
    for (const path of ["", "/privacy", "/terms"]) expect(text).toContain(`${SITE_URL}${path}`);
    expect(text).toContain(REPO_URL);
    expect(text).toContain("42 to 58 seconds");
    expect(text).not.toMatch(DASHES);
  });
});

describe("the IndexNow key", () => {
  it("is one text file whose name is its text", () => {
    const files = readdirSync(join(root, "public")).filter(name => name.endsWith(".txt"));
    expect(files).toHaveLength(1);
    const key = files[0].replace(/\.txt$/, "");
    expect(key).toMatch(/^[a-f0-9]{32}$/);
    expect(readFileSync(join(root, "public", files[0]), "utf8")).toBe(key);
  });
});
