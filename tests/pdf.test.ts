import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PDFDocument } from "pdf-lib";
import { afterAll, describe, expect, it } from "vitest";
import { duplicate } from "@/lib/cv/defaults";
import { sampleCv } from "@/lib/cv/sample";
import { getBrowser } from "@/lib/server/chrome";
import { makePdf } from "@/lib/server/pdf";

/* The PDF route end to end, against a real Chrome. Skipped where there is
   none to start. pdftotext (poppler) reads the text back when it is there. */

const hasChrome = await getBrowser()
  .then(() => true)
  .catch(() => false);

function pdftotext(bytes: Uint8Array, layout = false): string | null {
  const dir = mkdtempSync(join(tmpdir(), "cv-editor-"));
  const file = join(dir, "cv.pdf");
  writeFileSync(file, bytes);
  try {
    return execFileSync("pdftotext", [...(layout ? ["-layout"] : []), file, "-"], { encoding: "utf8" });
  } catch {
    return null;
  }
}

describe.skipIf(!hasChrome)("makePdf", () => {
  afterAll(async () => {
    const browser = await getBrowser().catch(() => null);
    await browser?.close();
  });

  it("prints the sample on one page with its own metadata", async () => {
    const made = await makePdf(sampleCv(), null);
    expect(made.name).toBe("Alex_Moreno_CV.pdf");
    expect(made.pages).toBe(1);

    const doc = await PDFDocument.load(made.bytes, { updateMetadata: false });
    expect(doc.getTitle()).toBe("Alex Moreno - Senior Frontend Engineer CV");
    expect(doc.getAuthor()).toBe("Alex Moreno");
    expect(doc.getProducer()).toBe("Alex Moreno");
    expect(doc.getKeywords()).toContain("TypeScript");

    const text = pdftotext(made.bytes);
    if (text !== null) {
      for (const words of ["Alex Moreno", "Northwind Commerce", "Led the rebuild of the checkout", "WCAG 2.1 AA"]) {
        expect(text).toContain(words);
      }
      // Ligatures stay off, so "workflows"-style words extract as plain letters.
      expect(text).not.toMatch(/[ﬀ-ﬆ]/);
    }
  });

  it("prints Classic in one column across two pages at most", async () => {
    const cv = duplicate(sampleCv(), "Classic");
    cv.template = "classic";
    const made = await makePdf(cv, null);
    expect(made.pages).toBeLessThanOrEqual(2);
    const text = pdftotext(made.bytes);
    if (text !== null) {
      expect(text.indexOf("Experience")).toBeLessThan(text.indexOf("Education"));
    }
  });

  it("drops markup the templates do not allow", async () => {
    const cv = sampleCv();
    cv.summary = 'Hello <img src="https://example.com/x.png" onerror="alert(1)"><script>alert(2)</script>world';
    const made = await makePdf(cv, null);
    const text = pdftotext(made.bytes);
    if (text !== null) {
      expect(text).toContain("Hello world");
      expect(text).not.toContain("alert");
    }
  });
});
