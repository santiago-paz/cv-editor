import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { describe, expect, it, vi } from "vitest";
import { makeHooks } from "@/lib/server/auth-hooks";

/* The real Better Auth, on an in-memory database, so each hook is checked where
   it runs: on the rows the library writes. The first case in each group has no
   hooks, and shows the library does keep what the hooks blank. Without it a
   test of the hooks could pass for the wrong reason. */

type Hooks = ReturnType<typeof makeHooks>;
type Row = Record<string, unknown>;

function setup(hooks?: Hooks) {
  const db: Record<string, Row[]> = { user: [], session: [], account: [], verification: [] };
  const auth = betterAuth({
    database: memoryAdapter(db),
    secret: "a-test-secret-that-is-long-enough-for-better-auth",
    baseURL: "http://localhost:3000",
    emailAndPassword: { enabled: true },
    databaseHooks: hooks,
  });
  return { auth, db };
}

type Auth = ReturnType<typeof setup>["auth"];

const visit = new Headers({ "user-agent": "Mozilla/5.0 (Test Browser)", "x-forwarded-for": "203.0.113.9" });

async function signUp(auth: Auth) {
  await auth.api.signUpEmail({
    body: { name: "Alex", email: "alex@example.com", password: "a long test password" },
    headers: visit,
  });
}

const PHOTO = "https://lh3.googleusercontent.com/a/example-photo";

/* A first sign-in with Google creates the user and the account together. */
async function signInWithGoogle(auth: Auth) {
  const context = await auth.$context;
  await context.internalAdapter.createOAuthUser(
    { name: "Alex", email: "alex@example.com", emailVerified: true, image: PHOTO },
    {
      providerId: "google",
      accountId: "google-1",
      accessToken: "ya29.access",
      refreshToken: "1//refresh",
      idToken: "eyJ.id.token",
      accessTokenExpiresAt: new Date("2030-01-01"),
      refreshTokenExpiresAt: new Date("2030-01-01"),
      scope: "openid email profile",
    },
  );
  return context;
}

describe("a session", () => {
  it("is stored with the visitor's IP address and browser when nothing stops it", async () => {
    const { auth, db } = setup();
    await signUp(auth);
    expect(db.session).toHaveLength(1);
    expect(db.session[0]).toMatchObject({ ipAddress: "203.0.113.9", userAgent: "Mozilla/5.0 (Test Browser)" });
  });

  it("is stored without either, and still works as a session", async () => {
    const { auth, db } = setup(makeHooks(() => undefined));
    await signUp(auth);
    expect(db.session).toHaveLength(1);
    expect(db.session[0]).toMatchObject({ ipAddress: "", userAgent: "" });
    expect(db.session[0].token).toBeTruthy();
    expect(db.session[0].expiresAt).toBeInstanceOf(Date);
  });

  it("tells the purge once, after the session exists", async () => {
    const onSignIn = vi.fn();
    const { auth, db } = setup(makeHooks(onSignIn));
    await signUp(auth);
    expect(db.session).toHaveLength(1);
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });
});

describe("a Google sign-in", () => {
  it("is stored with the photo link and Google's tokens when nothing stops it", async () => {
    const { auth, db } = setup();
    await signInWithGoogle(auth);
    expect(db.user[0]).toMatchObject({ image: PHOTO });
    expect(db.account[0]).toMatchObject({ accessToken: "ya29.access", refreshToken: "1//refresh", idToken: "eyJ.id.token" });
  });

  it("keeps the name and email the account needs, and nothing else from Google's profile", async () => {
    const { auth, db } = setup(makeHooks(() => undefined));
    await signInWithGoogle(auth);
    expect(db.user).toHaveLength(1);
    expect(db.user[0]).toMatchObject({ name: "Alex", email: "alex@example.com", emailVerified: true, image: null });
  });

  it("keeps what links the account to the person, and none of the tokens", async () => {
    const { auth, db } = setup(makeHooks(() => undefined));
    await signInWithGoogle(auth);
    expect(db.account).toHaveLength(1);
    expect(db.account[0]).toMatchObject({
      providerId: "google",
      accountId: "google-1",
      scope: "openid email profile",
      accessToken: null,
      refreshToken: null,
      idToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
    });
  });

  it("stays clean when the next sign-in brings new tokens and a new photo", async () => {
    const { auth, db } = setup(makeHooks(() => undefined));
    const context = await signInWithGoogle(auth);
    await context.internalAdapter.updateAccount(String(db.account[0].id), { accessToken: "ya29.new", idToken: "eyJ.new" });
    await context.internalAdapter.updateUser(String(db.user[0].id), { image: PHOTO, name: "Alex P" });
    expect(db.account[0]).toMatchObject({ accessToken: null, refreshToken: null, idToken: null });
    expect(db.user[0]).toMatchObject({ name: "Alex P", image: null });
  });
});
