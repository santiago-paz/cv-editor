import { documentHtml, renderCv } from "./cv/render";
import type { Cv } from "./cv/types";

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

/** Asks the server to print the CV and returns the PDF. Throws with a message
    fit to show when it cannot. */
export async function fetchPdf(cv: Cv, photo: string | null): Promise<Blob> {
  let response: Response;
  try {
    response = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cv, photo: cv.showPhoto ? photo : null }),
    });
  } catch {
    throw new Error("Could not reach the server to make the PDF.");
  }
  /* Vercel's firewall allows each address 20 PDFs a minute, and answers the
     rest itself, with no JSON. */
  if (response.status === 429) {
    throw new Error("Too many PDFs came from this network in the last minute. Wait a minute, then try again.");
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `The server could not make the PDF (error ${response.status}).`);
  }
  return response.blob();
}

/* The fallback when the server cannot print: the browser's own print dialog,
   on a hidden frame holding only the CV. Choose "Save as PDF" there. */
export function printCv(cv: Cv, photo: string | null): void {
  const frame = document.createElement("iframe");
  frame.setAttribute("sandbox", "allow-same-origin allow-modals");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  frame.srcdoc = documentHtml(renderCv(cv, { photo }));
  frame.onload = () => {
    const view = frame.contentWindow;
    if (!view) return;
    void view.document.fonts.ready.then(() => {
      view.focus();
      view.print();
      window.setTimeout(() => frame.remove(), 1000);
    });
  };
  document.body.append(frame);
}
