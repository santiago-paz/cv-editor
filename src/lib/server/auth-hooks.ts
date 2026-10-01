import type { BetterAuthOptions } from "better-auth";

/* What sign-in refuses to keep. Better Auth saves three things the editor never
   uses: the visitor's IP address and browser string on each session, the
   tokens Google issues on each account, and the link to the Google profile
   photo. These hooks blank them before the row is written, and the privacy
   page says the server doesn't keep them.

   Better Auth merges a hook's answer over the row, so each one names only what
   changes. `onSignIn` runs once a session exists, which is a good time to
   purge old data. */

const NO_TOKENS = {
  accessToken: null,
  refreshToken: null,
  idToken: null,
  accessTokenExpiresAt: null,
  refreshTokenExpiresAt: null,
};

export function makeHooks(onSignIn: () => void): NonNullable<BetterAuthOptions["databaseHooks"]> {
  return {
    user: {
      create: { before: async () => ({ data: { image: null } }) },
      update: { before: async () => ({ data: { image: null } }) },
    },
    session: {
      create: {
        before: async () => ({ data: { ipAddress: "", userAgent: "" } }),
        after: async () => onSignIn(),
      },
    },
    account: {
      create: { before: async () => ({ data: NO_TOKENS }) },
      update: { before: async () => ({ data: NO_TOKENS }) },
    },
  };
}
