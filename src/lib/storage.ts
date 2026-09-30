import { readCv, readPhoto } from "./cv/schema";
import type { Cv, Photo } from "./cv/types";

/* Everything is kept in this browser's localStorage: the CVs, the photo and a
   few view settings. Nothing is sent anywhere until a PDF is asked for.

   localStorage can be missing (some private windows), full, or cleared by the
   browser, so every call is guarded and says what happened. The backup file
   is the way to keep a copy that outlives the browser's storage. */

const KEYS = {
  cvs: "cv-editor.v1.cvs",
  photo: "cv-editor.v1.photo",
  ui: "cv-editor.v1.ui",
} as const;

export type WriteResult = { ok: true } | { ok: false; reason: "full" | "unavailable" };

export interface Ui {
  openId?: string;
  theme?: "light" | "dark";
  zoom?: "fit" | "actual";
}

function read(key: string): unknown {
  try {
    const text = window.localStorage.getItem(key);
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): WriteResult {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (error) {
    const name = error instanceof DOMException ? error.name : "";
    const full = name === "QuotaExceededError" || name === "NS_ERROR_DOM_QUOTA_REACHED";
    return { ok: false, reason: full ? "full" : "unavailable" };
  }
}

export function storageAvailable(): boolean {
  try {
    const probe = "cv-editor.probe";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/** The CVs on file, newest first. Anything that no longer reads as a CV is
    left out rather than breaking the list. */
export function loadCvs(): Cv[] | null {
  const value = read(KEYS.cvs) as { cvs?: unknown } | null;
  if (!value || !Array.isArray(value.cvs)) return null;
  return value.cvs.map(readCv).filter((cv): cv is Cv => cv !== null);
}

export function saveCvs(cvs: Cv[]): WriteResult {
  return write(KEYS.cvs, { version: 1, cvs });
}

export function loadPhoto(): Photo | null {
  return readPhoto(read(KEYS.photo));
}

/** Saves the photo. When the original does not fit as well, the printed
    square is kept on its own, and a later adjustment starts from it. */
export function savePhoto(photo: Photo | null): WriteResult & { dropped?: boolean } {
  const result = write(KEYS.photo, photo);
  if (result.ok || !photo?.source || result.reason !== "full") return result;
  const lean = write(KEYS.photo, { src: photo.src });
  return lean.ok ? { ok: true, dropped: true } : lean;
}

export function loadUi(): Ui {
  const value = read(KEYS.ui);
  return value && typeof value === "object" ? (value as Ui) : {};
}

/** Merges a change into the saved view settings. */
export function saveUi(change: Partial<Ui>): void {
  const next = { ...loadUi(), ...change };
  for (const key of Object.keys(next) as (keyof Ui)[]) {
    if (next[key] === undefined) delete next[key];
  }
  write(KEYS.ui, next);
}

/** Tells `onChange` when another tab of the editor writes the CVs or photo. */
export function watch(onChange: (what: "cvs" | "photo") => void): () => void {
  const listener = (event: StorageEvent) => {
    if (event.key === KEYS.cvs) onChange("cvs");
    if (event.key === KEYS.photo) onChange("photo");
  };
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}

/* ------------------------------------------------------------ backups */

const APP = "cv-editor";

export function backup(cvs: Cv[], photo: Photo | null): string {
  return JSON.stringify(
    { app: APP, version: 1, exportedAt: new Date().toISOString(), cvs, photo },
    null,
    2,
  );
}

export interface Restored {
  cvs: Cv[];
  photo: Photo | null;
}

/** Reads a backup file. Throws with a message fit to show when it is not one. */
export function readBackup(text: string): Restored {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("That file is not a backup from this editor. Backups are .json files.");
  }
  const record = value as { app?: unknown; cvs?: unknown; photo?: unknown } | null;
  /* A single CV exported by hand is fine too. */
  const list = Array.isArray(record?.cvs) ? record.cvs : record && "sections" in record ? [record] : null;
  if (!list) throw new Error("That file holds no CVs. Pick a backup this editor saved.");
  const cvs = list.map(readCv).filter((cv): cv is Cv => cv !== null);
  if (!cvs.length) throw new Error("The editor could not read any CV in that file.");
  return { cvs, photo: readPhoto(record?.photo) };
}
