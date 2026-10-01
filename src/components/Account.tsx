"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LIMITS } from "@/lib/ai";
import { authClient } from "@/lib/auth-client";
import { startSignIn } from "@/lib/sign-in";
import { GoogleG } from "./icons";

/* The account, inside Settings. Signed out: a way in, for the AI button.
   Signed in: who, how many AI rewrites are left, and a way out.

   This file holds the auth client, so Settings loads it only when it first
   opens, and people who never sign in never download it. */

interface Left {
  day: number;
  month: number;
}

function Meter({ label, left, of }: { label: string; left: number | undefined; of: number }) {
  const tone = left === undefined ? "" : left === 0 ? "bad" : left <= 2 ? "warn" : "";
  return (
    <div className="usage-row">
      <span>{label}</span>
      <div className={"bar " + tone} aria-hidden="true">
        <i style={{ transform: `scaleX(${left === undefined ? 0 : Math.min(1, left / of)})` }} />
      </div>
      <b>{left === undefined ? "-" : `${left} left`}</b>
    </div>
  );
}

export default function Account() {
  const session = authClient.useSession();
  const user = session.data?.user;
  const [left, setLeft] = useState<Left | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [problem, setProblem] = useState("");
  const [going, setGoing] = useState(false);
  const [failed, setFailed] = useState(false);

  /* Read each time Settings opens, since the AI button uses them up. */
  useEffect(() => {
    if (!user) return;
    let current = true;
    fetch("/api/ai/usage")
      .then(response => (response.ok ? response.json() : null))
      .then((body: { left?: Left } | null) => {
        if (current && body?.left) setLeft(body.left);
      })
      .catch(() => undefined);
    return () => {
      current = false;
    };
  }, [user]);

  async function signIn() {
    setGoing(true);
    setFailed(false);
    try {
      await startSignIn();
    } catch {
      setGoing(false);
      setFailed(true);
    }
  }

  async function remove() {
    setProblem("");
    const result = await authClient.deleteUser();
    if (result.error) {
      setProblem("Deleting needs a recent sign-in. Sign out, sign in again, then delete.");
      return;
    }
    setConfirming(false);
  }

  if (session.isPending) return <p className="menu-note">Checking your account…</p>;

  if (!user) {
    return (
      <>
        <p className="menu-note">
          {session.error
            ? "Could not check your account. Try again in a minute."
            : "An account is only for AI rewrites. Your CVs stay in this browser either way."}
        </p>
        <div className="menu-buttons">
          <button type="button" className="google-button" disabled={going} onClick={() => void signIn()}>
            <GoogleG />
            {going ? "Opening Google…" : "Continue with Google"}
          </button>
        </div>
        <p className="menu-note">
          Your data is processed in the United States. By continuing you accept the{" "}
          <Link href="/terms" target="_blank" rel="noopener">
            Terms
            <span className="sr-only"> (opens in a new tab)</span>
          </Link>{" "}
          and the{" "}
          <Link href="/privacy" target="_blank" rel="noopener">
            Privacy page
            <span className="sr-only"> (opens in a new tab)</span>
          </Link>
          .
        </p>
        {failed && (
          <p className="menu-note bad" role="alert">
            Could not start the sign-in. Try again in a minute.
          </p>
        )}
      </>
    );
  }

  const initial = (user.name || user.email || "?").trim().charAt(0).toUpperCase();

  return (
    <>
      <div className="who">
        <span className="who-avatar" aria-hidden="true">
          {initial}
        </span>
        <span className="who-text" translate="no">
          <b>{user.name || user.email}</b>
          {user.name && <span>{user.email}</span>}
        </span>
      </div>

      <div className="usage" role="group" aria-label="AI rewrites left">
        <Meter label="Today" left={left?.day} of={LIMITS.day} />
        <Meter label="This month" left={left?.month} of={LIMITS.month} />
      </div>

      {confirming ? (
        <div className="confirm" role="alert">
          <p className="menu-note">Delete your account and your AI history? Your CVs stay in this browser.</p>
          <div className="menu-buttons">
            <button type="button" className="btn secondary danger" onClick={() => void remove()}>
              Delete account
            </button>
            <button type="button" className="btn quiet" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
          {problem && <p className="menu-note bad">{problem}</p>}
        </div>
      ) : (
        <div className="menu-buttons">
          <button type="button" className="btn secondary" onClick={() => void authClient.signOut()}>
            Sign out
          </button>
          <button type="button" className="btn quiet danger" onClick={() => setConfirming(true)}>
            Delete account
          </button>
        </div>
      )}
    </>
  );
}
