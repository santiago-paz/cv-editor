"use client";

import type { Template } from "@/lib/cv/templates";
import { useT } from "./i18n";
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
  const t = useT();
  if (example) {
    return (
      <div className="meter-pill example" role="status">
        <span className="dot" aria-hidden="true" />
        {t.meter.example}
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
    ? t.meter.measuring
    : over
      ? t.meter.over(pages, pages - template.pages)
      : pages === 1
        ? t.meter.one(fill)
        : t.meter.many(pages, fill);

  /* Said aloud only when the page count changes, not with every keystroke that
     moves the percentage. */
  const spoken = !measure
    ? ""
    : over
      ? t.meter.over(pages, pages - template.pages)
      : pages === 1
        ? t.meter.spokenOne
        : t.meter.spokenMany(pages);

  return (
    <Popover
      label={t.meter.label}
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
            <span>{t.meter.pages}</span>
            <b className={over ? "bad" : "ok"}>{measure ? (over ? t.meter.overBy(pages, pages - template.pages) : pages) : "-"}</b>
          </div>
          <p className="menu-note">
            {template.pages === 1
              ? t.meter.meantForOne(t.templates[template.id].name)
              : t.meter.meantForUpTo(t.templates[template.id].name, template.pages)}
          </p>
          <div className="meter-row">
            <span>{measure ? t.meter.page(pages) : t.meter.lastPage}</span>
            <b className={fillTone}>{measure ? t.meter.full(fill) : "-"}</b>
          </div>
          <div className={"bar " + fillTone} aria-hidden="true">
            <i style={{ transform: `scaleX(${Math.min(1, fill / 100)})` }} />
          </div>
          {measure && pages > 1 && (
            <>
              <div className="meter-row">
                <span>{t.meter.emptyAtCut}</span>
                <b className={wasteTone}>{measure.worstDead < 1 ? t.meter.none : t.meter.mm(Math.round(measure.worstDead))}</b>
              </div>
              <p className="menu-note">{t.meter.emptyNote}</p>
            </>
          )}
          {measure?.stranded && <p className="menu-note warn">{t.meter.stranded}</p>}
        </>
      )}
    </Popover>
  );
}
