"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { textOf } from "@/lib/html";
import { sanitize } from "@/lib/sanitize";
import type { Suggest, Suggestion } from "@/lib/suggest/types";
import { caretToEnd, flowStep } from "./flow";
import { SuggestList, placeFor, worthShowing, type Place } from "./SuggestList";

/* A text box for words that can carry bold, italics and links: the bullets
   under a job, the summary, a paragraph.

   It is left alone while it has focus. React writes the markup in only when
   the value changes from outside (an undo, another CV), never back over what is
   being typed, so the caret never jumps.

   Like the other boxes it can suggest. The suggestions are whole lines: taking
   one replaces what was typed. They are offered only while the text is plain,
   so a line with bold in it is never overwritten by accident. Enter takes the
   lit line, or moves on. Shift+Enter starts a new line inside the box. */

interface Props {
  value: string;
  onChange: (html: string) => void;
  label: string;
  field?: string;
  id?: string;
  placeholder?: string;
  tall?: boolean;
  /** Whole lines to suggest, as plain text. */
  suggest?: Suggest;
  /** Enter on a line with text. Defaults to the next box. */
  onEnter?: () => void;
  /** Enter on an empty line. Defaults to `onEnter`. */
  onEmptyEnter?: () => void;
  /** Backspace in an empty box, such as removing an empty bullet. */
  onEmptyBackspace?: () => void;
  /** Runs before the box's own keys. Return true to say it handled the key. */
  onKeys?: (event: KeyboardEvent<HTMLDivElement>) => boolean;
  className?: string;
}

export function RichField({
  value,
  onChange,
  label,
  field,
  id,
  placeholder,
  tall,
  suggest,
  onEnter,
  onEmptyEnter,
  onEmptyBackspace,
  onKeys,
  className,
}: Props) {
  const listId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(-1);
  const [place, setPlace] = useState<Place | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || value === last.current) return;
    element.innerHTML = value;
    last.current = value;
  }, [value]);

  /* Suggestions are read from the value, and only while it is plain text. */
  const plain = !value.includes("<");
  const text = textOf(value);
  const items = focused && suggest && plain ? worthShowing(suggest(text), text) : [];
  const open = focused && !dismissed && items.length > 0;
  const lit = open && active >= 0 && active < items.length ? active : -1;

  function measure() {
    if (ref.current) setPlace(placeFor(ref.current.getBoundingClientRect()));
  }

  useEffect(() => {
    if (!open) return;
    const follow = () => {
      if (ref.current) setPlace(placeFor(ref.current.getBoundingClientRect()));
    };
    window.addEventListener("scroll", follow, true);
    window.addEventListener("resize", follow);
    window.visualViewport?.addEventListener("resize", follow);
    return () => {
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
      window.visualViewport?.removeEventListener("resize", follow);
    };
  }, [open]);

  const emit = () => {
    const element = ref.current;
    if (!element) return;
    const html = sanitize(element.innerHTML);
    // An emptied box can keep a stray <br>, which hides the placeholder.
    if (!html && element.innerHTML) element.innerHTML = "";
    last.current = html;
    onChange(html);
  };

  function advance() {
    if (onEnter) onEnter();
    else if (ref.current) flowStep(ref.current);
  }

  function accept(item: Suggestion, how: "enter" | "tab" | "click") {
    const element = ref.current;
    if (!element) return;
    element.textContent = item.value;
    emit();
    setDismissed(true);
    setActive(-1);
    if (how === "tab") return;
    caretToEnd(element);
    if (how === "enter") advance();
  }

  function onInput() {
    emit();
    setDismissed(false);
    const element = ref.current;
    const typed = element?.textContent ?? "";
    const plainNow = !!element && element.children.length === 0;
    const list = suggest && plainNow ? worthShowing(suggest(typed), typed) : [];
    setActive(typed.trim().length >= 2 && list[0]?.strong ? 0 : -1);
    measure();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (onKeys?.(event)) return;
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    const mod = event.metaKey || event.ctrlKey;
    // Cmd or Ctrl with Enter is "next step", which the panel takes.
    if (event.key === "Enter" && mod) return;
    const lastItem = items.length - 1;

    if (event.key === "Enter") {
      event.preventDefault();
      if (event.shiftKey) {
        document.execCommand("insertLineBreak");
        return;
      }
      if (lit >= 0) accept(items[lit], "enter");
      else if (!(ref.current?.textContent ?? "").trim() && onEmptyEnter) onEmptyEnter();
      else advance();
      return;
    }
    if (event.key === "Tab" && lit >= 0 && !event.shiftKey) {
      accept(items[lit], "tab");
      return;
    }
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setDismissed(true);
      return;
    }
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && !mod && !event.altKey && items.length) {
      const down = event.key === "ArrowDown";
      if (!open) {
        event.preventDefault();
        setDismissed(false);
        setActive(down ? 0 : lastItem);
        measure();
      } else {
        event.preventDefault();
        setActive(down ? (lit >= lastItem ? 0 : lit + 1) : lit <= 0 ? lastItem : lit - 1);
      }
      return;
    }
    if (event.key === "Backspace" && onEmptyBackspace && !ref.current?.textContent) {
      event.preventDefault();
      onEmptyBackspace();
      return;
    }
    if (mod && !event.altKey && (event.key === "b" || event.key === "i")) {
      event.preventDefault();
      document.execCommand(event.key === "b" ? "bold" : "italic");
      emit();
      return;
    }
    if (mod && event.key === "k") {
      event.preventDefault();
      document.dispatchEvent(new CustomEvent("rich:link"));
    }
  }

  const listed = !!suggest;

  return (
    <>
      <div
        ref={ref}
        id={id}
        className={"rich" + (tall ? " tall" : "") + (className ? ` ${className}` : "")}
        contentEditable
        suppressContentEditableWarning
        role={listed ? "combobox" : "textbox"}
        aria-multiline="true"
        aria-label={label}
        aria-expanded={listed ? open : undefined}
        aria-controls={listed && open ? `${listId}-list` : undefined}
        aria-autocomplete={listed ? "list" : undefined}
        aria-activedescendant={lit >= 0 ? `${listId}-o${lit}` : undefined}
        data-field={field}
        data-flow=""
        data-placeholder={placeholder}
        spellCheck
        translate="no"
        enterKeyHint="next"
        onInput={onInput}
        onKeyDown={onKeyDown}
        onFocus={() => {
          setFocused(true);
          setDismissed(false);
          setActive(-1);
          measure();
        }}
        onBlur={() => setFocused(false)}
        onPaste={event => {
          /* Pasted text arrives as text: styles from a word processor would
             otherwise come along and be stripped piece by piece. */
          event.preventDefault();
          const pasted = event.clipboardData.getData("text/plain").replace(/\s*\n\s*/g, " ");
          document.execCommand("insertText", false, pasted);
        }}
        onDrop={event => event.preventDefault()}
      />
      {open && (
        <span className="sr-only" role="status">
          {items.length === 1 ? "1 suggestion" : `${items.length} suggestions`}
        </span>
      )}
      {open && place && (
        <SuggestList
          id={listId}
          place={place}
          items={items}
          lit={lit}
          onTake={item => accept(item, "click")}
          onLight={setActive}
          wrap
        />
      )}
    </>
  );
}
