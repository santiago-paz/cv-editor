import { createAuthClient } from "better-auth/react";

/* The browser's side of sign-in. It talks to /api/auth on the same site. */
export const authClient = createAuthClient();
