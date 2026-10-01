"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { fold } from "@/lib/suggest/text";
import type { Suggest, Suggestion } from "@/lib/suggest/types";
import { useT } from "../i18n";
import { flowStep } from "./flow";
import { SuggestList, placeFor, worthShowing, type Place } from "./SuggestList";

/* A text box that suggests as you type.

   Type a few letters and the likeliest line is lit, with the rest of it in
   grey after the caret. Enter takes it and moves to the next box. Tab takes
   it and moves on the normal way. The right arrow takes it and stays, to keep
   typing. Escape puts the list away. With nothing lit, Enter keeps what was
   typed, so any text can still go in.

   With no `suggest`, it is a plain text box that still moves on with Enter. */

export interface ComboProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "size" | "children"> {
  value: string;
  onChange: (value: string) => void;
  suggest?: Suggest;
  /** The path the preview uses for this text, so a click there finds this box. */
  field?: string;
  /** Offer the list as soon as the box has focus, before anything is typed. */
  openOnFocus?: boolean;
  /** Show the rest of the lit suggestion in grey after the typed text. */
  ghost?: boolean;
  /** What Enter does after it takes a line or keeps the text. Defaults to the
      next box. */
  onAdvance?: (input: HTMLInputElement) => void;
  /** The element the list is placed under, when that is not the box itself. */
  anchorRef?: RefObject<HTMLElement | null>;
  /** Runs when a line is taken. */
  onPick?: (suggestion: Suggestion) => void;
  /** Runs before the box's own keys. Return true to say it handled the key. */
  onKeys?: (event: KeyboardEvent<HTMLInputElement>) => boolean;
  /** Something after the text inside the box, such as a clear button. */
  trailing?: ReactNode;
  boxClassName?: string;
}

export function Combo({
  value,
  onChange,
  suggest,
  field,
  openOnFocus,
  ghost = true,
  onAdvance,
  anchorRef,
  onPick,
  onKeys,
  trailing,
  boxClassName,
  className,
  onFocus,
  onBlur,
  ...rest
}: ComboProps) {
  const t = useT();
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(-1);
  const [place, setPlace] = useState<Place | null>(null);
  const [overflowing, setOverflowing] = useState(false);

  const items = focused && suggest ? worthShowing(suggest(value), value) : [];
  const open = focused && !dismissed && items.length > 0 && (value.trim() !== "" || !!openOnFocus);
  const lit = open && active >= 0 && active < items.length ? active : -1;

  /* The lit line's unwritten end, when the line begins with what is typed. */
  const top = lit >= 0 ? items[lit] : null;
  const ghostRest =
    ghost && top && value && !overflowing && top.value.length > value.length && fold(top.value).startsWith(fold(value))
      ? top.value.slice(value.length)
      : "";

  function measure() {
    const anchor = anchorRef?.current ?? box.current;
    if (anchor) setPlace(placeFor(anchor.getBoundingClientRect()));
  }

  /* The list follows the box while the page scrolls or resizes under it. */
  useEffect(() => {
    if (!open) return;
    const follow = () => {
      const anchor = anchorRef?.current ?? box.current;
      if (anchor) setPlace(placeFor(anchor.getBoundingClientRect()));
    };
    window.addEventListener("scroll", follow, true);
    window.addEventListener("resize", follow);
    window.visualViewport?.addEventListener("resize", follow);
    return () => {
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
      window.visualViewport?.removeEventListener("resize", follow);
    };
  }, [open, anchorRef]);

  function advance() {
    if (!input.current) return;
    if (onAdvance) onAdvance(input.current);
    else flowStep(input.current);
  }

  function accept(item: Suggestion, how: "enter" | "tab" | "click" | "arrow") {
    onChange(item.value);
    onPick?.(item);
    setDismissed(true);
    setActive(-1);
    if (how === "tab") return;
    if (item.keep || how === "arrow") {
      const element = input.current;
      requestAnimationFrame(() => {
        element?.focus();
        element?.setSelectionRange(item.value.length, item.value.length);
      });
      return;
    }
    advance();
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    onChange(next);
    setDismissed(false);
    const list = suggest ? worthShowing(suggest(next), next) : [];
    setActive(next.trim().length >= 2 && list[0]?.strong ? 0 : -1);
    measure();
    const element = event.target;
    requestAnimationFrame(() => setOverflowing(element.scrollWidth > element.clientWidth));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (onKeys?.(event)) return;
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    // Cmd or Ctrl with Enter is "next step", which the panel takes.
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) return;
    const last = items.length - 1;

    switch (event.key) {
      case "ArrowDown":
        if (!items.length) return;
        event.preventDefault();
        if (!open) {
          setDismissed(false);
          setActive(0);
          measure();
        } else setActive(lit >= last ? 0 : lit + 1);
        return;
      case "ArrowUp":
        if (!items.length) return;
        event.preventDefault();
        if (!open) {
          setDismissed(false);
          setActive(last);
          measure();
        } else setActive(lit <= 0 ? last : lit - 1);
        return;
      case "Enter":
        event.preventDefault();
        if (lit >= 0) accept(items[lit], "enter");
        else advance();
        return;
      case "Tab":
        if (lit >= 0 && !event.shiftKey) {
          if (items[lit].keep) event.preventDefault();
          accept(items[lit], "tab");
        }
        return;
      case "Escape":
        if (open) {
          event.preventDefault();
          event.stopPropagation();
          setDismissed(true);
        }
        return;
      case "ArrowRight":
      case "End": {
        const element = event.currentTarget;
        const atEnd = element.selectionStart === value.length && element.selectionEnd === value.length;
        if (ghostRest && atEnd) {
          event.preventDefault();
          accept(items[lit], "arrow");
        }
        return;
      }
    }
  }

  const listed = !!suggest;

  return (
    <div className={"box combo" + (boxClassName ? ` ${boxClassName}` : "")} ref={box} data-open={open || undefined}>
      {ghostRest && (
        <div className="ghost" aria-hidden="true">
          <span>{value}</span>
          <i>{ghostRest}</i>
        </div>
      )}
      <input
        ref={input}
        type="text"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="next"
        {...rest}
        className={className}
        value={value}
        data-field={field}
        data-flow=""
        role={listed ? "combobox" : undefined}
        aria-expanded={listed ? open : undefined}
        aria-controls={listed && open ? `${id}-list` : undefined}
        aria-autocomplete={listed ? (ghost ? "both" : "list") : undefined}
        aria-activedescendant={lit >= 0 ? `${id}-o${lit}` : undefined}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={event => {
          setFocused(true);
          setDismissed(false);
          setActive(-1);
          measure();
          onFocus?.(event);
        }}
        onBlur={event => {
          setFocused(false);
          onBlur?.(event);
        }}
      />
      {trailing}
      {open && (
        <span className="sr-only" role="status">
          {items.length === 1 ? t.suggest.one : t.suggest.many(items.length)}
        </span>
      )}
      {open && place && (
        <SuggestList
          id={id}
          place={place}
          items={items}
          lit={lit}
          onTake={item => accept(item, "click")}
          onLight={setActive}
        />
      )}
    </div>
  );
}
