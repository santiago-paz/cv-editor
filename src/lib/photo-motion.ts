/* The photo's room on the proof opens and shuts when the photo is switched on
   or off. The room is the photo's own box: its width, its height and the space
   under it go to nothing and come back. The browser lays out the copy around
   it as it always does, so the words glide to their new place in either
   template, and nothing here has to know where the photo sits.

   Width, height and margin are layout properties, and transform and opacity
   are the usual choice. Here the layout is the point: the browser lays the
   copy out around the shrinking box, so every line glides with it. It is one
   small box in a frame of its own, and it ran at 60 fps in Chrome.

   The motion is set on the <img> inside the proof's frame and nowhere else.
   The markup and the stylesheet are the ones the PDF prints, and the PDF never
   plays any of this. */

/** How the preview marks the photo. The templates write it through `mark()`,
    and neither `esc()` nor the rich-text sanitizer lets typed text forge it. */
const MARK = 'data-edit="photo"';
export const PHOTO = `img[${MARK}]`;

const OPEN_MS = 320;
const CLOSE_MS = 240;
/* Softer than --ease in globals.css. That one is meant for small pops and has
   done 93% of its work by half time, which reads as a jump when the copy has
   80 pixels to travel. This one eases in for a few frames, then settles. */
const EASE = "cubic-bezier(0.3, 0.2, 0.1, 1)";

type Way = "open" | "close";

/** True when a rendered body prints the photo. */
export function printsPhoto(body: string): boolean {
  return body.includes(MARK);
}

/** Whether motion is wanted and can be seen: the frame is on screen, and the
    person has not asked for less movement. */
export function movable(frame: HTMLElement): boolean {
  return frame.getClientRects().length > 0 && !matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** The move that is opening the photo's room, shutting it, or holding it shut. */
export function moving(img: HTMLImageElement): Animation | undefined {
  return img.getAnimations().find(item => item.id === "open" || item.id === "close");
}

/** The milliseconds a move has left to run. */
export function left(move: Animation): number {
  return Math.max(0, (move.id === "open" ? OPEN_MS : CLOSE_MS) - Number(move.currentTime ?? 0));
}

const styleOf = (node: Element) => (node.ownerDocument.defaultView ?? window).getComputedStyle(node);

/** The gap a flex row keeps beside the photo. It is part of the photo's room,
    so a room that is shut gives it back. */
function gapOf(img: HTMLImageElement): number {
  const row = img.parentElement && styleOf(img.parentElement);
  return row?.display === "flex" ? parseFloat(row.columnGap) || 0 : 0;
}

/** The room with nothing in it. */
function shut(img: HTMLImageElement): Keyframe {
  const gap = gapOf(img);
  return {
    width: "0px",
    height: "0px",
    marginBottom: "0px",
    opacity: 0,
    ...(gap ? { marginRight: `${-gap}px` } : {}),
  };
}

/** The room as it stands this instant, in the middle of a move or not. */
function now(img: HTMLImageElement): Keyframe {
  const style = styleOf(img);
  return {
    width: style.width,
    height: style.height,
    marginBottom: style.marginBottom,
    opacity: style.opacity,
    ...(gapOf(img) ? { marginRight: style.marginRight } : {}),
  };
}

/** Opens or shuts the photo's room. A move that already goes that way is left
    to run. One that goes the other way turns round from where it has got to, so
    a switch flipped twice in a row never jumps. */
export function glide(img: HTMLImageElement, way: Way): Animation {
  const going = moving(img);
  if (going?.id === way) return going;
  const from = going || way === "close" ? now(img) : shut(img);
  going?.cancel();
  const to = way === "close" ? shut(img) : now(img);
  const move = img.animate([from, to], {
    duration: way === "open" ? OPEN_MS : CLOSE_MS,
    easing: EASE,
    /* A room that shuts stays shut until the copy without the photo replaces
       it. A room that opens hands back to the stylesheet. */
    fill: way === "open" ? "backwards" : "forwards",
  });
  move.id = way;
  return move;
}
