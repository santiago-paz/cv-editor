"use client";

import { useEffect, useState } from "react";
import { LIMITS } from "@/lib/ai";
import { authClient } from "@/lib/auth-client";
import { startSignIn } from "@/lib/sign-in";
import { useT } from "./i18n";
import { GoogleG } from "./icons";
import { LegalLink } from "./LegalLink";

/* The account, inside Settings. Signed out: a way in, for the AI button.
   Signed in: who, how many AI rewrites are left, and a way out.

   This file holds the auth client, so Settings loads it only when it first
   opens, and people who never sign in never download it. */

interface Left {
  day: number;
  month: number;
}

function Meter({ label, left, of }: { label: string; left: number | undefined; of: number }) {
  const t = useT();
  const tone = left === undefined ? "" : left === 0 ? "bad" : left <= 2 ? "warn" : "";
  return (
    <div className="usage-row">
      <span>{label}</span>
      <div className={"bar " + tone} aria-hidden="true">
        <i style={{ transform: `scaleX(${left === undefined ? 0 : Math.min(1, left / of)})` }} />
      </div>
      <b>{left === undefined ? "-" : t.account.left(left)}</b>
    </div>
  );
}

export default function Account() {
  const t = useT();
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
      setProblem(t.account.needsRecent);
      return;
    }
    setConfirming(false);
  }

  if (session.isPending) return <p className="menu-note">{t.account.checking}</p>;

  if (!user) {
    return (
      <>
        <p className="menu-note">
          {session.error ? t.account.checkFailed : t.account.only}
        </p>
        <div className="menu-buttons">
          <button type="button" className="google-button" disabled={going} onClick={() => void signIn()}>
            <GoogleG />
            {going ? t.account.opening : t.account.continue}
          </button>
        </div>
        <p className="menu-note">
          {t.account.consent(
            <LegalLink page="terms">{t.legal.termsLink}</LegalLink>,
            <LegalLink page="privacy">{t.legal.privacyLink}</LegalLink>,
          )}
        </p>
        {failed && (
          <p className="menu-note bad" role="alert">
            {t.account.startFailed}
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

      <div className="usage" role="group" aria-label={t.account.leftLabel}>
        <Meter label={t.account.today} left={left?.day} of={LIMITS.day} />
        <Meter label={t.account.month} left={left?.month} of={LIMITS.month} />
      </div>

      {confirming ? (
        <div className="confirm" role="alert">
          <p className="menu-note">{t.account.confirm}</p>
          <div className="menu-buttons">
            <button type="button" className="btn secondary danger" onClick={() => void remove()}>
              {t.account.delete}
            </button>
            <button type="button" className="btn quiet" onClick={() => setConfirming(false)}>
              {t.common.cancel}
            </button>
          </div>
          {problem && <p className="menu-note bad">{problem}</p>}
        </div>
      ) : (
        <div className="menu-buttons">
          <button type="button" className="btn secondary" onClick={() => void authClient.signOut()}>
            {t.account.signOut}
          </button>
          <button type="button" className="btn quiet danger" onClick={() => setConfirming(true)}>
            {t.account.delete}
          </button>
        </div>
      )}
    </>
  );
}
