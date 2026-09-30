"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import type { Rendered } from "@/lib/cv/render";
import type { Template } from "@/lib/cv/templates";
import { measureFlow } from "@/lib/measure";
import { paginate, type Pagination } from "@/lib/paginate";

/* The proof: the CV set in an iframe with its own stylesheet, on a sheet the
   width of A4, with the page cuts drawn where Chrome will break the pages.

   CSS millimetres are exact (1mm = 96/25.4 px), so the sheet is real size at
   100% and the fit zoom only scales it down. The iframe is sandboxed without
   scripts and takes no pointer events: clicks land on the sheet around it,
   which looks up what was clicked and opens its field. */

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
    the pick outline has to be light to show. */
function onDark(element: Element): boolean {
  const color = element.ownerDocument.defaultView?.getComputedStyle(element).color ?? "";
  const [r = 0, g = 0, b = 0] = color.match(/[\d.]+/g)?.map(Number) ?? [];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 150;
}

export default function Proof({
  rendered,
  template,
  zoom,
  photoOverride,
  onMeasure,
  onPick,
}: {
  rendered: Rendered;
  template: Template;
  zoom: "fit" | "actual";
  photoOverride: string | null;
  onMeasure: (measure: Measure) => void;
  onPick: (path: string) => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLElement>(null);
  const painted = useRef({ css: "", body: "", lang: "" });
  const [loaded, setLoaded] = useState(false);
  const [height, setHeight] = useState(PAGE_MM * PX_PER_MM);
  const [cuts, setCuts] = useState<number[]>([]);
  const [flags, setFlags] = useState<(Box & { title: string })[]>([]);
  const [scale, setScale] = useState(1);
  const [hover, setHover] = useState<(Box & { dark: boolean }) | null>(null);

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
  useLayoutEffect(() => {
    onMeasureRef.current = onMeasure;
    templateRef.current = template;
  });

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
    const galley = tpl.flow
      ? flow.start + layout.count * flow.page + flow.padBottom
      : layout.count * flow.page;
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
            title: `“${last.text}” ends page ${index + 1} with nothing under it`,
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
      summaryLines:
        summary && lineHeight ? Math.round(summary.getBoundingClientRect().height / lineHeight) : null,
    });
  }, []);

  const applyPhoto = useCallback(() => {
    const doc = frame.current?.contentDocument;
    if (!doc || !photoOverride) return;
    doc.querySelectorAll<HTMLImageElement>('img[data-edit="photo"]').forEach(img => {
      if (img.src !== photoOverride) img.src = photoOverride;
    });
  }, [photoOverride]);

  /* Paint the CV into the frame, then measure once its fonts are in. A short
     wait lets a run of keystrokes paint once. */
  useEffect(() => {
    if (!loaded) return;
    const timer = window.setTimeout(() => {
      const doc = frame.current?.contentDocument;
      if (!doc?.body) return;
      const done = painted.current;
      if (done.lang !== rendered.lang) doc.documentElement.lang = done.lang = rendered.lang;
      if (done.css !== rendered.css) {
        const style = doc.getElementById("tpl");
        if (style) style.textContent = done.css = rendered.css;
      }
      if (done.body !== rendered.body) doc.body.innerHTML = done.body = rendered.body;
      applyPhoto();
      void doc.body.offsetHeight; // starts the font loads this layout needs
      doc.fonts.ready.then(() => requestAnimationFrame(measure));
    }, 70);
    return () => window.clearTimeout(timer);
  }, [loaded, rendered, measure, applyPhoto]);

  useEffect(applyPhoto, [applyPhoto]);

  /* A font that lands late moves lines; measure again when it does. */
  useEffect(() => {
    const doc = frame.current?.contentDocument;
    if (!loaded || !doc) return;
    const again = () => requestAnimationFrame(measure);
    doc.fonts.addEventListener("loadingdone", again);
    return () => doc.fonts.removeEventListener("loadingdone", again);
  }, [loaded, measure]);

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
    if (!element || !doc) return null;
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
    <main className="stage" ref={stage} id="preview" aria-label="Preview" tabIndex={-1}>
      <div className="stage-inner">
        <div style={{ width: sheetWidth * scale, height: sheetHeight * scale }}>
          <div className="zoomer" style={{ width: sheetWidth, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
            <div
              className="sheet-wrap"
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
                  title="CV preview"
                  srcDoc={SKELETON}
                  sandbox="allow-same-origin"
                  tabIndex={-1}
                  onLoad={() => {
                    painted.current = { css: "", body: "", lang: "" };
                    setLoaded(true);
                  }}
                  style={{ width: innerWidth, height, pointerEvents: "none" }}
                />
              </div>
              {cuts.map((top, index) => (
                <div key={index} className="cut" style={{ top }}>
                  <span>cut · page {index + 2} starts</span>
                </div>
              ))}
              {flags.map((flag, index) => (
                <div
                  key={index}
                  className="orphan-flag"
                  title={flag.title}
                  style={{ top: flag.top, height: flag.height }}
                />
              ))}
              {hover && (
                <div
                  className={"pick" + (hover.dark ? " on-dark" : "")}
                  aria-hidden="true"
                  style={{ top: hover.top - 2, left: hover.left - 3, width: hover.width + 6, height: hover.height + 4 }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
