"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import type { Rendered } from "@/lib/cv/render";
import type { Template } from "@/lib/cv/templates";
import { measureFlow } from "@/lib/measure";
import { paginate, type Pagination } from "@/lib/paginate";
import { PHOTO, glide, left, movable, moving, printsPhoto } from "@/lib/photo-motion";
import { useT } from "./i18n";

/* The stage: the CV set in an iframe with its own stylesheet, on a sheet the
   width of A4, with the page cuts drawn where Chrome will break the pages.

   CSS millimetres are exact (1mm = 96/25.4 px), so the sheet is real size at
   100% and the fit zoom only scales it down. The iframe is sandboxed without
   scripts and takes no pointer events: clicks land on the sheet around it,
   which looks up what was clicked and opens its field.

   The other way round, the box that has focus in the writing panel is marked
   on the sheet with a highlighter stroke, line by line, and the sheet scrolls
   to keep it in view. So what you type always shows where it lands.

   When the photo is switched on or off, its room opens or shuts and the copy
   glides to its new place, where it would otherwise jump. */

export const PX_PER_MM = 96 / 25.4;
const SHEET_MM = 210;
const PAGE_MM = 297;

/* Proof-only rules. The band fills the whole galley rather than one page,
   as it does on every printed page. */
const PROOF_CSS = "html{background:#fff}html,body{overflow:hidden}.band{height:100%!important}";
const SKELETON =
  '<!DOCTYPE html><html translate="no"><head><meta charset="utf-8"><style id="tpl"></style>' +
  `<style>${PROOF_CSS}</style></head><body></body></html>`;

export interface Measure extends Pagination {
  /** The most paper left empty at the foot of a page, in mm. */
  worstDead: number;
  /** A heading ends a page with nothing under it. */
  stranded: boolean;
  summaryLines: number | null;
}

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** True when an element's text is light. It then sits on a dark band, where
    the marker has to be light to show. */
function onDark(element: Element): boolean {
  const color = element.ownerDocument.defaultView?.getComputedStyle(element).color ?? "";
  const [r = 0, g = 0, b = 0] = color.match(/[\d.]+/g)?.map(Number) ?? [];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 150;
}

const quote = (value: string) => value.replace(/["\\]/g, "\\$&");

/** The printed element for a field path, or the nearest one above it: a job's
    empty title is not printed, so its job is marked instead. */
function printedFor(doc: Document, path: string): HTMLElement | null {
  const parts = path.split(".");
  while (parts.length) {
    const found = doc.querySelector<HTMLElement>(`[data-edit="${quote(parts.join("."))}"]`);
    if (found) return found;
    parts.pop();
  }
  return null;
}

/** One box per printed line of the element's text, so the marker lies on the
    words like a highlighter and not over the whole block. An element with no
    text, such as the photo, is marked as a whole. */
function lineBoxes(element: HTMLElement): Box[] {
  const doc = element.ownerDocument;
  const rects: DOMRect[] = [];
  const walker = doc.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue;
    const range = doc.createRange();
    range.selectNodeContents(node);
    for (const rect of Array.from(range.getClientRects())) if (rect.width > 1 && rect.height > 1) rects.push(rect);
  }
  if (!rects.length) {
    const rect = element.getBoundingClientRect();
    if (rect.width <= 1) return [];
    // A block with nothing in it yet, such as a new job: a short bar where its first line will go.
    if (rect.height < 4) return [{ top: rect.top - 1, left: rect.left, width: Math.min(rect.width, 160), height: 3 }];
    return [{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }];
  }
  rects.sort((a, b) => a.top - b.top || a.left - b.left);
  const lines: Box[] = [];
  for (const rect of rects) {
    const last = lines[lines.length - 1];
    if (last && Math.abs(rect.top - last.top) < Math.min(rect.height, last.height) * 0.6) {
      const right = Math.max(last.left + last.width, rect.right);
      const bottom = Math.max(last.top + last.height, rect.bottom);
      last.left = Math.min(last.left, rect.left);
      last.width = right - last.left;
      last.top = Math.min(last.top, rect.top);
      last.height = bottom - last.top;
    } else lines.push({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
  }
  return lines;
}

export default function Stage({
  rendered,
  template,
  zoom,
  photoOverride,
  focusPath,
  docId,
  example,
  onMeasure,
  onPick,
}: {
  rendered: Rendered;
  template: Template;
  zoom: "fit" | "actual";
  photoOverride: string | null;
  /** The field that has focus in the writing panel. */
  focusPath: string | null;
  /** Which CV is on the sheet. A photo that comes or goes in the same CV
      glides; another CV is painted in one go. */
  docId: string;
  /** The sheet shows an example, not the person's own CV: no click to edit. */
  example: boolean;
  onMeasure: (measure: Measure) => void;
  onPick: (path: string) => void;
}) {
  const t = useT();
  const frame = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const painted = useRef({ css: "", body: "", lang: "", doc: "" });
  const following = useRef<Animation | null>(null);
  const docKey = `${docId}|${example}`;
  const [loaded, setLoaded] = useState(false);
  const [height, setHeight] = useState(PAGE_MM * PX_PER_MM);
  const [cuts, setCuts] = useState<number[]>([]);
  const [flags, setFlags] = useState<(Box & { text: string; page: number })[]>([]);
  const [scale, setScale] = useState(1);
  const [hover, setHover] = useState<(Box & { dark: boolean }) | null>(null);
  const [marks, setMarks] = useState<{ boxes: Box[]; dark: boolean; key: number }>({ boxes: [], dark: false, key: 0 });

  const margin = {
    top: template.margin.top * PX_PER_MM,
    right: template.margin.right * PX_PER_MM,
    bottom: template.margin.bottom * PX_PER_MM,
    left: template.margin.left * PX_PER_MM,
  };
  const sheetWidth = SHEET_MM * PX_PER_MM;
  const innerWidth = sheetWidth - margin.left - margin.right;
  const sheetHeight = margin.top + height + margin.bottom;

  const onMeasureRef = useRef(onMeasure);
  const templateRef = useRef(template);
  const pathRef = useRef(focusPath);
  const marginRef = useRef(margin);
  useLayoutEffect(() => {
    onMeasureRef.current = onMeasure;
    templateRef.current = template;
    pathRef.current = focusPath;
    marginRef.current = margin;
  });

  /* Marks the printed line of the box that has focus. */
  const light = useCallback((reveal: boolean) => {
    const doc = frame.current?.contentDocument;
    const path = pathRef.current;
    if (!doc?.body || !path) {
      setMarks(current => (current.boxes.length ? { boxes: [], dark: false, key: current.key } : current));
      return;
    }
    const element = printedFor(doc, path);
    if (!element) {
      setMarks(current => (current.boxes.length ? { boxes: [], dark: false, key: current.key } : current));
      return;
    }
    const at = marginRef.current;
    const boxes = lineBoxes(element).map(box => ({
      top: at.top + box.top,
      left: at.left + box.left,
      width: box.width,
      height: box.height,
    }));
    setMarks(current => ({ boxes, dark: onDark(element), key: reveal ? current.key + 1 : current.key }));
    if (reveal) {
      requestAnimationFrame(() =>
        stage.current?.querySelector<HTMLElement>(".lit")?.scrollIntoView({
          block: "nearest",
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        }),
      );
    }
  }, []);

  const measure = useCallback(() => {
    const element = frame.current;
    const doc = element?.contentDocument;
    if (!element || !doc?.body || !element.getClientRects().length) return;
    const tpl = templateRef.current;

    /* With the frame collapsed, scrollHeight is the copy's own height and not
       the frame's. */
    element.style.height = "0px";
    const flow = measureFlow(doc, {
      flow: tpl.flow,
      spacers: tpl.spacers,
      marginTop: tpl.margin.top,
      marginBottom: tpl.margin.bottom,
    });
    const layout = paginate(flow.blocks, flow.start, flow.end, flow.page);

    /* The galley runs to the foot of the last page, so the space left on it
       shows. */
    const galley = tpl.flow ? flow.start + layout.count * flow.page + flow.padBottom : layout.count * flow.page;
    const total = Math.max(flow.content, galley);
    element.style.height = total + "px";
    setHeight(total);

    const offset = tpl.margin.top * PX_PER_MM;
    setCuts(layout.cuts.map(cut => offset + cut.at));
    setFlags(
      layout.cuts.flatMap((cut, index) => {
        const last = flow.blocks[cut.last];
        if (!last?.heading) return [];
        return [
          {
            top: offset + last.top,
            left: 0,
            width: 6,
            height: Math.max(last.height, 10),
            text: last.text,
            page: index + 1,
          },
        ];
      }),
    );

    const summary = doc.querySelector("p.summary");
    const lineHeight = summary ? parseFloat(getComputedStyle(summary).lineHeight) : 0;

    onMeasureRef.current({
      ...layout,
      worstDead: Math.max(0, ...layout.cuts.map(cut => cut.dead)) / PX_PER_MM,
      stranded: layout.cuts.some(cut => flow.blocks[cut.last]?.heading),
      summaryLines: summary && lineHeight ? Math.round(summary.getBoundingClientRect().height / lineHeight) : null,
    });
    light(false);
  }, [light]);

  const applyPhoto = useCallback(() => {
    const doc = frame.current?.contentDocument;
    if (!doc || !photoOverride) return;
    doc.querySelectorAll<HTMLImageElement>(PHOTO).forEach(img => {
      if (img.src !== photoOverride) img.src = photoOverride;
    });
  }, [photoOverride]);

  /* While the photo's room moves, the words move with it. The marker keeps to
     the words it is on, drawn in the frame it is read in: left to React's
     usual timing it would trail the words by a frame. When the room has
     settled the sheet is measured again, because a header that grew or shrank
     can shift a page cut. */
  const follow = useCallback(
    (move: Animation) => {
      if (following.current === move) return;
      following.current = move;
      const tick = () => {
        flushSync(() => light(false));
        if (move.playState === "running") requestAnimationFrame(tick);
        else if (move.playState === "finished") requestAnimationFrame(measure);
      };
      requestAnimationFrame(tick);
    },
    [light, measure],
  );

  /* Paint the CV into the frame, then measure once its fonts are in. A short
     wait lets a run of keystrokes paint once.

     A photo that comes or goes in the CV already on the sheet is the one
     change that is played. One that comes is painted, then its room opens.
     One that goes keeps the old copy up until its room has shut, and the new
     copy replaces it then, so the copy never jumps. Anything else that moves
     the photo with it, another CV or another template, is painted as it is. */
  useEffect(() => {
    if (!loaded) return;
    let swap = 0;
    const timer = window.setTimeout(() => {
      const element = frame.current;
      const doc = element?.contentDocument;
      if (!element || !doc?.body) return;
      const done = painted.current;

      const paint = () => {
        if (done.lang !== rendered.lang) doc.documentElement.lang = done.lang = rendered.lang;
        if (done.css !== rendered.css) {
          const style = doc.getElementById("tpl");
          if (style) style.textContent = done.css = rendered.css;
        }
        if (done.body !== rendered.body) doc.body.innerHTML = done.body = rendered.body;
        done.doc = docKey;
        applyPhoto();
        void doc.body.offsetHeight; // starts the font loads this layout needs
        doc.fonts.ready.then(() => requestAnimationFrame(measure));
      };

      const same = done.doc === docKey && done.body !== "" && done.css === rendered.css && movable(element);
      const photo = doc.querySelector<HTMLImageElement>(PHOTO);
      if (same && photo && !printsPhoto(rendered.body)) {
        const shutting = glide(photo, "close");
        follow(shutting);
        swap = window.setTimeout(paint, left(shutting));
        return;
      }
      /* The photo was on its way out and is wanted again: open the room from
         where it has got to. */
      if (same && photo && moving(photo)?.id === "close") follow(glide(photo, "open"));
      paint();
      const arrived = same && !photo ? doc.querySelector<HTMLImageElement>(PHOTO) : null;
      if (arrived) follow(glide(arrived, "open"));
    }, 70);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(swap);
    };
  }, [loaded, rendered, docKey, measure, applyPhoto, follow]);

  useEffect(applyPhoto, [applyPhoto]);

  /* A font that lands late moves lines; measure again when it does. */
  useEffect(() => {
    const doc = frame.current?.contentDocument;
    if (!loaded || !doc) return;
    const again = () => requestAnimationFrame(measure);
    doc.fonts.addEventListener("loadingdone", again);
    return () => doc.fonts.removeEventListener("loadingdone", again);
  }, [loaded, measure]);

  /* The marker moves when the focus does, and the sheet scrolls to it. */
  useEffect(() => {
    if (!loaded) return;
    const frameId = requestAnimationFrame(() => light(true));
    return () => cancelAnimationFrame(frameId);
  }, [focusPath, loaded, light]);

  useLayoutEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const available = element.clientWidth - 48;
      setScale(zoom === "fit" ? Math.max(0.3, Math.min(1, available / sheetWidth)) : 1);
      requestAnimationFrame(measure);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [zoom, sheetWidth, measure]);

  /* What sits under the pointer, as the element carrying its field path.
     Every element at the point is checked, not just the top one: the Sidebar
     template's rail sits under the body so it prints behind every page, and
     the top element there is the body. */
  function target(event: MouseEvent): { path: string; box: Box & { dark: boolean } } | null {
    const element = frame.current;
    const doc = element?.contentDocument;
    if (!element || !doc || example) return null;
    const r = element.getBoundingClientRect();
    const x = (event.clientX - r.left) / scale;
    const y = (event.clientY - r.top) / scale;
    if (x < 0 || y < 0 || x > innerWidth || y > height) return null;
    const hit = doc
      .elementsFromPoint(x, y)
      .map(found => found.closest<HTMLElement>("[data-edit]"))
      .find(found => found !== null);
    if (!hit) return null;
    const box = hit.getBoundingClientRect();
    return {
      path: hit.dataset.edit || "",
      box: {
        top: margin.top + box.top,
        left: margin.left + box.left,
        width: box.width,
        height: box.height,
        dark: onDark(hit),
      },
    };
  }

  return (
    <div className="stage" ref={stage} id="preview" role="region" aria-label={t.stage.previewLabel} tabIndex={-1}>
      <div className="stage-inner">
        <div style={{ width: sheetWidth * scale, height: sheetHeight * scale }}>
          <div className="zoomer" style={{ width: sheetWidth, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
            <div
              className={"sheet-wrap" + (example ? " example" : "")}
              style={{ cursor: hover ? "pointer" : "default" }}
              onMouseMove={event => setHover(target(event)?.box ?? null)}
              onMouseLeave={() => setHover(null)}
              onClick={event => {
                const hit = target(event);
                if (hit?.path) onPick(hit.path);
              }}
            >
              <div
                className="sheet"
                style={{ padding: `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px` }}
              >
                <iframe
                  ref={frame}
                  title={t.stage.frameTitle}
                  srcDoc={SKELETON}
                  sandbox="allow-same-origin"
                  tabIndex={-1}
                  onLoad={() => {
                    painted.current = { css: "", body: "", lang: "", doc: "" };
                    setLoaded(true);
                  }}
                  style={{ width: innerWidth, height, pointerEvents: "none" }}
                />
              </div>
              {!example &&
                cuts.map((top, index) => (
                  <div key={index} className="cut" style={{ top }}>
                    <span>{t.stage.pageStarts(index + 2)}</span>
                  </div>
                ))}
              {!example &&
                flags.map((flag, index) => (
                  <div
                    key={index}
                    className="orphan-flag"
                    title={t.stage.stranded(flag.text, flag.page)}
                    style={{ top: flag.top, height: flag.height }}
                  />
                ))}
              {!example && hover && (
                <div
                  className={"pick" + (hover.dark ? " on-dark" : "")}
                  aria-hidden="true"
                  style={{ top: hover.top - 2, left: hover.left - 3, width: hover.width + 6, height: hover.height + 4 }}
                />
              )}
              {!example &&
                marks.boxes.map((box, index) => (
                  <div
                    key={`${marks.key}-${index}`}
                    className={"lit" + (marks.dark ? " on-dark" : "")}
                    aria-hidden="true"
                    style={{
                      top: box.top - 1,
                      left: box.left - 3,
                      width: box.width + 6,
                      height: box.height + 2,
                      animationDelay: `${Math.min(index, 6) * 35}ms`,
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
