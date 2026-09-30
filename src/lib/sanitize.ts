/* Rich text, cut down to what a CV prints: bold, italics, links and line
   breaks. Anything else is unwrapped to its text rather than dropped, so no
   words are lost when something is pasted in.

   This one runs in the browser, on the browser's own parser. The PDF route
   runs server/sanitize.ts over the same rules before it prints anything. */

const ALLOWED: Record<string, string[]> = { STRONG: [], EM: [], BR: [], A: ["href"] };
const RENAME: Record<string, string> = { B: "STRONG", I: "EM" };

export function safeHref(href: string | null): boolean {
  return !!href && /^(https?:|mailto:|tel:)/i.test(href.trim());
}

export function sanitize(html: string): string {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  clean(doc.body, doc);
  return tidy(doc.body.innerHTML);
}

/** What the browser's editing leaves behind: non-breaking spaces where plain
    ones were typed, and a trailing <br> in a field that was emptied. */
export function tidy(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "<br>")
    .replace(/&nbsp;| /g, " ")
    // Bold or italics around nothing but spaces, from a selection that
    // caught only the gap between two words.
    .replace(/<(strong|em)>(\s*)<\/\1>/g, "$2")
    .replace(/(<br>\s*)+$/, "")
    .replace(/^\s+|\s+$/g, "");
}

function clean(parent: Element, doc: Document): void {
  for (const node of Array.from(parent.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) continue;
    if (node.nodeType !== Node.ELEMENT_NODE) {
      node.remove();
      continue;
    }
    const element = node as Element;
    if (element.tagName === "SCRIPT" || element.tagName === "STYLE") {
      element.remove();
      continue;
    }

    clean(element, doc);

    const tag = RENAME[element.tagName] || element.tagName;
    const allowed = ALLOWED[tag];
    if (!allowed || (tag === "A" && !safeHref(element.getAttribute("href")))) {
      unwrap(element);
      continue;
    }

    const kept = tag === element.tagName ? element : rename(element, tag, doc);
    for (const attr of Array.from(kept.attributes)) {
      if (!allowed.includes(attr.name)) kept.removeAttribute(attr.name);
    }
  }
}

function rename(node: Element, tag: string, doc: Document): Element {
  const replacement = doc.createElement(tag);
  for (const attr of Array.from(node.attributes)) replacement.setAttribute(attr.name, attr.value);
  while (node.firstChild) replacement.appendChild(node.firstChild);
  node.replaceWith(replacement);
  return replacement;
}

function unwrap(node: Element): void {
  const parent = node.parentNode;
  if (!parent) return;
  while (node.firstChild) parent.insertBefore(node.firstChild, node);
  node.remove();
}
