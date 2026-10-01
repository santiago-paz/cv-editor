"use client";

import type { Ref } from "react";
import { inChromium, type PdfWay } from "@/lib/download";
import { useT } from "./i18n";
import { Icon, Key } from "./icons";
import { Popover } from "./ui/Popover";
import { modKey } from "./ui/util";

/* The button that gets the PDF, with a menu beside it for the other way.

   There are two ways (see lib/download.ts). The main button takes the default
   one, so a person who never opens the menu never faces a choice. The menu
   says what each way does and where the CV goes, because that is the whole
   difference between them. */

/** What the editor hands over: the way the main button takes, whether the
    server is busy making a file, and what each way does. */
export interface PdfControls {
  way: PdfWay;
  busy: boolean;
  onPrint: () => void;
  onFile: () => void;
}

export default function DownloadMenu({
  pdf,
  disabled,
  buttonRef,
}: {
  pdf: PdfControls;
  /** There is no CV to print. */
  disabled?: boolean;
  /** Reaches the main button, for the flow that ends on it. */
  buttonRef?: Ref<HTMLButtonElement>;
}) {
  const t = useT();
  const { way, busy } = pdf;
  const printing = way === "print";

  const WAYS = {
    print: { icon: "print", stays: true, ...t.pdf.print },
    file: { icon: "download", stays: false, ...t.pdf.file },
  } as const;

  /* Printing is only as good as the browser's own print. Phones and tablets
     can print the wrong thing, and browsers other than Chrome are untested. */
  const caution = !printing ? t.pdf.cautionPhone : inChromium() ? "" : t.pdf.cautionBrowser;

  const order: PdfWay[] = printing ? ["print", "file"] : ["file", "print"];

  return (
    <div className="split">
      <button
        ref={buttonRef}
        type="button"
        className="btn primary split-main"
        onClick={busy ? undefined : printing ? pdf.onPrint : pdf.onFile}
        disabled={disabled}
        /* Busy is aria-disabled, not disabled: a disabled button drops the
           keyboard's place, and the person is left at the top of the page. */
        aria-disabled={busy || undefined}
        aria-label={busy ? t.pdf.making : printing ? t.pdf.print.title : t.pdf.fileLabel}
        aria-keyshortcuts={printing ? "Control+P Meta+P" : undefined}
        title={busy ? undefined : printing ? t.pdf.printTitle : t.pdf.fileTitle}
      >
        <Icon name="download" />
        {busy ? (
          <span className="hide-tiny btn-label">{t.pdf.making}</span>
        ) : printing ? (
          <span className="hide-tiny btn-label">
            <span className="hide-narrow">{t.pdf.printLead}</span>
            {t.pdf.printWord}
          </span>
        ) : (
          <span className="hide-tiny btn-label" data-more={t.pdf.fileMore}>
            {t.pdf.fileWord}
          </span>
        )}
      </button>

      <Popover
        label={t.pdf.menuLabel}
        align="end"
        menu
        className="menu-ways"
        trigger={({ toggle, ref, open, panelId }) => (
          <button
            ref={ref}
            type="button"
            className="btn primary split-caret"
            aria-label={t.pdf.moreLabel}
            title={t.pdf.moreLabel}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
            onClick={busy ? undefined : toggle}
            disabled={disabled}
            aria-disabled={busy || undefined}
          >
            <Icon name="down" size={14} />
          </button>
        )}
      >
        {({ close }) =>
          order.map(id => {
            const item = WAYS[id];
            return (
              <button
                key={id}
                type="button"
                role="menuitem"
                className="menu-item way"
                onClick={() => {
                  close();
                  (id === "print" ? pdf.onPrint : pdf.onFile)();
                }}
              >
                <Icon name={item.icon} />
                <span className="menu-text">
                  <span className="way-title">
                    {item.title}
                    {id === way && <span className="way-tag">{t.pdf.tagDefault}</span>}
                    {id === "print" && (
                      <span className="keys">
                        <Key>{modKey() === "⌘" ? "⌘" : t.common.ctrl}</Key>
                        <Key>P</Key>
                      </span>
                    )}
                  </span>
                  <small>{item.hint}</small>
                  {id === "print" && caution && <small className="way-caution">{caution}</small>}
                  <span className={"way-fact" + (item.stays ? " stays" : "")}>
                    <Icon name={item.stays ? "lock" : "server"} size={14} />
                    {item.fact}
                  </span>
                </span>
              </button>
            );
          })
        }
      </Popover>
    </div>
  );
}
