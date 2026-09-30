/* The photo cropper: where the photo sits under the frame, and the stage that
   lets it be dragged and zoomed there.

   Every CV prints the same photo, and each template cuts its own shape out of
   it: a circle on Sidebar, a rounded square on Classic. So the crop is always
   a square of the original's pixels, and the shape drawn over the stage only
   shows what the open CV prints.

   A view places the original under the frame. `frame` is the frame's side in
   CSS pixels, `scale` is frame pixels per original pixel, and `x`, `y` put the
   original's top-left corner relative to the frame's. Every function returns
   a view that keeps the frame covered, so no edge of the photo shows inside. */

export interface Size {
  width: number;
  height: number;
}

export interface View {
  frame: number;
  scale: number;
  x: number;
  y: number;
}

export interface Square {
  left: number;
  top: number;
  side: number;
}

/** At 1 the photo's short side spans the frame; at 5 a fifth of it does. */
export const MAX_ZOOM = 5;

/** The frame's share of the stage. The margin around it holds the veil and the
    trim marks. */
const FRAME_SHARE = 0.72;

/** Trim marks stand GAP pixels off the frame's corners and run LENGTH pixels. */
const GAP = 6;
const LENGTH = 12;

const fitScale = (image: Size, frame: number) => frame / Math.min(image.width, image.height);

function boundScale(scale: number, image: Size, frame: number): number {
  const least = fitScale(image, frame);
  return Math.min(Math.max(scale, least), least * MAX_ZOOM);
}

export function clamp(view: View, image: Size): View {
  const scale = boundScale(view.scale, image, view.frame);
  return {
    frame: view.frame,
    scale,
    x: Math.min(0, Math.max(view.frame - image.width * scale, view.x)),
    y: Math.min(0, Math.max(view.frame - image.height * scale, view.y)),
  };
}

/** The short side across the frame, centred along the long one. */
export function fit(image: Size, frame: number): View {
  const scale = fitScale(image, frame);
  return clamp(
    { frame, scale, x: (frame - image.width * scale) / 2, y: (frame - image.height * scale) / 2 },
    image,
  );
}

export function pan(view: View, image: Size, dx: number, dy: number): View {
  return clamp({ frame: view.frame, scale: view.scale, x: view.x + dx, y: view.y + dy }, image);
}

/** Zoom about a point in frame pixels, so whatever is under it stays there. */
export function zoomAt(view: View, image: Size, scale: number, px: number, py: number): View {
  const next = boundScale(scale, image, view.frame);
  const k = next / view.scale;
  return clamp(
    { frame: view.frame, scale: next, x: px - (px - view.x) * k, y: py - (py - view.y) * k },
    image,
  );
}

export const zoomOf = (view: View, image: Size) => view.scale / fitScale(image, view.frame);

/** The square of original pixels the frame covers. */
export function crop(view: View): Square {
  return { left: -view.x / view.scale, top: -view.y / view.scale, side: view.frame / view.scale };
}

export function fromCrop(square: Square, image: Size, frame: number): View {
  const scale = frame / square.side;
  return clamp({ frame, scale, x: -square.left * scale, y: -square.top * scale }, image);
}

/* A canvas painted white first: a JPEG has no transparency, and a transparent
   PNG would otherwise come out black. */
function sheet(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { canvas, ctx };
}

/** The square, drawn `size` pixels on a side. */
export function render(image: CanvasImageSource, square: Square, size: number): HTMLCanvasElement {
  const out = sheet(size, size);
  out.ctx.drawImage(image, square.left, square.top, square.side, square.side, 0, 0, size, size);
  return out.canvas;
}

/** The whole picture, no longer than `longest` pixels on either side. */
export function shrink(image: CanvasImageSource, width: number, height: number, longest: number): HTMLCanvasElement {
  const k = Math.min(1, longest / Math.max(width, height));
  const out = sheet(Math.max(1, Math.round(width * k)), Math.max(1, Math.round(height * k)));
  out.ctx.drawImage(image, 0, 0, out.canvas.width, out.canvas.height);
  return out.canvas;
}

/* ------------------------------------------------------------------ stage */

export type StageEvent = "load" | "move" | "settle";

export interface Stage {
  load(img: HTMLImageElement, square?: Square | null): void;
  zoomTo(zoom: number): void;
  zoomBy(factor: number): void;
  reset(): void;
  readonly zoom: number;
  readonly square: Square | null;
  destroy(): void;
}

/** Drag to move, wheel or pinch to zoom, the arrow keys and + and - on the
    keyboard, and a double-click centres the spot clicked, so the photo moves
    without dragging too. `onChange` hears "load" when a photo goes in, "move"
    while a gesture runs and "settle" when it ends. */
export function createStage(
  root: HTMLElement,
  parts: { img: HTMLImageElement; marks: SVGPathElement; svg: SVGSVGElement },
  onChange: (kind: StageEvent) => void,
): Stage {
  const img = parts.img;
  const { marks, svg } = parts;
  let image: Size | null = null;
  let view: View | null = null;
  let box: { size: number; frame: number; inset: number } | null = null;
  const pointers = new Map<number, { x: number; y: number }>();
  let pinch: { mid: { x: number; y: number }; dist: number; scale: number } | null = null;
  let wheelTimer = 0;

  /* The frame is snapped to whole pixels, so its edge and the trim marks stay
     sharp. A resize keeps the crop. */
  function layout() {
    const size = root.clientWidth;
    if (!size || (box && box.size === size)) return;
    const frame = 2 * Math.round((size * FRAME_SHARE) / 2);
    const before = view && crop(view);
    box = { size, frame, inset: Math.round((size - frame) / 2) };
    root.style.setProperty("--frame", frame + "px");
    root.style.setProperty("--inset", box.inset + "px");
    drawMarks();
    if (before && image) show(fromCrop(before, image, frame));
  }

  /* Two short lines at each corner, standing off it, the way a printer marks
     where a sheet is cut. A 1px line sits on the half pixel to stay sharp. */
  function drawMarks() {
    if (!box) return;
    const near = box.inset - 0.5;
    const far = box.inset + box.frame + 0.5;
    const reach = GAP + LENGTH;
    svg.setAttribute("viewBox", `0 0 ${box.size} ${box.size}`);
    marks.setAttribute(
      "d",
      [
        [near, near, -1, -1],
        [far, near, 1, -1],
        [near, far, -1, 1],
        [far, far, 1, 1],
      ]
        .map(
          ([x, y, sx, sy]) =>
            `M${x + sx * GAP} ${y}H${x + sx * reach}M${x} ${y + sy * GAP}V${y + sy * reach}`,
        )
        .join(""),
    );
  }

  function show(next: View) {
    view = next;
    if (!box) return;
    img.style.transform = `translate(${box.inset + view.x}px, ${box.inset + view.y}px) scale(${view.scale})`;
  }

  function set(next: View, kind: StageEvent) {
    show(next);
    onChange(kind);
  }

  /* A pointer's place in frame pixels. */
  function at(event: { clientX: number; clientY: number }) {
    const r = root.getBoundingClientRect();
    const inset = box ? box.inset : 0;
    return {
      x: event.clientX - r.left - root.clientLeft - inset,
      y: event.clientY - r.top - root.clientTop - inset,
    };
  }

  function spread() {
    const [a, b] = Array.from(pointers.values());
    return {
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
      scale: view ? view.scale : 1,
    };
  }

  const onPointerDown = (event: PointerEvent) => {
    if (!view || event.button !== 0) return;
    root.focus({ preventScroll: true });
    root.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, at(event));
    if (pointers.size === 2) pinch = spread();
    root.classList.add("dragging");
  };

  const onPointerMove = (event: PointerEvent) => {
    const last = pointers.get(event.pointerId);
    if (!last || !view || !image) return;
    const now = at(event);
    pointers.set(event.pointerId, now);

    if (pinch && pointers.size > 1) {
      /* Two fingers: zoom about where they started, then follow them. */
      const next = spread();
      const zoomed = zoomAt(view, image, (pinch.scale * next.dist) / pinch.dist, pinch.mid.x, pinch.mid.y);
      set(pan(zoomed, image, next.mid.x - pinch.mid.x, next.mid.y - pinch.mid.y), "move");
      pinch.mid = next.mid;
      return;
    }
    set(pan(view, image, now.x - last.x, now.y - last.y), "move");
  };

  const release = (event: PointerEvent) => {
    if (!pointers.delete(event.pointerId)) return;
    pinch = pointers.size > 1 ? spread() : null;
    if (pointers.size) return;
    root.classList.remove("dragging");
    onChange("settle");
  };

  const onWheel = (event: WheelEvent) => {
    if (!view || !image || !box) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? box.size : 1;
    /* A trackpad pinch arrives as a wheel event with ctrlKey set, in much
       smaller steps than a mouse wheel. */
    const rate = event.ctrlKey ? 0.01 : 0.0015;
    const p = at(event);
    set(zoomAt(view, image, view.scale * Math.exp(-event.deltaY * unit * rate), p.x, p.y), "move");
    window.clearTimeout(wheelTimer);
    wheelTimer = window.setTimeout(() => onChange("settle"), 200);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!view || !image || event.altKey || event.metaKey || event.ctrlKey) return;
    const step = event.shiftKey ? 24 : 4;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (move) set(pan(view, image, move[0], move[1]), "settle");
    else if (event.key === "+" || event.key === "=") zoomBy(1.1);
    else if (event.key === "-" || event.key === "_") zoomBy(1 / 1.1);
    else if (event.key === "0") reset();
    else return;
    event.preventDefault();
  };

  const onDoubleClick = (event: MouseEvent) => {
    if (!view || !image || !box) return;
    const p = at(event);
    const middle = box.frame / 2;
    set(pan(view, image, middle - p.x, middle - p.y), "settle");
  };

  root.addEventListener("pointerdown", onPointerDown);
  root.addEventListener("pointermove", onPointerMove);
  root.addEventListener("pointerup", release);
  root.addEventListener("pointercancel", release);
  root.addEventListener("wheel", onWheel, { passive: false });
  root.addEventListener("keydown", onKeyDown);
  root.addEventListener("dblclick", onDoubleClick);
  const observer = new ResizeObserver(() => {
    if (view) layout();
  });
  observer.observe(root);

  function zoomTo(zoom: number) {
    if (!view || !image || !box) return;
    const middle = box.frame / 2;
    set(zoomAt(view, image, fitScale(image, box.frame) * zoom, middle, middle), "settle");
  }

  function zoomBy(factor: number) {
    if (view && image) zoomTo(zoomOf(view, image) * factor);
  }

  function reset() {
    if (view && image && box) set(fit(image, box.frame), "settle");
  }

  return {
    /* Put a loaded <img> on the stage, placed by `square` or fitted. The
       stage must be showing: its size is read here. */
    load(source, square) {
      /* The stage keeps its own <img>, which its page owns; only the picture
         moves across. */
      if (source !== img) img.src = source.src;
      image = { width: source.naturalWidth, height: source.naturalHeight };
      img.style.width = image.width + "px";
      img.style.height = image.height + "px";
      view = null;
      box = null;
      layout();
      if (!box) return;
      const frame = (box as { frame: number }).frame;
      set(square ? fromCrop(square, image, frame) : fit(image, frame), "load");
    },
    zoomTo,
    zoomBy,
    reset,
    get zoom() {
      return view && image ? zoomOf(view, image) : 1;
    },
    get square() {
      return view ? crop(view) : null;
    },
    destroy() {
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", release);
      root.removeEventListener("pointercancel", release);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("keydown", onKeyDown);
      root.removeEventListener("dblclick", onDoubleClick);
      observer.disconnect();
      window.clearTimeout(wheelTimer);
    },
  };
}
