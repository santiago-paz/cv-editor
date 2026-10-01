import { flushSync } from "react-dom";

/* The Enter flow.

   Every box that takes part carries `data-flow`. Enter in one moves to the
   next in page order, so a whole CV can be typed without the mouse. The boxes
   sit inside an element marked `data-flow-root`, which is one step of the
   editor. At the last box of the step, Enter tells the step to hand over to
   the next one, by sending `flow:end` to the root. */

export const FLOW_END = "flow:end";

/** Puts the caret after the last character of an editable element. */
export function caretToEnd(element: HTMLElement): void {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

/** Focuses a box the way Tab would: a text box gets its text selected, so a
    value that is already there is replaced by typing. */
export function focusBox(element: HTMLElement, options: { scroll?: boolean } = {}): void {
  element.focus({ preventScroll: options.scroll === false });
  if (element instanceof HTMLInputElement) {
    if (element.type === "text" || element.type === "email" || element.type === "tel" || element.type === "url") {
      element.select();
    }
  } else if (element.isContentEditable) caretToEnd(element);
}

/** Makes a change and focuses what matches, in one go. React draws the change
    first (flushSync), so a key pressed a moment later lands in the new box and
    not the old one. Use it wherever Enter adds a row and moves into it. */
export function changeThenFocus(change: () => void, selector: string): void {
  flushSync(change);
  const target = document.querySelector<HTMLElement>(selector);
  if (target) focusBox(target);
}

/** Focuses what matches once React has drawn it. For the cases where the
    change is not ours to flush. */
export function focusLater(selector: string, options: { select?: boolean } = {}): void {
  requestAnimationFrame(() => {
    const target = document.querySelector<HTMLElement>(selector);
    if (!target) return;
    target.focus();
    if (options.select && target instanceof HTMLInputElement) target.select();
    else if (target.isContentEditable) caretToEnd(target);
  });
}

function shown(element: HTMLElement): boolean {
  if (element.matches(":disabled")) return false;
  return element.getClientRects().length > 0;
}

/** The boxes of a step, in page order. */
export function flowList(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>("[data-flow]")).filter(shown);
}

/** Moves focus to the box after (or before) this one. At the end of the step,
    tells the step. Returns where focus went, if it moved. */
export function flowStep(from: HTMLElement, direction: 1 | -1 = 1): HTMLElement | null {
  const root = from.closest<HTMLElement>("[data-flow-root]");
  if (!root) return null;
  const list = flowList(root);
  const at = list.findIndex(element => element === from || element.contains(from));
  const next = list[at + direction];
  if (next) {
    focusBox(next);
    return next;
  }
  if (direction === 1) root.dispatchEvent(new CustomEvent(FLOW_END));
  return null;
}
