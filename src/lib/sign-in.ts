/* The browser's side of signing in, which both the AI button and Settings use.

   The auth client is loaded when it is first needed, so the editor does not
   carry it for people who never sign in. */

const FLAG = "cv-editor.v1.signin";

/** Sends the person to Google, and back to the page they are on. */
export async function startSignIn(): Promise<void> {
  try {
    sessionStorage.setItem(FLAG, "1");
  } catch {
    // Without it the page simply does not greet the person on the way back.
  }
  try {
    const { authClient } = await import("./auth-client");
    /* On success the browser leaves for Google and this never returns. The
       client hands back an error instead of throwing one, so it is thrown here. */
    const result = await authClient.signIn.social({ provider: "google", callbackURL: window.location.href });
    if (result.error) throw new Error(result.error.message || "Sign-in failed");
  } catch (error) {
    try {
      sessionStorage.removeItem(FLAG);
    } catch {
      // Nothing to undo.
    }
    throw error;
  }
}

/** True once, on the page Google sends the person back to. */
export function returnedFromSignIn(): boolean {
  try {
    const came = sessionStorage.getItem(FLAG) === "1";
    if (came) sessionStorage.removeItem(FLAG);
    return came;
  } catch {
    return false;
  }
}

/** Who is signed in, or null. `failed` is true when the server could not say. */
export async function whoIsSignedIn(): Promise<{ user: { name: string; email: string } | null; failed: boolean }> {
  const { authClient } = await import("./auth-client");
  const result = await authClient.getSession();
  if (result.error && result.error.status !== 401) return { user: null, failed: true };
  return { user: result.data?.user ?? null, failed: false };
}
