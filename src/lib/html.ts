/* Escaping for the string templates. Plain-text fields go through esc();
   rich-text fields are already sanitized and go in as they are. */

const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function esc(text: string | null | undefined): string {
  return String(text ?? "").replace(/[&<>"']/g, ch => ENTITIES[ch]);
}

/** The schemes a CV link may use. Anything else prints as plain text. */
export function safeUrl(url: string | null | undefined): string {
  const value = String(url ?? "").trim();
  return /^(https?:\/\/|mailto:|tel:)/i.test(value) ? value : "";
}

/** A typed address without a scheme gets https, so "example.com" still links. */
export function webUrl(url: string | null | undefined): string {
  const value = String(url ?? "").trim();
  if (!value) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return safeUrl(value);
  return /^[^\s/]+\.[^\s/]+/.test(value) ? `https://${value}` : "";
}

/** "https://www.example.com/me/" -> "example.com/me", for a link with no label. */
export function bareUrl(url: string): string {
  return url
    .trim()
    .replace(/^[a-z][a-z0-9+.-]*:(\/\/)?/i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}

export function telUrl(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits.length >= 5 ? `tel:${digits}` : "";
}

export function mailUrl(email: string): string {
  const value = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? `mailto:${value}` : "";
}

/** `<a href>` around escaped text, or the escaped text alone without a URL. */
export function anchor(text: string, url: string, extra = ""): string {
  return anchorHtml(esc(text), url, extra);
}

/** `<a href>` around markup that is already safe. */
export function anchorHtml(html: string, url: string, extra = ""): string {
  const href = safeUrl(url);
  return href ? `<a href="${esc(href)}"${extra}>${html}</a>` : html;
}

/** Escaped text that may wrap after a slash, dot or @, so an address in a
    narrow column breaks between its parts rather than in the middle of one. */
export function breakable(text: string): string {
  return esc(text).replace(/([/.@])(?=[^\s/.@])/g, "$1<wbr>");
}

/** Rich text reduced to its words, for titles, metadata and labels. */
export function textOf(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
