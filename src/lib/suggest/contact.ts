import type { Locale } from "@/lib/cv/types";
import { EMAIL_DOMAINS, SITES, type Site } from "./data/misc";
import { buildIndexFrom, search } from "./rank";
import { fold } from "./text";
import type { Suggestion } from "./types";

/* Suggestions for the contact details: the end of an email address, and the
   start of a link to a profile. */

/** "santiago" offers "santiago@gmail.com" and the others; "santiago@ou" offers
    "santiago@outlook.com". Only the part after the @ is ever guessed. */
export function emailSuggestions(query: string, locale: Locale): Suggestion[] {
  const text = query.trim();
  if (text.length < 2 || /\s/.test(text)) return [];
  const at = text.indexOf("@");
  if (at === 0 || text.indexOf("@", at + 1) !== -1) return [];

  const local = at === -1 ? text : text.slice(0, at);
  const typed = at === -1 ? "" : fold(text.slice(at + 1));
  const domains = EMAIL_DOMAINS[locale].filter(domain => domain.startsWith(typed));
  return domains.slice(0, 5).map((domain, position) => {
    const value = `${local}@${domain}`;
    // Draw the typed part of the domain in bold.
    const from = local.length + 1;
    return {
      value,
      strong: position === 0,
      ranges: typed ? ([[from, from + typed.length]] as [number, number][]) : undefined,
    };
  });
}

const SITE_INDEX = buildIndexFrom(
  SITES.map((site, position) => ({ text: site.name, aliases: site.aliases, pop: 5 * (1 - position / SITES.length) })),
);

/** "link" offers "linkedin.com/in/" for the person to finish. Once the text
    looks like an address, nothing is offered. */
export function linkSuggestions(query: string): Suggestion[] {
  const text = query.trim();
  if (!text) return SITES.slice(0, 6).map(asLine);
  if (/[/.:@]/.test(text)) return [];
  return search(SITE_INDEX, text, { limit: 5 }).map(hit => {
    const site = SITES.find(item => item.name === hit.text)!;
    return { ...asLine(site), ranges: hit.ranges, strong: hit.strong };
  });
}

/** A site as a line of the list. The person finishes the address, so the box
    keeps focus when one is taken. */
function asLine(site: Site): Suggestion {
  return {
    value: site.prefix,
    label: site.name,
    hint: site.prefix === "https://" ? undefined : site.prefix,
    keep: true,
  };
}

/** What a link prints, as the editor's renderer will print it: the address
    without its scheme and "www.". Shown as the placeholder of "printed as". */
export function printedLink(url: string): string {
  return url
    .trim()
    .replace(/^[a-z]+:\/\/(www\.)?/i, "")
    .replace(/\/+$/, "");
}
