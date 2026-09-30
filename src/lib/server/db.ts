import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";

/* The Neon database, reached through its pooler (DATABASE_URL). It holds
   accounts and a count of AI rewrites. CVs stay in the browser.

   The pool connects on first use, so importing this costs nothing. On Vercel,
   attachDatabasePool closes idle connections before a function sleeps. */
export const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
attachDatabasePool(pool);
