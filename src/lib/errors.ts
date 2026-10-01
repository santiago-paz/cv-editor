/* What the server and the backup reader say when they say no. Each carries a
   code beside its English text, so the browser can put it in the editor's
   language (src/lib/i18n/errors.ts). The English stays as the fallback, for a
   code a newer server sends that this page has no words for yet. */

/** Sent in the "code" field of the PDF route's answer. */
export const PDF_CODES = ["foreign", "tooLarge", "badJson", "noCv", "badPhoto", "noChrome", "failed"] as const;
export type PdfCode = (typeof PDF_CODES)[number];

/** Sent in the "code" field of the rewrite route's answer. */
export const AI_CODES = [
  "foreign",
  "paused",
  "signIn",
  "tooLong",
  "badJson",
  "empty",
  "limitDay",
  "limitMonth",
  "budget",
  "failed",
  "busy",
  "unavailable",
  "refused",
  "cutOff",
] as const;
export type AiCode = (typeof AI_CODES)[number];

/** The JSON body of a refusal. */
export function refusal(code: PdfCode | AiCode, error: string) {
  return { error, code };
}

/** Why a PDF could not be had. `code` is a PdfCode, or one of the browser's own:
    "unreachable", "rateLimit" and "status". */
export class PdfError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 0,
  ) {
    super(message);
    this.name = "PdfError";
  }
}

/** Why a file is not a backup. */
export class BackupError extends Error {
  constructor(
    readonly code: "notJson" | "noCvs" | "unreadable",
    message: string,
  ) {
    super(message);
    this.name = "BackupError";
  }
}
