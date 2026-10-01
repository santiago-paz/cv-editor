import { readCv, readPhoto } from "./cv/schema";
import type { Cv, Photo } from "./cv/types";
import { BackupError } from "./errors";
import { KEYS, read, store, write, type Area, type WriteResult } from "./kv";

/* Everything is kept in this browser's localStorage: the CVs, the photo and a
   few view settings (ui-prefs.ts). Nothing is sent anywhere until a PDF is asked
   for.

   A tab can keep its CVs and photo in sessionStorage instead, which the
   browser empties when the tab closes. That is for a shared computer. The flag
   that says so lives in sessionStorage too, so it goes when the tab goes. The
   view settings stay in localStorage either way: they hold no CV.

   Both stores can be missing (some private windows), full, or cleared by the
   browser, so every call is guarded and says what happened (kv.ts). The backup
   file is the way to keep a copy that outlives the browser's storage. */

export type { WriteResult } from "./kv";
export { loadUi, saveUi, type Ui } from "./ui-prefs";

/** True when this tab keeps its CVs to itself and forgets them when it closes. */
export function isTabOnly(): boolean {
  return read(KEYS.tabOnly, "session") === true;
}

/** Where the CVs and the photo live for this tab. */
function data(): Area {
  return isTabOnly() ? "session" : "local";
}

export function storageAvailable(): boolean {
  try {
    const probe = "cv-editor.probe";
    const area = store(data());
    area.setItem(probe, "1");
    area.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/** Anything that no longer reads as a CV is left out rather than breaking
    the list. */
function cvsIn(value: unknown): Cv[] | null {
  const record = value as { cvs?: unknown } | null;
  if (!record || !Array.isArray(record.cvs)) return null;
  return record.cvs.map(readCv).filter((cv): cv is Cv => cv !== null);
}

/** The CVs on file, or null on a first visit. */
export function loadCvs(): Cv[] | null {
  return cvsIn(read(KEYS.cvs, data()));
}

export function saveCvs(cvs: Cv[]): WriteResult {
  return write(KEYS.cvs, { version: 1, cvs }, data());
}

export function loadPhoto(): Photo | null {
  return readPhoto(read(KEYS.photo, data()));
}

/** Saves the photo. When the original does not fit as well, the printed
    square is kept on its own, and a later adjustment starts from it. */
export function savePhoto(photo: Photo | null): WriteResult & { dropped?: boolean } {
  return putPhoto(photo, data());
}

function putPhoto(photo: Photo | null, area: Area): WriteResult & { dropped?: boolean } {
  const result = write(KEYS.photo, photo, area);
  if (result.ok || !photo?.source || result.reason !== "full") return result;
  const lean = write(KEYS.photo, { src: photo.src }, area);
  return lean.ok ? { ok: true, dropped: true } : lean;
}

/** Tells `onChange` when another tab of the editor writes the CVs or photo.
    A tab that keeps its CVs to itself ignores the others. */
export function watch(onChange: (what: "cvs" | "photo") => void): () => void {
  const listener = (event: StorageEvent) => {
    if (isTabOnly()) return;
    if (event.key === KEYS.cvs) onChange("cvs");
    if (event.key === KEYS.photo) onChange("photo");
  };
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}

/* ------------------------------------------------- forget on tab close */

const TAB_KEYS = [KEYS.cvs, KEYS.photo, KEYS.tabOnly];

/** Moves the CVs and the photo into this tab and out of localStorage, so
    closing the tab forgets them. Nothing moves unless all of it fits. */
export function moveToTab(cvs: Cv[], photo: Photo | null): WriteResult {
  const saved = write(KEYS.cvs, { version: 1, cvs }, "session");
  const pictured = saved.ok ? putPhoto(photo, "session") : saved;
  const flagged = pictured.ok ? write(KEYS.tabOnly, true, "session") : pictured;
  if (!flagged.ok) {
    for (const key of TAB_KEYS) write(key, null, "session");
    return flagged;
  }
  write(KEYS.cvs, null);
  write(KEYS.photo, null);
  return { ok: true };
}

/** Moves this tab's CVs and photo back to localStorage, where they last. A CV
    another tab saved there meanwhile stays, and where both hold the same CV
    the newer copy wins. Returns the list as it now stands. */
export function moveToBrowser(cvs: Cv[], photo: Photo | null): { result: WriteResult; cvs: Cv[] } {
  const before = read(KEYS.cvs);
  const merged = newest([...cvs, ...(cvsIn(before) ?? [])]);
  const saved = write(KEYS.cvs, { version: 1, cvs: merged });
  const pictured = saved.ok && photo ? putPhoto(photo, "local") : saved;
  if (!pictured.ok) {
    if (saved.ok) write(KEYS.cvs, before);
    return { result: pictured, cvs };
  }
  for (const key of TAB_KEYS) write(key, null, "session");
  return { result: { ok: true }, cvs: merged };
}

/** One copy of each CV: the one changed last. */
function newest(cvs: Cv[]): Cv[] {
  const kept = new Map<string, Cv>();
  for (const cv of cvs) {
    const other = kept.get(cv.id);
    if (!other || cv.updatedAt > other.updatedAt) kept.set(cv.id, cv);
  }
  return [...kept.values()];
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

/** Reads a backup file. Throws a BackupError, with a message fit to show, when
    it is not one. */
export function readBackup(text: string): Restored {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new BackupError("notJson", "That file is not a backup from this editor. Backups are .json files.");
  }
  const record = value as { app?: unknown; cvs?: unknown; photo?: unknown } | null;
  /* A single CV exported by hand is fine too. */
  const list = Array.isArray(record?.cvs) ? record.cvs : record && "sections" in record ? [record] : null;
  if (!list) throw new BackupError("noCvs", "That file holds no CVs. Pick a backup this editor saved.");
  const cvs = list.map(readCv).filter((cv): cv is Cv => cv !== null);
  if (!cvs.length) throw new BackupError("unreadable", "The editor could not read any CV in that file.");
  return { cvs, photo: readPhoto(record?.photo) };
}
