"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "./i18n";

/* The toolbar that floats over selected text in a rich field: bold, italics,
   add a link, remove a link. The same commands are on the keyboard as
   Cmd/Ctrl+B, I and K, so the toolbar is never the only way. */

interface Place {
  top: number;
  left: number;
}

function richOf(node: Node | null): HTMLElement | null {
  const element = node instanceof Element ? node : node?.parentElement;
  return (element?.closest(".rich") as HTMLElement | null) ?? null;
}

/** What someone types as a link, as an address a CV can print. */
export function linkHref(value: string): string {
  const text = value.trim();
  if (!text) return "";
  if (/^(https?:|mailto:|tel:)/i.test(text)) return text;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return `mailto:${text}`;
  if (/^\+?[\d\s()/.-]{6,}$/.test(text)) return `tel:${text.replace(/[^\d+]/g, "")}`;
  if (/^[^\s/]+\.[^\s]+/.test(text)) return `https://${text}`;
  return "";
}

export default function RichToolbar() {
  const t = useT();
  const [place, setPlace] = useState<Place | null>(null);
  const [linking, setLinking] = useState(false);
  const [href, setHref] = useState("");
  const saved = useRef<{ range: Range; field: HTMLElement } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const linkingRef = useRef(false);
  linkingRef.current = linking;

  useEffect(() => {
    document.execCommand("styleWithCSS", false, "false");

    const onSelection = () => {
      if (linkingRef.current) return;
      const selection = document.getSelection();
      const field = selection && selection.rangeCount ? richOf(selection.anchorNode) : null;
      if (!field || !selection || selection.isCollapsed) {
        setPlace(null);
        return;
      }
      const box = selection.getRangeAt(0).getBoundingClientRect();
      setPlace({ top: Math.max(8, box.top - 40), left: Math.max(8, Math.min(box.left, window.innerWidth - 280)) });
    };

    /* Cmd/Ctrl+K from a field: link the selection, or the word typed so far. */
    const onLinkKey = () => {
      const selection = document.getSelection();
      if (!selection || !selection.rangeCount || !richOf(selection.anchorNode)) return;
      const box = selection.getRangeAt(0).getBoundingClientRect();
      setPlace({ top: Math.max(8, box.top - 40), left: Math.max(8, Math.min(box.left, window.innerWidth - 280)) });
      startLink();
    };

    document.addEventListener("selectionchange", onSelection);
    document.addEventListener("rich:link", onLinkKey);
    return () => {
      document.removeEventListener("selectionchange", onSelection);
      document.removeEventListener("rich:link", onLinkKey);
    };
  }, []);

  function startLink() {
    const selection = document.getSelection();
    if (!selection || !selection.rangeCount) return;
    const field = richOf(selection.anchorNode);
    if (!field) return;
    saved.current = { range: selection.getRangeAt(0).cloneRange(), field };
    const existing = richOf(selection.anchorNode) && (selection.anchorNode?.parentElement?.closest("a") as HTMLAnchorElement | null);
    setHref(existing?.getAttribute("href") ?? "");
    setLinking(true);
    requestAnimationFrame(() => input.current?.focus());
  }

  function restore(): HTMLElement | null {
    const kept = saved.current;
    if (!kept) return null;
    kept.field.focus();
    const selection = document.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(kept.range);
    return kept.field;
  }

  function changed(field: HTMLElement | null) {
    field?.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function run(command: "bold" | "italic" | "unlink") {
    document.execCommand(command);
    const selection = document.getSelection();
    changed(richOf(selection?.anchorNode ?? null));
  }

  function applyLink() {
    const target = linkHref(href);
    const field = restore();
    if (field) {
      if (target) document.execCommand("createLink", false, target);
      else document.execCommand("unlink");
      changed(field);
    }
    closeLink();
  }

  function closeLink() {
    setLinking(false);
    setHref("");
    saved.current = null;
    setPlace(null);
  }

  if (!place) return null;

  return (
    <div
      className="toolbar"
      role="toolbar"
      aria-label={t.toolbar.label}
      style={{ top: place.top, left: place.left }}
      onMouseDown={event => {
        if (!(event.target instanceof HTMLInputElement)) event.preventDefault();
      }}
    >
      {linking ? (
        <form
          style={{ display: "flex", gap: 2, alignItems: "center" }}
          onSubmit={event => {
            event.preventDefault();
            applyLink();
          }}
        >
          <input
            ref={input}
            type="text"
            value={href}
            placeholder={t.toolbar.addressPlaceholder}
            aria-label={t.toolbar.address}
            spellCheck={false}
            onChange={event => setHref(event.target.value)}
            onKeyDown={event => {
              if (event.key === "Escape") {
                event.preventDefault();
                restore();
                closeLink();
              }
            }}
          />
          <button type="submit">{href.trim() ? t.toolbar.link : t.toolbar.unlink}</button>
          <button
            type="button"
            onClick={() => {
              restore();
              closeLink();
            }}
          >
            {t.toolbar.cancel}
          </button>
        </form>
      ) : (
        <>
          <button type="button" aria-label={t.toolbar.bold} title={t.toolbar.boldTitle} onClick={() => run("bold")}>
            <b>B</b>
          </button>
          <button type="button" aria-label={t.toolbar.italic} title={t.toolbar.italicTitle} onClick={() => run("italic")}>
            <i>I</i>
          </button>
          <button type="button" title={t.toolbar.addLinkTitle} onClick={startLink}>
            {t.toolbar.link}
          </button>
          <button type="button" title={t.toolbar.removeLinkTitle} onClick={() => run("unlink")}>
            {t.toolbar.unlink}
          </button>
        </>
      )}
    </div>
  );
}
