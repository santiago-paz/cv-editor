/* The guarded reads and writes of the browser's storage, which the CVs, the
   photo and the view settings are all kept through. Both stores can be missing
   (some private windows), full, or cleared by the browser, so every call is
   guarded and says what happened. */

export const KEYS = {
  cvs: "cv-editor.v1.cvs",
  photo: "cv-editor.v1.photo",
  ui: "cv-editor.v1.ui",
  tabOnly: "cv-editor.v1.tab-only",
} as const;

export type WriteResult = { ok: true } | { ok: false; reason: "full" | "unavailable" };

export type Area = "local" | "session";

export function store(area: Area): Storage {
  return area === "local" ? window.localStorage : window.sessionStorage;
}

export function read(key: string, area: Area = "local"): unknown {
  try {
    const text = store(area).getItem(key);
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export function write(key: string, value: unknown, area: Area = "local"): WriteResult {
  try {
    if (value === null) store(area).removeItem(key);
    else store(area).setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (error) {
    const name = error instanceof DOMException ? error.name : "";
    const full = name === "QuotaExceededError" || name === "NS_ERROR_DOM_QUOTA_REACHED";
    return { ok: false, reason: full ? "full" : "unavailable" };
  }
}
