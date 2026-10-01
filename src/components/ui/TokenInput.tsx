"use client";

import { useRef, useState, type ClipboardEvent, type DragEvent, type KeyboardEvent } from "react";
import { fold } from "@/lib/suggest/text";
import type { Suggest } from "@/lib/suggest/types";
import { Icon } from "../icons";
import { Combo } from "./Combo";
import { flowStep } from "./flow";

/* A row of chips with a box after them, for skills and interests.

   Type and press Enter to add a chip, and stay in the box to add the next.
   Enter on an empty box moves on. A comma also adds the chip. Backspace on an
   empty box removes the last chip. Pasting "React, Node, SQL" adds three. A
   chip can be reordered by dragging it, or with Alt and the arrow keys once it
   has focus (the left arrow from the empty box reaches the last one), and
   Delete removes it. */

export interface Chip {
  id: string;
  text: string;
}

export function TokenInput({
  chips,
  onAdd,
  onRemove,
  onMove,
  suggest,
  label,
  placeholder,
  field,
  chipField,
  over = Number.POSITIVE_INFINITY,
}: {
  chips: Chip[];
  onAdd: (text: string) => void;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  suggest: Suggest;
  label: string;
  placeholder?: string;
  /** The path of the box, for the preview's click to edit. */
  field?: string;
  /** The path of one chip. */
  chipField?: (chip: Chip) => string;
  /** Chips from this position on are marked as past the limit. */
  over?: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  const [dragging, setDragging] = useState<number | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);

  const inputOf = () => wrap.current?.querySelector<HTMLInputElement>("input") ?? null;
  const focusInput = () => requestAnimationFrame(() => inputOf()?.focus());
  const chipEls = () => Array.from(wrap.current?.querySelectorAll<HTMLElement>("[data-chip]") ?? []);

  function commit(text: string) {
    const value = text.trim();
    if (value && !chips.some(chip => fold(chip.text) === fold(value))) onAdd(value);
    setDraft("");
  }

  function remove(index: number) {
    onRemove(index);
    focusInput();
  }

  function onChipKey(event: KeyboardEvent<HTMLElement>, index: number) {
    if (event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      event.preventDefault();
      const to = index + (event.key === "ArrowLeft" ? -1 : 1);
      if (to < 0 || to >= chips.length) return;
      onMove(index, to);
      requestAnimationFrame(() => chipEls()[to]?.focus());
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      chipEls()[index - 1]?.focus();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      if (index + 1 < chips.length) chipEls()[index + 1]?.focus();
      else inputOf()?.focus();
    } else if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      remove(index);
    } else if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault();
      inputOf()?.focus();
    }
  }

  function onDrop(event: DragEvent, to: number) {
    event.preventDefault();
    if (dragging !== null && dragging !== to) onMove(dragging, to);
    setDragging(null);
    setDropAt(null);
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text");
    if (!/[,;\n]/.test(text)) return;
    event.preventDefault();
    const seen = new Set(chips.map(chip => fold(chip.text)));
    for (const part of text.split(/[,;\n]+/)) {
      const value = part.trim();
      if (value && !seen.has(fold(value))) {
        seen.add(fold(value));
        onAdd(value);
      }
    }
  }

  return (
    <div className="tokens box" ref={wrap}>
      {chips.map((chip, index) => (
        <span
          key={chip.id}
          className={
            "chip" +
            (index >= over ? " over" : "") +
            (dragging === index ? " dragging" : "") +
            (dropAt === index && dragging !== index ? " drop" : "")
          }
          data-chip=""
          data-field={chipField?.(chip)}
          tabIndex={-1}
          draggable
          onKeyDown={event => onChipKey(event, index)}
          onDragStart={event => {
            setDragging(index);
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", chip.text);
          }}
          onDragOver={event => {
            if (dragging === null) return;
            event.preventDefault();
            setDropAt(index);
          }}
          onDrop={event => onDrop(event, index)}
          onDragEnd={() => {
            setDragging(null);
            setDropAt(null);
          }}
        >
          <span className="chip-text">{chip.text}</span>
          <button
            type="button"
            className="chip-x"
            tabIndex={-1}
            aria-label={`Remove ${chip.text}`}
            onMouseDown={event => event.preventDefault()}
            onClick={() => remove(index)}
          >
            <Icon name="close" size={12} />
          </button>
        </span>
      ))}
      <Combo
        value={draft}
        onChange={setDraft}
        suggest={query => suggest(query).map(item => ({ ...item, keep: true }))}
        openOnFocus
        anchorRef={wrap}
        boxClassName="bare"
        aria-label={label}
        placeholder={chips.length ? "Add another" : placeholder}
        field={field}
        onPick={item => commit(item.value)}
        onAdvance={input => {
          if (draft.trim()) commit(draft);
          else flowStep(input);
        }}
        onPaste={onPaste}
        onKeys={event => {
          const empty = draft === "";
          if ((event.key === "," || event.key === ";") && !event.metaKey && !event.ctrlKey) {
            event.preventDefault();
            if (!empty) commit(draft);
            return true;
          }
          if (event.key === "Backspace" && empty && chips.length) {
            event.preventDefault();
            onRemove(chips.length - 1);
            return true;
          }
          if (event.key === "ArrowLeft" && empty && chips.length && event.currentTarget.selectionStart === 0) {
            event.preventDefault();
            chipEls()[chips.length - 1]?.focus();
            return true;
          }
          return false;
        }}
      />
    </div>
  );
}
