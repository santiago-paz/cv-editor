import { documentHtml, fileName, renderCv } from "./cv/render";
import type { Cv } from "./cv/types";
import { PdfError } from "./errors";

/* There are two ways to get the PDF.

   "print" is the browser's own print dialog. The browser makes the file, so
   the CV never leaves the device. The file has no author or keywords, and its
   page breaks are the browser's own.

   "file" asks the server to print the CV with Chrome and send the PDF back.
   It takes one click, the metadata is set and the page breaks are the ones
   the tests check, but the CV goes over the network once. */
export type PdfWay = "print" | "file";

/** The way the main button takes. A phone or a tablet gets the file, because
    its browser tends to print the page around a hidden frame instead of the
    frame. */
export function defaultWay(): PdfWay {
  const touch =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  return touch ? "file" : "print";
}

/** Chrome, Edge and the other browsers built on Chromium. The page breaks are
    tested in those. Only they have `userAgentData`. */
export function inChromium(): boolean {
  return typeof navigator !== "undefined" && "userAgentData" in navigator;
}

/** Hands a file to the browser's downloads. */
export function saveBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** Asks the server to print the CV and returns the PDF. Throws a PdfError, with
    a message fit to show, when it cannot. */
export async function fetchPdf(cv: Cv, photo: string | null): Promise<Blob> {
  let response: Response;
  try {
    response = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cv, photo: cv.showPhoto ? photo : null }),
    });
  } catch {
    throw new PdfError("unreachable", "Could not reach the server to make the PDF.");
  }
  /* Vercel's firewall allows each address 20 PDFs a minute and answers the
     rest itself, before the route runs. */
  if (response.status === 429) {
    throw new PdfError(
      "rateLimit",
      "Too many PDFs came from this network in the last minute. Wait a minute, then try again.",
      429,
    );
  }
  if (!response.ok) {
    /* The route puts a message in "error" and a name for it in "code". Vercel's
       own replies put an object in "error", which is no use to show. */
    const body = (await response.json().catch(() => null)) as { error?: unknown; code?: unknown } | null;
    const message = typeof body?.error === "string" ? body.error : "";
    if (!message) {
      throw new PdfError("status", `The server could not make the PDF (error ${response.status}).`, response.status);
    }
    throw new PdfError(typeof body?.code === "string" ? body.code : "server", message, response.status);
  }
  return response.blob();
}

/* One print at a time: a second click while the first is open joins it. */
let printing: Promise<void> | null = null;

/** How long the fonts get to load before the dialog opens anyway. */
const FONTS_MS = 5000;
/** How long the frame gets to load before the print gives up. */
const FRAME_MS = 15_000;

/** Opens the browser's print dialog on a hidden frame that holds only the CV.
    The person chooses "Save as PDF" there, and nothing is sent anywhere.

    It settles when the dialog has closed. The browser does not say whether a
    file was saved. It rejects when the dialog could not open. */
export function printCv(cv: Cv, photo: string | null): Promise<void> {
  printing ??= new Promise<void>((resolve, reject) => {
    const rendered = renderCv(cv, { photo });
    const frame = document.createElement("iframe");
    frame.setAttribute("sandbox", "allow-same-origin allow-modals");
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
    frame.srcdoc = documentHtml(rendered);

    const tab = document.title;
    let settled = false;
    const settle = (error?: unknown) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(watchdog);
      document.title = tab;
      frame.remove();
      if (error === undefined) resolve();
      else reject(error);
    };
    const watchdog = window.setTimeout(() => settle(new Error("The print frame did not load.")), FRAME_MS);

    frame.onload = () => {
      const view = frame.contentWindow;
      if (!view?.document.body?.firstElementChild) return;
      const fonts = view.document.fonts?.ready ?? Promise.resolve();
      let patience = 0;
      const late = new Promise(done => {
        patience = window.setTimeout(done, FONTS_MS);
      });
      void Promise.race([fonts, late]).then(() => {
        window.clearTimeout(patience);
        window.clearTimeout(watchdog);
        try {
          /* Chrome suggests the page's title as the file name, and the page is
             the tab's, not the frame's. So the page wears the file's name
             while the dialog is open. */
          document.title = fileName(cv).replace(/\.pdf$/i, "");
          view.focus();
          /* Chrome stops here until the dialog closes. A browser that goes on
             at once gets a second to show it before the frame goes. */
          view.print();
        } catch (error) {
          settle(error);
          return;
        }
        window.setTimeout(settle, 1000);
      });
    };

    document.body.append(frame);
  }).finally(() => {
    printing = null;
  });
  return printing;
}
