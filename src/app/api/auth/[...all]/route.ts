import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/server/auth";

/* Sign-in, sign-out, the session and account deletion, all handled by
   Better Auth. */

export const runtime = "nodejs";

export const { GET, POST } = toNextJsHandler(auth);
