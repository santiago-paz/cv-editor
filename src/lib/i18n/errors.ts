import { LIMITS } from "../ai";
import { BackupError, PdfError } from "../errors";
import type { Dict } from "./en";

/* From a refusal to the words for it. A code with no words in the language
   falls back to the English the server sent. */

/** Why the PDF failed. */
export function pdfMessage(t: Dict["errors"]["pdf"], error: unknown): string {
  if (!(error instanceof PdfError)) return t.generic;
  if (error.code === "status") return t.status(error.status);
  const text: unknown = (t as Record<string, unknown>)[error.code];
  return typeof text === "string" ? text : error.message;
}

/** Why the rewrite failed: `code` is what the route sent, `fallback` its English. */
export function aiMessage(t: Dict["errors"]["ai"], code: unknown, fallback: string): string {
  if (code === "limitDay") return t.limitDay(LIMITS.day);
  if (code === "limitMonth") return t.limitMonth(LIMITS.month);
  const text: unknown = typeof code === "string" ? (t as Record<string, unknown>)[code] : undefined;
  return typeof text === "string" ? text : fallback;
}

/** Why a file did not restore. */
export function backupMessage(t: Dict["errors"]["backup"], error: unknown): string {
  return error instanceof BackupError ? t[error.code] : t.fallback;
}
