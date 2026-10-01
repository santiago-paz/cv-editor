"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

/* A panel that opens under a button and closes on Escape, on a click outside,
   or when focus leaves it. It is drawn in the page body, so a scrolling column
   cannot clip it, and it flips above the button when there is no room below.

   `menu` makes it a list of actions: the arrow keys move between its
   `role="menuitem"` buttons. Without it, it is a small dialog of controls. */

interface Place {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  maxHeight: number;
}

export interface PopoverApi {
  open: boolean;
  toggle: () => void;
  ref: RefObject<HTMLButtonElement | null>;
  panelId: string;
}

const FOCUSABLE = 'input, select, textarea, button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export function Popover({
  label,
  align = "start",
  menu = false,
  className,
  trigger,
  children,
}: {
  /** The panel's name for screen readers. */
  label: string;
  align?: "start" | "end";
  menu?: boolean;
  className?: string;
  trigger: (api: PopoverApi) => ReactNode;
  /** `close(false)` leaves focus where the action put it, instead of on the button. */
  children: (api: { close: (returnFocus?: boolean) => void }) => ReactNode;
}) {
  const panelId = useId();
  const ref = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState<Place | null>(null);

  const measure = useCallback(() => {
    const button = ref.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom;
    const flip = below < 300 && rect.top > below;
    const room = (flip ? rect.top : below) - 16;
    setPlace({
      maxHeight: Math.max(160, room),
      ...(flip ? { bottom: window.innerHeight - rect.top + 8 } : { top: rect.bottom + 8 }),
      ...(align === "end"
        ? { right: Math.max(12, window.innerWidth - rect.right) }
        : { left: Math.max(12, rect.left) }),
    });
  }, [align]);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) ref.current?.focus();
  }, []);

  function toggle() {
    if (open) close();
    else {
      measure();
      setOpen(true);
    }
  }

  useEffect(() => {
    if (!open) return;
    const away = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panel.current?.contains(target) || ref.current?.contains(target)) return;
      setOpen(false);
    };
    const follow = () => measure();
    document.addEventListener("pointerdown", away);
    window.addEventListener("scroll", follow, true);
    window.addEventListener("resize", follow);
    return () => {
      document.removeEventListener("pointerdown", away);
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
    };
  }, [open, measure]);

  /* A panel wider than the room beside its button slides back inside the
     screen. It moves with `translate`, which the opening animation leaves alone. */
  useLayoutEffect(() => {
    const element = panel.current;
    if (!open || !place || !element) return;
    element.style.translate = "";
    const box = element.getBoundingClientRect();
    const gap = 12;
    let shift = 0;
    if (box.left < gap) shift = gap - box.left;
    else if (box.right > window.innerWidth - gap) shift = window.innerWidth - gap - box.right;
    if (shift) element.style.translate = `${shift}px 0`;
  }, [open, place]);

  /* Focus moves into the panel when it opens. */
  useEffect(() => {
    if (!open || !place) return;
    const element = panel.current;
    if (!element || element.contains(document.activeElement)) return;
    const first = element.querySelector<HTMLElement>(menu ? '[role="menuitem"]:not([disabled])' : "[data-autofocus]") ??
      element.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
  }, [open, place, menu]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
      return;
    }
    if (menu && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      const items = Array.from(panel.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? []);
      if (!items.length) return;
      event.preventDefault();
      const at = items.indexOf(document.activeElement as HTMLElement);
      const next = event.key === "ArrowDown" ? (at + 1) % items.length : (at - 1 + items.length) % items.length;
      items[next].focus();
    }
  }

  return (
    <>
      {trigger({ open, toggle, ref, panelId })}
      {open &&
        place &&
        createPortal(
          <div
            ref={panel}
            id={panelId}
            className={"menu" + (className ? ` ${className}` : "")}
            role={menu ? "menu" : "dialog"}
            aria-label={label}
            style={{ position: "fixed", ...place }}
            onKeyDown={onKeyDown}
            onBlur={event => {
              const next = event.relatedTarget as Node | null;
              if (next && !panel.current?.contains(next) && !ref.current?.contains(next)) setOpen(false);
            }}
          >
            {/* close only ever runs from a click or a key, never while rendering. */}
            {/* eslint-disable-next-line react-hooks/refs */}
            {children({ close: (returnFocus = true) => close(returnFocus) })}
          </div>,
          document.body,
        )}
    </>
  );
}
