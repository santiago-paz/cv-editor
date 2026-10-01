/** The modifier key as a key cap shows it: "⌘" on a Mac, "Ctrl" elsewhere. */
export function modKey(): string {
  return typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl";
}

/** Moves one item of a list, in place. For use inside an immer recipe. */
export function move<T>(list: T[], from: number, to: number): void {
  if (to < 0 || to >= list.length || from === to) return;
  list.splice(to, 0, list.splice(from, 1)[0]);
}

/** A soft glow on a box, to say "this is what changed". */
export function flash(element: HTMLElement | null): void {
  const glow = element?.closest<HTMLElement>(".box") ?? element;
  if (!glow) return;
  glow.classList.remove("found");
  void glow.offsetWidth;
  glow.classList.add("found");
}

/** Bold the parts of a suggestion the person has typed. */
export function ranged(text: string, ranges: [number, number][] | undefined): (string | { bold: string })[] {
  if (!ranges?.length) return [text];
  const out: (string | { bold: string })[] = [];
  let at = 0;
  for (const [from, to] of ranges) {
    if (from > at) out.push(text.slice(at, from));
    out.push({ bold: text.slice(from, to) });
    at = to;
  }
  if (at < text.length) out.push(text.slice(at));
  return out;
}
