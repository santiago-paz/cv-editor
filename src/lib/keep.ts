/* How long the server keeps what it holds. The privacy page prints these
   numbers and retention.ts enforces them, so the promise and the code cannot
   drift apart.

   No CV is ever in the database, so none of this touches one. */

export const KEEP = {
  /** A session is good for this long after its last use. */
  sessionDays: 7,
  /** A row in ai_log: when, how many tokens, and whether the rewrite was used. */
  rewriteMonths: 12,
  /** An account with no rewrite in this long goes. The check reads ai_log, so
      this cannot be longer than rewriteMonths. */
  idleAccountMonths: 12,
} as const;
