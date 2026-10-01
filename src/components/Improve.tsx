"use client";

import { useEffect, useId, useRef, useState } from "react";
import { markNew, sameWords } from "@/lib/ai-diff";
import { LIMITS, type RewriteReply } from "@/lib/ai";
import type { Locale } from "@/lib/cv/types";
import { textOf } from "@/lib/html";
import { aiMessage } from "@/lib/i18n/errors";
import { sanitize } from "@/lib/sanitize";
import { startSignIn, whoIsSignedIn } from "@/lib/sign-in";
import { useT } from "./i18n";
import { GoogleG, Icon } from "./icons";
import { LegalLink } from "./LegalLink";
import { IconButton } from "./ui/bits";

/* The AI button under a block of the CV, and what it brings back.

   Nothing changes until the person takes a suggestion, and each one can be
   put back, since the editor keeps no history of its own. Every suggestion
   sits under the line it would replace, and the words it changed are marked
   the way the highlighter marks the sheet.

   The button needs an account. Signed out, it says so and offers Google
   sign-in. It is not part of the Enter flow: the fast path stays a path of
   typing, and this is for when the typing is done. */

export interface Block {
  id: string;
  html: string;
}

type State =
  | { step: "idle" }
  | { step: "signin"; going?: boolean }
  | { step: "busy" }
  | { step: "error"; title: string; message: string; retry: boolean }
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
  const t = useT();
  const [state, setState] = useState<State>({ step: "idle" });
  const trigger = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const busy = state.step === "busy";

  /* The card comes into view as soon as it opens. One that has something to
     say also takes focus, so a keyboard or screen reader user lands on the
     answer. */
  useEffect(() => {
    const element = card.current;
    if (!element || state.step === "idle") return;
    if (state.step !== "busy") element.focus({ preventScroll: true });
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollIntoView({ block: "nearest", behavior: still ? "auto" : "smooth" });
  }, [state.step]);

  function close() {
    setState({ step: "idle" });
    trigger.current?.focus();
  }

  async function ask() {
    if (busy) return;
    setState({ step: "busy" });
    const who = await whoIsSignedIn().catch(() => ({ user: null, failed: true }));
    if (who.failed) {
      setState({ step: "error", title: t.ai.checkTitle, message: t.account.checkFailed, retry: true });
      return;
    }
    if (!who.user) {
      setState({ step: "signin" });
      return;
    }
    const originals = blocks.map(block => ({ ...block }));
    try {
      const response = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, title, dates, locale, items: originals.map(block => block.html) }),
      });
      const body = (await response.json().catch(() => null)) as (RewriteReply & { error?: unknown; code?: unknown }) | null;
      if (response.status === 401) {
        setState({ step: "signin" });
        return;
      }
      if (!response.ok || !body) {
        /* Vercel's own replies, such as its firewall's, put an object in
           "error". Only the route's text is fit to show, in the words its
           "code" names when this page has them. */
        const message = typeof body?.error === "string" ? aiMessage(t.errors.ai, body.code, body.error) : "";
        setState({
          step: "error",
          title: t.ai.noRewrite,
          message: message || t.ai.failedStatus(response.status),
          retry: response.status === 500 || response.status === 502,
        });
        return;
      }
      setState({ step: "done", reply: body, originals, used: new Set() });
    } catch {
      setState({
        step: "error",
        title: t.ai.noRewrite,
        message: t.ai.unreachable,
        retry: true,
      });
    }
  }

  async function signIn() {
    setState({ step: "signin", going: true });
    try {
      await startSignIn();
    } catch {
      setState({ step: "error", title: t.ai.startTitle, message: t.account.startFailed, retry: false });
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
      return { id, html: on ? sanitize(reply.items[index] ?? originals[index].html) : originals[index].html };
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

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="ai-button"
        aria-disabled={busy || undefined}
        onClick={() => void ask()}
      >
        <Icon name="sparkle" size={15} />
        {busy ? t.ai.busy : t.ai.button}
      </button>
      <span className="sr-only" role="status">
        {busy
          ? t.ai.busy
          : state.step === "done"
            ? state.reply.items.length > 1
              ? t.ai.readyMany
              : t.ai.readyOne
            : ""}
      </span>

      {state.step !== "idle" && (
        <div
          ref={card}
          className={"ai" + (state.step === "error" ? " bad" : "")}
          tabIndex={-1}
          role="region"
          aria-labelledby={headingId}
          aria-busy={busy || undefined}
          onKeyDown={event => {
            if (event.key === "Escape") {
              event.stopPropagation();
              close();
            }
          }}
        >
          {state.step === "signin" && (
            <>
              <div className="ai-head">
                <h4 className="ai-title" id={headingId}>
                  <Icon name="sparkle" size={16} />
                  {t.ai.signInTitle(kind)}
                </h4>
              </div>
              <p className="ai-say">{t.ai.signInSay(LIMITS.day)}</p>
              <p className="menu-note">
                {t.ai.consent(
                  <LegalLink page="terms">{t.legal.termsLink}</LegalLink>,
                  <LegalLink page="privacy">{t.legal.privacyLink}</LegalLink>,
                )}
              </p>
              <div className="ai-actions">
                <button type="button" className="google-button" disabled={state.going} onClick={() => void signIn()}>
                  <GoogleG />
                  {state.going ? t.account.opening : t.account.continue}
                </button>
                <button type="button" className="btn quiet" onClick={close}>
                  {t.ai.notNow}
                </button>
              </div>
            </>
          )}

          {state.step === "busy" && (
            <>
              <div className="ai-head">
                <h4 className="ai-title" id={headingId}>
                  <Icon name="sparkle" size={16} />
                  {t.ai.busyTitle(kind)}
                </h4>
              </div>
              <div className="ai-skel" aria-hidden="true">
                {blocks.slice(0, 3).map(block => (
                  <i key={block.id} />
                ))}
              </div>
            </>
          )}

          {state.step === "error" && (
            <>
              <div className="ai-head">
                <h4 className="ai-title" id={headingId}>
                  <Icon name="alert" size={16} />
                  {state.title}
                </h4>
              </div>
              <p className="ai-say" role="alert">
                {state.message}
              </p>
              <div className="ai-actions">
                {state.retry && (
                  <button type="button" className="btn secondary" onClick={() => void ask()}>
                    {t.ai.tryAgain}
                  </button>
                )}
                <button type="button" className="btn quiet" onClick={close}>
                  {t.ai.close}
                </button>
              </div>
            </>
          )}

          {state.step === "done" && <Suggestions state={state} headingId={headingId} toggle={toggle} close={close} />}
        </div>
      )}
    </>
  );
}

function Suggestions({
  state,
  headingId,
  toggle,
  close,
}: {
  state: Extract<State, { step: "done" }>;
  headingId: string;
  toggle: (indexes: number[], on: boolean) => void;
  close: () => void;
}) {
  const t = useT();
  const { reply, originals, used } = state;
  /* One row for each block that was sent. The reply lines up with them, and a
     line that is missing leaves the original as it was. */
  const rows = originals.map((original, index) => {
    const clean = sanitize(reply.items[index] ?? original.html);
    const before = textOf(original.html);
    return { index, before, same: sameWords(clean, before), shown: markNew(clean, before), id: original.id };
  });
  const changed = rows.filter(row => !row.same);
  const allUsed = changed.length > 0 && changed.every(row => used.has(row.id));
  const left = reply.left.day;

  return (
    <>
      <div className="ai-head">
        <h4 className="ai-title" id={headingId}>
          <Icon name="sparkle" size={16} />
          {rows.length > 1 ? t.ai.suggestions : t.ai.suggestion}
        </h4>
        <span className="ai-left">{left > 0 ? t.ai.leftToday(left) : t.ai.lastToday}</span>
        {changed.length > 1 && (
          <button
            type="button"
            className="text-button"
            onClick={() =>
              toggle(
                changed.map(row => row.index),
                !allUsed,
              )
            }
          >
            {allUsed ? t.ai.undoAll : t.ai.useAll}
          </button>
        )}
        <IconButton icon="close" label={t.ai.closeSuggestions} onClick={close} />
      </div>

      <ol className="ai-list">
        {rows.map(row => {
          const on = used.has(row.id);
          return (
            <li key={row.id} className={"ai-row" + (on ? " used" : "") + (row.same ? " same" : "")}>
              <div className="ai-copy">
                {row.same ? (
                  <p className="ai-keep">{row.before}</p>
                ) : (
                  <>
                    <p className="ai-before">
                      <span className="ai-tag">{t.ai.before}</span>
                      <span>{row.before}</span>
                    </p>
                    <p className="ai-after">
                      <span className="ai-tag">{t.ai.after}</span>
                      <span className="ai-text" dangerouslySetInnerHTML={{ __html: row.shown }} />
                    </p>
                  </>
                )}
              </div>
              {row.same ? (
                <span className="ai-same">
                  <Icon name="check" size={14} />
                  {t.ai.alreadyGood}
                </span>
              ) : (
                <button
                  type="button"
                  className={"ai-use" + (on ? " on" : "")}
                  aria-label={on ? t.ai.undoLabel(row.index + 1) : t.ai.useLabel(row.index + 1)}
                  onClick={() => toggle([row.index], !on)}
                >
                  {on && <Icon name="check" size={14} />}
                  {on ? t.ai.undo : t.ai.use}
                </button>
              )}
            </li>
          );
        })}
      </ol>

      {reply.tips.length > 0 && (
        <div className="ai-tips">
          <Icon name="bulb" size={16} />
          <ul>
            {reply.tips.map(tip => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
