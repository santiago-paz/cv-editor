import { waitUntil } from "@vercel/functions";
import { KEEP } from "../keep";
import { pool } from "./db";

/* Deletes what has outlived the windows in keep.ts, which the privacy page
   also prints. No CV is ever in the database, so nothing here touches one. */

/** The one part of the pool this file uses, so a test can stand in for it. */
export interface Db {
  query(sql: string, params?: unknown[]): Promise<unknown>;
}

/** Deletes what has outlived its use. It is safe to run at any time, and again. */
export async function purge(db: Db = pool): Promise<void> {
  await db.query(`delete from session where "expiresAt" < now()`);
  await db.query(`delete from verification where "expiresAt" < now()`);
  await db.query(`delete from ai_log where created_at < now() - make_interval(months => $1)`, [KEEP.rewriteMonths]);
  /* The account's sessions, sign-in record and rewrite rows go with it. */
  await db.query(
    `delete from "user" u
      where u."createdAt" < now() - make_interval(months => $1)
        and not exists (
          select 1 from ai_log l where l.user_id = u.id and l.created_at >= now() - make_interval(months => $1)
        )
        and not exists (select 1 from session s where s."userId" = u.id)`,
    [KEEP.idleAccountMonths],
  );
}

const HOUR = 60 * 60 * 1000;

/** Wraps `run` so it starts at most once in `every` milliseconds. It runs past
    the reply, in the background, and a failure is logged and nothing more. */
export function throttled(run: () => Promise<void>, every = HOUR, now: () => number = Date.now): () => void {
  let last = -Infinity;
  return () => {
    const time = now();
    if (time - last < every) return;
    last = time;
    waitUntil(run().catch(error => console.error("Purge failed:", error instanceof Error ? error.message : error)));
  };
}

/** Called after a sign-in and after an AI rewrite, the two times the site
    touches the database anyway. */
export const purgeSoon = throttled(() => purge());
