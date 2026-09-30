"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { Ui } from "@/lib/storage";

/* Everything that is not the CV, behind one button in the header: how the
   editor looks, where the CVs live, and the account the AI button needs. */

type Option<T extends string> = { value: T; label: string };

const THEMES: Option<"auto" | "light" | "dark">[] = [
  { value: "auto", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const ZOOMS: Option<"fit" | "actual">[] = [
  { value: "fit", label: "Fit" },
  { value: "actual", label: "100%" },
];

export default function Settings({
  ui,
  onUi,
  count,
  tabOnly,
  onTabOnly,
  onBackup,
  onRestore,
}: {
  ui: Ui;
  onUi: (change: Partial<Ui>) => void;
  /** How many CVs there are. With none, there is nothing to back up. */
  count: number;
  /** True when this tab forgets its CVs as it closes. */
  tabOnly: boolean;
  onTabOnly: (on: boolean) => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div
      className="settings"
      ref={wrap}
      onKeyDown={event => {
        if (event.key !== "Escape" || !open) return;
        setOpen(false);
        button.current?.focus();
      }}
    >
      <button
        ref={button}
        type="button"
        className="tog"
        aria-expanded={open}
        aria-controls="settings"
        onClick={() => setOpen(on => !on)}
      >
        Settings
      </button>
      <div className="settings-panel" id="settings" role="group" aria-label="Settings" hidden={!open}>
        <Choice
          label="Theme"
          name="theme"
          options={THEMES}
          value={ui.theme ?? "auto"}
          onChange={value => onUi({ theme: value === "auto" ? undefined : value })}
        />
        <Choice
          label="Zoom"
          name="zoom"
          options={ZOOMS}
          value={ui.zoom ?? "fit"}
          onChange={value => onUi({ zoom: value })}
          narrow={false}
        />
        <hr />
        <p className="settings-note">
          {tabOnly
            ? "Your CVs and photo stay in this tab only. Closing it deletes them, so back up any you want to keep."
            : "Your CVs are saved in this browser only. Clearing its site data deletes them, so keep a backup."}
        </p>
        <label className="switch">
          <input type="checkbox" checked={tabOnly} onChange={event => onTabOnly(event.target.checked)} />
          Forget my CVs when I close this tab
        </label>
        <div className="buttons">
          <button type="button" className="tog" onClick={onBackup} disabled={!count}>
            Back up
          </button>
          <button type="button" className="tog" onClick={() => file.current?.click()}>
            Restore
          </button>
        </div>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={event => {
            const picked = event.target.files?.[0];
            event.target.value = "";
            if (picked) onRestore(picked);
          }}
        />
        <hr />
        <Account open={open} />
        <p className="settings-links">
          <Link href="/privacy" target="_blank" rel="noopener">
            Privacy
            <span className="sr-only"> (opens in a new tab)</span>
          </Link>
          <Link href="/terms" target="_blank" rel="noopener">
            Terms
            <span className="sr-only"> (opens in a new tab)</span>
          </Link>
        </p>
      </div>
    </div>
  );
}

/** Signed out: a way in, for the AI button. Signed in: who, how many AI
    rewrites are left, and a way out. */
function Account({ open }: { open: boolean }) {
  const session = authClient.useSession();
  const user = session.data?.user;
  const [left, setLeft] = useState<{ day: number; month: number } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [problem, setProblem] = useState("");

  /* Read fresh each time the panel opens, since the AI button uses them. */
  useEffect(() => {
    if (!open || !user) return;
    let current = true;
    fetch("/api/ai/usage")
      .then(response => (response.ok ? response.json() : null))
      .then((body: { left?: { day: number; month: number } } | null) => {
        if (current && body?.left) setLeft(body.left);
      })
      .catch(() => undefined);
    return () => {
      current = false;
    };
  }, [open, user]);

  if (session.isPending) return <p className="settings-note">Checking your account…</p>;

  if (!user) {
    return (
      <>
        <p className="settings-note">An account is only for AI rewrites. Your CVs stay in this browser either way.</p>
        <div className="buttons">
          <button
            type="button"
            className="tog"
            onClick={() => void authClient.signIn.social({ provider: "google", callbackURL: window.location.href })}
          >
            Sign in with Google
          </button>
        </div>
      </>
    );
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

  return (
    <>
      <p className="settings-note">
        Signed in as <b className="who">{user.email}</b>.
        {left && ` AI rewrites left: ${left.day} today, ${left.month} this month.`}
      </p>
      {confirming ? (
        <div className="confirm" role="alert">
          <p>Delete your account and your AI history? Your CVs stay in this browser.</p>
          <div className="buttons">
            <button type="button" className="tog danger" onClick={() => void remove()}>
              Delete account
            </button>
            <button type="button" className="tog" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
          {problem && <p className="bad">{problem}</p>}
        </div>
      ) : (
        <div className="buttons">
          <button type="button" className="tog" onClick={() => void authClient.signOut()}>
            Sign out
          </button>
          <button type="button" className="tog" onClick={() => setConfirming(true)}>
            Delete account
          </button>
        </div>
      )}
    </>
  );
}

/** A row of options drawn as one segmented control. They stay real radio
    buttons, so the arrow keys move between them. */
function Choice<T extends string>({
  label,
  name,
  options,
  value,
  onChange,
  narrow = true,
}: {
  label: string;
  name: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** False hides the row on narrow screens, where it does nothing. */
  narrow?: boolean;
}) {
  const id = `setting-${name}`;
  return (
    <div className={"setting" + (narrow ? "" : " hide-narrow")}>
      <span className="setting-name" id={id}>
        {label}
      </span>
      <div className="seg" role="radiogroup" aria-labelledby={id}>
        {options.map(option => (
          <label key={option.value}>
            <input
              type="radio"
              name={id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
