"use client";

import { useState } from "react";
import { LIMITS, type RewriteReply } from "@/lib/ai";
import { authClient } from "@/lib/auth-client";
import type { Locale } from "@/lib/cv/types";
import { textOf } from "@/lib/html";
import { sanitize } from "@/lib/sanitize";

/* The AI button under a block of the CV, and what it brings back.

   Nothing changes until the person takes a suggestion. Each one can be put
   back, since the editor keeps no history of its own. The button needs an
   account: signed out, it explains that and offers Google sign-in. */

export interface Block {
  id: string;
  html: string;
}

type State =
  | { step: "idle" }
  | { step: "signin" }
  | { step: "busy" }
  | { step: "error"; message: string }
  | { step: "done"; reply: RewriteReply; originals: Block[]; used: Set<string> };

export default function Improve({
  kind,
  blocks,
  title,
  dates = "",
  locale,
  onUse,
}: {
  kind: "bullets" | "text";
  blocks: Block[];
  /** What the block belongs to: a job title, or the CV's headline. */
  title: string;
  dates?: string;
  locale: Locale;
  onUse: (changes: Block[]) => void;
}) {
  const session = authClient.useSession();
  const [state, setState] = useState<State>({ step: "idle" });
  const filled = blocks.some(block => textOf(block.html));

  async function ask() {
    const signedIn = session.data ?? (await authClient.getSession()).data;
    if (!signedIn) {
      setState({ step: "signin" });
      return;
    }
    const originals = blocks.map(block => ({ ...block }));
    setState({ step: "busy" });
    try {
      const response = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, title, dates, locale, items: originals.map(block => block.html) }),
      });
      const body = (await response.json().catch(() => null)) as (RewriteReply & { error?: string }) | null;
      if (!response.ok || !body) {
        setState({ step: "error", message: body?.error || `The rewrite failed (error ${response.status}).` });
        return;
      }
      setState({ step: "done", reply: body, originals, used: new Set() });
    } catch {
      setState({ step: "error", message: "Could not reach the server. Check your connection and try again." });
    }
  }

  /** Puts suggestions in, or takes them back out. */
  function toggle(indexes: number[], on: boolean) {
    if (state.step !== "done") return;
    const { reply, originals } = state;
    const used = new Set(state.used);
    const changes = indexes.map(index => {
      const id = originals[index].id;
      if (on) used.add(id);
      else used.delete(id);
      return { id, html: on ? sanitize(reply.items[index]) : originals[index].html };
    });
    if (on && !state.used.size) {
      void fetch("/api/ai/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reply.id }),
      }).catch(() => undefined);
    }
    onUse(changes);
    setState({ ...state, used });
  }

  const busy = state.step === "busy";

  return (
    <>
      <button
        type="button"
        className="tog"
        onClick={() => void ask()}
        disabled={!filled || busy}
        title={filled ? undefined : "Write something here first"}
      >
        {busy ? "Improving…" : "Improve with AI"}
      </button>
      <span className="sr-only" role="status">
        {busy ? "Improving…" : state.step === "done" ? "The suggestion is ready, below." : ""}
      </span>

      {state.step === "signin" && (
        <div className="ai-note">
          <p>Sign in with Google to use AI rewrites. They&apos;re free while we test them, {LIMITS.day} a day.</p>
          <div className="buttons">
            <button
              type="button"
              className="save"
              onClick={() => void authClient.signIn.social({ provider: "google", callbackURL: window.location.href })}
            >
              Continue with Google
            </button>
            <button type="button" className="tog" onClick={() => setState({ step: "idle" })}>
              Not now
            </button>
          </div>
        </div>
      )}

      {state.step === "error" && (
        <div className="ai-note bad" role="alert">
          <p>{state.message}</p>
          <div className="buttons">
            <button type="button" className="tog" onClick={() => setState({ step: "idle" })}>
              Close
            </button>
          </div>
        </div>
      )}

      {state.step === "done" && (
        <div className="ai-note" role="region" aria-label="AI suggestion">
          <div className="ai-head">
            <span className="ai-label">Suggestion</span>
            <span className="ai-left">
              {state.reply.left.day} left today
            </span>
            {state.reply.items.length > 1 && (
              <button
                type="button"
                className="tog"
                onClick={() => {
                  const all = state.reply.items.map((_, index) => index);
                  toggle(all, state.used.size < all.length);
                }}
              >
                {state.used.size < state.reply.items.length ? "Use all" : "Undo all"}
              </button>
            )}
            <button type="button" className="tog" onClick={() => setState({ step: "idle" })}>
              Close
            </button>
          </div>
          <ol className="ai-items">
            {state.reply.items.map((html, index) => {
              const on = state.used.has(state.originals[index].id);
              return (
                <li key={state.originals[index].id} className={on ? "used" : undefined}>
                  <span className="ai-text" dangerouslySetInnerHTML={{ __html: sanitize(html) }} />
                  <button type="button" className="tog" onClick={() => toggle([index], !on)}>
                    {on ? "Undo" : "Use"}
                  </button>
                </li>
              );
            })}
          </ol>
          {state.reply.tips.length > 0 && (
            <ul className="ai-tips">
              {state.reply.tips.map(tip => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
