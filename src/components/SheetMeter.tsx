"use client";

import type { Template } from "@/lib/cv/templates";
import type { Measure } from "./Stage";
import { Icon } from "./icons";
import { Popover } from "./ui/Popover";

/* The page gauges, folded into one small pill at the foot of the stage. It
   says how many pages the CV takes and how full the last one is, and turns
   amber when the CV runs past what its layout is meant for. A click opens the
   detail: the paper left empty at a page cut, and a heading left alone at the
   foot of a page. */

export default function SheetMeter({
  measure,
  template,
  example,
}: {
  measure: Measure | null;
  template: Template;
  example: boolean;
}) {
  if (example) {
    return (
      <div className="meter-pill example" role="status">
        <span className="dot" aria-hidden="true" />
        Example. Your CV appears here as you type.
      </div>
    );
  }

  const pages = measure?.count ?? 0;
  const over = pages > template.pages;
  const fill = measure ? Math.round(measure.lastFill * 100) : 0;
  const fillTone = !measure ? "" : measure.lastFill > 0.94 ? "bad" : measure.lastFill > 0.86 ? "warn" : "ok";
  const wasteTone = !measure ? "" : measure.stranded || measure.worstDead > 25 ? "warn" : "ok";
  const tone = !measure ? "idle" : over ? "bad" : measure.stranded || fillTone === "bad" ? "warn" : "ok";

  const summary = !measure
    ? "Measuring…"
    : over
      ? `${pages} pages, ${pages - template.pages} over`
      : pages === 1
        ? `1 page, ${fill}% full`
        : `${pages} pages, last ${fill}% full`;

  /* Said aloud only when the page count changes, not with every keystroke that
     moves the percentage. */
  const spoken = !measure ? "" : over ? `${pages} pages, ${pages - template.pages} over` : pages === 1 ? "1 page" : `${pages} pages`;

  return (
    <Popover
      label="Page details"
      className="menu-meter"
      trigger={({ toggle, ref, open, panelId }) => (
        <>
          <button
            ref={ref}
            type="button"
            className={"meter-pill " + tone}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
            onClick={toggle}
          >
            <span className="dot" aria-hidden="true" />
            <span>{summary}</span>
            <Icon name="down" size={13} />
          </button>
          <span className="sr-only" role="status">
            {spoken}
          </span>
        </>
      )}
    >
      {() => (
        <>
          <div className="meter-row">
            <span>Pages</span>
            <b className={over ? "bad" : "ok"}>{measure ? (over ? `${pages}, over by ${pages - template.pages}` : pages) : "-"}</b>
          </div>
          <p className="menu-note">
            {template.name} is meant for {template.pages === 1 ? "one page" : `up to ${template.pages} pages`}.
          </p>
          <div className="meter-row">
            <span>{measure ? `Page ${pages}` : "Last page"}</span>
            <b className={fillTone}>{measure ? `${fill}% full` : "-"}</b>
          </div>
          <div className={"bar " + fillTone} aria-hidden="true">
            <i style={{ transform: `scaleX(${Math.min(1, fill / 100)})` }} />
          </div>
          {measure && pages > 1 && (
            <>
              <div className="meter-row">
                <span>Empty at a cut</span>
                <b className={wasteTone}>{measure.worstDead < 1 ? "none" : `${Math.round(measure.worstDead)}\u00a0mm`}</b>
              </div>
              <p className="menu-note">Paper left empty at the foot of a page because the next entry did not fit.</p>
            </>
          )}
          {measure?.stranded && (
            <p className="menu-note warn">A heading ends a page with nothing under it. Look for the amber mark on the sheet.</p>
          )}
        </>
      )}
    </Popover>
  );
}
