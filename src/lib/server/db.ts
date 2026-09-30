import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";

/* The Neon database, reached through its pooler (DATABASE_URL). It holds
   accounts and a count of AI rewrites. CVs stay in the browser.

   Neon's address asks for sslmode=require. pg already treats that as
   verify-full, but warns on every cold start that the meaning will change in
   its next major version. Naming verify-full keeps the same certificate check
   and ends the warning.

   The pool connects on first use, so importing this costs nothing. On Vercel,
   attachDatabasePool closes idle connections before a function sleeps. */
const url = process.env.DATABASE_URL?.replace(/([?&]sslmode=)require(?=&|$)/, "$1verify-full");

export const pool = new Pool({ connectionString: url, max: 5 });
attachDatabasePool(pool);
