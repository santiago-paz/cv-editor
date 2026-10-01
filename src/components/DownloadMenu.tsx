"use client";

import type { Ref } from "react";
import { inChromium, type PdfWay } from "@/lib/download";
import { Icon, Key, type IconName } from "./icons";
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

const WAYS: Record<PdfWay, { icon: IconName; title: string; hint: string; fact: string; stays: boolean }> = {
  print: {
    icon: "print",
    title: "Save as PDF",
    hint: "Opens your browser's print dialog. Choose Save as PDF there. The file has no author or keywords.",
    fact: "Your CV never leaves this device.",
    stays: true,
  },
  file: {
    icon: "download",
    title: "Download a PDF file",
    hint: "You get the file in one click. Our server prints your CV with Chrome and sends the PDF back. The file has your name as author and your skills as keywords.",
    fact: "Your CV goes to our server. It keeps no copy.",
    stays: false,
  },
};

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
  const { way, busy } = pdf;
  const printing = way === "print";

  /* Printing is only as good as the browser's own print. Phones and tablets
     can print the wrong thing, and browsers other than Chrome are untested. */
  const caution = !printing
    ? "Phones and tablets may print the whole page, not just the CV."
    : inChromium()
      ? ""
      : "Page breaks are tested in Chrome. Check them in the dialog's preview.";

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
        aria-label={busy ? "Making the PDF" : printing ? "Save as PDF" : "Download PDF"}
        aria-keyshortcuts={printing ? "Control+P Meta+P" : undefined}
        title={
          busy
            ? undefined
            : printing
              ? "Opens your browser's print dialog. Your CV stays on this device."
              : "Downloads a PDF file made on our server."
        }
      >
        <Icon name="download" />
        {busy ? (
          <span className="hide-tiny btn-label">Making the PDF…</span>
        ) : printing ? (
          <span className="hide-tiny btn-label">
            <span className="hide-narrow">Save as </span>PDF
          </span>
        ) : (
          <span className="hide-tiny btn-label" data-more=" PDF">
            Download
          </span>
        )}
      </button>

      <Popover
        label="Ways to get the PDF"
        align="end"
        menu
        className="menu-ways"
        trigger={({ toggle, ref, open, panelId }) => (
          <button
            ref={ref}
            type="button"
            className="btn primary split-caret"
            aria-label="More ways to get the PDF"
            title="More ways to get the PDF"
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
                    {id === way && <span className="way-tag">Default</span>}
                    {id === "print" && (
                      <span className="keys">
                        <Key>{modKey()}</Key>
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
