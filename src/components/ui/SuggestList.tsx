"use client";

import { createPortal } from "react-dom";
import type { Suggestion } from "@/lib/suggest/types";
import { useT } from "../i18n";
import { Key } from "../icons";
import { ranged } from "./util";

/* The list that drops under a box while it suggests. Shared by the text boxes
   and the rich bullet editor, so both place it, light it and read out the same
   way. It is drawn in the page body, so a scrolling column cannot clip it. */

export interface Place {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

const ROOM = 250;
const MAX = 340;

/** Where the list goes for a box at this rectangle: under it, or above it when
    the room below is short. */
export function placeFor(rect: DOMRect): Place {
  const viewport = window.visualViewport?.height ?? window.innerHeight;
  const below = viewport - rect.bottom;
  const flip = below < ROOM && rect.top > below;
  const room = (flip ? rect.top : below) - 14;
  return {
    left: rect.left,
    width: rect.width,
    maxHeight: Math.max(120, Math.min(MAX, room)),
    ...(flip ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
  };
}

/** Every line equal to what is already typed is not worth showing. */
export function worthShowing(list: Suggestion[], value: string): Suggestion[] {
  return list.every(item => item.value === value) ? [] : list;
}

export function SuggestList({
  id,
  place,
  items,
  lit,
  onTake,
  onLight,
  wrap,
}: {
  /** The id prefix: each option is `${id}-o${index}`, for aria-activedescendant. */
  id: string;
  place: Place;
  items: Suggestion[];
  lit: number;
  onTake: (item: Suggestion) => void;
  onLight: (index: number) => void;
  /** Lets a long line take two rows instead of being cut, for bullets and drafts. */
  wrap?: boolean;
}) {
  const t = useT();
  return createPortal(
    <ul
      className={"pop" + (wrap ? " wrap" : "")}
      id={`${id}-list`}
      role="listbox"
      aria-label={t.suggest.label}
      style={{
        left: place.left,
        width: Math.max(place.width, 240),
        top: place.top,
        bottom: place.bottom,
        maxHeight: place.maxHeight,
      }}
      onMouseDown={event => event.preventDefault()}
    >
      {items.map((item, at) => (
        <li
          key={item.value}
          id={`${id}-o${at}`}
          role="option"
          aria-selected={at === lit}
          className={"pop-item" + (at === lit ? " on" : "")}
          onMouseDown={event => {
            event.preventDefault();
            onTake(item);
          }}
          onMouseMove={event => {
            // A real move only: a list that appears under a still pointer must not steal the light.
            if ((event.movementX || event.movementY) && at !== lit) onLight(at);
          }}
        >
          <span className="pop-text">
            {ranged(item.label ?? item.value, item.ranges).map((part, index) =>
              typeof part === "string" ? part : <b key={index}>{part.bold}</b>,
            )}
          </span>
          {item.hint && <span className="pop-hint">{item.hint}</span>}
          {at === lit && <Key tone="on">↵</Key>}
        </li>
      ))}
    </ul>,
    document.body,
  );
}
