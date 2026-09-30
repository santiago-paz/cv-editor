"use client";

import { useLayoutEffect, useRef, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { sanitize } from "@/lib/sanitize";
import { Icon, type IconName } from "./icons";

/** Moves one item of a list, in place. For use inside an immer recipe. */
export function move<T>(list: T[], from: number, to: number): void {
  if (to < 0 || to >= list.length || from === to) return;
  list.splice(to, 0, list.splice(from, 1)[0]);
}

/** Focuses what matches once React has drawn it. */
export function focusLater(selector: string, select = false): void {
  requestAnimationFrame(() => {
    const target = document.querySelector<HTMLElement>(selector);
    if (!target) return;
    target.focus({ preventScroll: false });
    if (select && target instanceof HTMLInputElement) target.select();
    if (target.isContentEditable) placeCaretAtEnd(target);
  });
}

function placeCaretAtEnd(element: HTMLElement): void {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

export function IconButton({
  icon,
  label,
  onClick,
  disabled,
  danger,
  action,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  /** Lets focus find this button again after the list redraws. */
  action?: string;
}) {
  return (
    <button
      type="button"
      className={"iconbtn" + (danger ? " danger" : "")}
      aria-label={label}
      title={label}
      disabled={disabled}
      data-action={action}
      onClick={onClick}
    >
      <Icon name={icon} />
    </button>
  );
}

/** Up, down and delete for a row of a list. */
export function RowButtons({
  index,
  count,
  noun,
  onMove,
  onDelete,
}: {
  index: number;
  count: number;
  noun: string;
  onMove: (to: number) => void;
  onDelete: () => void;
}) {
  return (
    <>
      <IconButton icon="up" label={`Move ${noun} up`} action="up" disabled={index === 0} onClick={() => onMove(index - 1)} />
      <IconButton
        icon="down"
        label={`Move ${noun} down`}
        action="down"
        disabled={index === count - 1}
        onClick={() => onMove(index + 1)}
      />
      <IconButton icon="close" label={`Delete ${noun}`} action="delete" danger onClick={onDelete} />
    </>
  );
}

type TextProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  /** The path the proof uses for this field, so a click there finds it. */
  field?: string;
};

export function Text({ value, onChange, field, type = "text", ...rest }: TextProps) {
  return (
    <input
      type={type}
      value={value}
      autoComplete="off"
      data-field={field}
      onChange={event => onChange(event.target.value)}
      {...rest}
    />
  );
}

export function Field({ label, htmlFor, children, meter }: { label: string; htmlFor: string; children: ReactNode; meter?: ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>
        {label}
        {meter}
      </label>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------- rich text */

interface RichProps {
  value: string;
  onChange: (html: string) => void;
  label: string;
  field?: string;
  id?: string;
  placeholder?: string;
  tall?: boolean;
  /** Enter adds the next item instead of a line break, as in a list. */
  onEnter?: () => void;
  /** Backspace in an empty field removes it, as in a list. */
  onEmptyBackspace?: () => void;
}

/**
 * A contenteditable field for text with bold, italics and links.
 *
 * It is uncontrolled while it has focus: React writes the markup in only
 * when the value changes from outside (an undo, another CV), never back over
 * what is being typed, so the caret never jumps.
 */
export function RichField({ value, onChange, label, field, id, placeholder, tall, onEnter, onEmptyBackspace }: RichProps) {
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef<string | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || value === last.current) return;
    element.innerHTML = value;
    last.current = value;
  }, [value]);

  const emit = () => {
    const element = ref.current;
    if (!element) return;
    const html = sanitize(element.innerHTML);
    last.current = html;
    onChange(html);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const mod = event.metaKey || event.ctrlKey;
    if (event.key === "Enter") {
      event.preventDefault();
      if (onEnter && !event.shiftKey) onEnter();
      else document.execCommand("insertLineBreak");
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
  };

  return (
    <div
      ref={ref}
      id={id}
      className={"rich" + (tall ? " tall" : "")}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      aria-label={label}
      data-field={field}
      data-placeholder={placeholder}
      spellCheck
      onInput={emit}
      onKeyDown={onKeyDown}
      onPaste={event => {
        /* Pasted text arrives as text: styles from a word processor would
           otherwise come along and be stripped piece by piece. */
        event.preventDefault();
        const text = event.clipboardData.getData("text/plain").replace(/\s*\n\s*/g, " ");
        document.execCommand("insertText", false, text);
      }}
      onDrop={event => event.preventDefault()}
    />
  );
}
