/* Creates the database tables: Better Auth's own (user, session, account,
   verification), then the one the AI button counts its use in. Safe to run
   again.

   It reads DATABASE_URL from the environment, or from .env.local, which
   `vercel env pull .env.local` writes. */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import pg from "pg";

if (!process.env.DATABASE_URL && existsSync(".env.local")) process.loadEnvFile(".env.local");
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Run `vercel env pull .env.local` first.");
  process.exit(1);
}

execFileSync("npx", ["--yes", "auth@1.7.6", "migrate", "--config", "src/lib/server/auth.ts", "--yes"], {
  stdio: "inherit",
});

/* One row per AI request: who, when, how many tokens, and whether the
   suggestion was used. Never the text. Deleting a user deletes their rows. */
/* verify-full is what pg already does for Neon's sslmode=require; naming it
   stops pg's warning. src/lib/server/db.ts does the same. */
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL.replace(/([?&]sslmode=)require(?=&|$)/, "$1verify-full"),
});
await pool.query(`
  create table if not exists ai_log (
    id bigserial primary key,
    user_id text not null references "user"(id) on delete cascade,
    created_at timestamptz not null default now(),
    ok boolean not null,
    input_tokens integer not null,
    output_tokens integer not null,
    accepted boolean not null default false
  );
  create index if not exists ai_log_user_time on ai_log (user_id, created_at);
  create index if not exists ai_log_time on ai_log (created_at);
`);
await pool.end();
console.log("ai_log is ready.");
