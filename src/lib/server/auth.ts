import { betterAuth } from "better-auth";
import { pool } from "./db";

/* Accounts exist for the AI button, and sign-in is Google only. The server
   keeps the name and email Google sends, the sessions, and a count of AI
   rewrites. Deleting the account deletes all of it.

   BETTER_AUTH_URL is the site's own address. Google only sends people back
   to addresses listed in its client, so sign-in works on the live site and
   on localhost, not on preview deployments. */
export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      prompt: "select_account",
    },
  },
  user: { deleteUser: { enabled: true } },
});
