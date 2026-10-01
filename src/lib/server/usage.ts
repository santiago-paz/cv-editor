import { pool } from "./db";
import type { Tokens } from "./rewrite";
import { purgeSoon } from "./retention";

/* One row per AI request: who asked, when, how many tokens it took, and
   whether the suggestion was used. No text is kept. The limits and the
   daily budget are counted from these rows (days in UTC). */

/** Claude Haiku 4.5's list price, in millionths of a dollar per token. */
const PRICE = { input: 1, output: 5 } as const;

/** $20 a month spread over 31 days, in millionths of a dollar. When the site
    has spent this much today, the button rests until tomorrow. */
export const DAILY_BUDGET = 645_000;

/** Rewrites this account has used today and this month. Failed ones don't count. */
export async function used(userId: string): Promise<{ day: number; month: number }> {
  const { rows } = await pool.query<{ day: string; month: string }>(
    `select count(*) filter (where created_at >= date_trunc('day', now())) as day,
            count(*) as month
       from ai_log
      where user_id = $1 and ok and created_at >= date_trunc('month', now())`,
    [userId],
  );
  return { day: Number(rows[0]?.day ?? 0), month: Number(rows[0]?.month ?? 0) };
}

/** What the whole site has spent today, in millionths of a dollar. */
export async function spentToday(): Promise<number> {
  const { rows } = await pool.query<{ spent: string }>(
    `select coalesce(sum(input_tokens * $1 + output_tokens * $2), 0) as spent
       from ai_log
      where created_at >= date_trunc('day', now())`,
    [PRICE.input, PRICE.output],
  );
  return Number(rows[0]?.spent ?? 0);
}

export async function record(userId: string, tokens: Tokens, ok: boolean): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    `insert into ai_log (user_id, ok, input_tokens, output_tokens) values ($1, $2, $3, $4) returning id`,
    [userId, ok, tokens.input, tokens.output],
  );
  /* The database is awake and a person is here, so this is a good moment to
     clear out what has expired. It runs after the reply, at most once an hour. */
  purgeSoon();
  return String(rows[0].id);
}

/** Notes that a suggestion was put into the CV. */
export async function accept(userId: string, id: string): Promise<void> {
  await pool.query(`update ai_log set accepted = true where id = $1 and user_id = $2`, [id, userId]);
}
