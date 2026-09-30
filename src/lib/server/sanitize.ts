import sanitizeHtml from "sanitize-html";
import { tidy } from "../sanitize";

/* The server's copy of the browser's rules in lib/sanitize.ts. The PDF route
   never trusts the rich text it is sent: a request can come from anywhere,
   not only from the editor. */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["strong", "em", "a", "br"],
  allowedAttributes: { a: ["href"] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href"],
  allowProtocolRelative: false,
  transformTags: { b: "strong", i: "em" },
  // Unwrap what is not allowed and keep its text, as the browser side does.
  disallowedTagsMode: "discard",
  nonTextTags: ["script", "style", "textarea", "option", "noscript", "title"],
};

export function sanitizeServer(html: string): string {
  let clean = sanitizeHtml(html, OPTIONS);
  // A link whose address was dropped is left as <a> with no href: unwrap it.
  clean = clean.replace(/<a>([\s\S]*?)<\/a>/g, "$1");
  return tidy(clean);
}
