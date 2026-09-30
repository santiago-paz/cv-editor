import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PDFDocument } from "pdf-lib";
import { afterAll, describe, expect, it } from "vitest";
import { bullet, duplicate, role } from "@/lib/cv/defaults";
import { sampleCv } from "@/lib/cv/sample";
import { TEMPLATES } from "@/lib/cv/templates";
import type { Cv, TemplateId } from "@/lib/cv/types";
import { measureFlow, type FlowMeasure } from "@/lib/measure";
import { paginate } from "@/lib/paginate";
import { getBrowser } from "@/lib/server/chrome";
import { withCv } from "@/lib/server/pdf";

/* The preview promises that its cut lines fall where the PDF breaks. This
   holds it to that: the same CV is measured the way the preview measures it
   and then printed, and the page count and the first words of every page
   after the first must agree. */

const hasChrome = await getBrowser()
  .then(() => true)
  .catch(() => false);

const hasPoppler = (() => {
  try {
    execFileSync("pdftotext", ["-v"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

function pageText(bytes: Uint8Array, page: number): string {
  const dir = mkdtempSync(join(tmpdir(), "cv-editor-"));
  const file = join(dir, "cv.pdf");
  writeFileSync(file, bytes);
  return execFileSync("pdftotext", ["-f", String(page), "-l", String(page), file, "-"], { encoding: "utf8" });
}

/** The sample, grown by `extra` jobs of four bullets each. */
function longCv(template: TemplateId, extra: number): Cv {
  const cv = duplicate(sampleCv(), "Long");
  cv.template = template;
  const experience = cv.sections[0];
  if (experience.kind !== "roles") throw new Error("the sample starts with its jobs");
  for (let n = 0; n < extra; n++) {
    experience.items.push(
      role({
        title: `Engineer ${n + 1}`,
        org: `Company ${String.fromCharCode(65 + n)}`,
        dates: `Jan ${2010 - n} - Dec ${2011 - n}`,
        bullets: [
          bullet("Shipped a customer portal used by thousands of people each week, and kept it fast on slow phones."),
          bullet("Ran the move from a legacy stack to TypeScript without a freeze on new features."),
          bullet("Wrote the testing guide the team still uses, and paired with new hires on their first changes."),
          bullet("Cut the time from merge to production from a day to twenty minutes."),
        ],
      }),
    );
  }
  return cv;
}

async function measureAndPrint(cv: Cv) {
  const template = TEMPLATES[cv.template];
  return withCv(cv, null, async page => {
    /* The preview sets the CV in a frame as wide as the page's printable area. */
    const width = 210 - template.margin.left - template.margin.right;
    const flow: FlowMeasure = await page.evaluate(
      (source, spec, mm) => {
        document.body.style.width = `${mm}mm`;
        const measure = new Function(`return (${source})`)() as (doc: Document, s: unknown) => FlowMeasure;
        const result = measure(document, spec);
        document.body.style.width = "";
        return result;
      },
      measureFlow.toString(),
      {
        flow: template.flow,
        spacers: template.spacers,
        marginTop: template.margin.top,
        marginBottom: template.margin.bottom,
      },
      width,
    );
    const bytes = await page.pdf({ printBackground: true, preferCSSPageSize: true });
    const pages = (await PDFDocument.load(bytes)).getPageCount();
    return { flow, bytes, pages };
  });
}

describe.skipIf(!hasChrome)("the preview's page breaks", () => {
  afterAll(async () => {
    const browser = await getBrowser().catch(() => null);
    await browser?.close();
  });

  const cases: [TemplateId, number][] = [
    ["sidebar", 0],
    ["sidebar", 2],
    ["sidebar", 6],
    ["classic", 0],
    ["classic", 4],
    ["classic", 9],
  ];

  for (const [template, extra] of cases) {
    it(`match the PDF: ${template} with ${extra} extra jobs`, async () => {
      const { flow, bytes, pages } = await measureAndPrint(longCv(template, extra));
      const layout = paginate(flow.blocks, flow.start, flow.end, flow.page);

      expect(layout.count).toBe(pages);
      if (!hasPoppler) return;

      /* The first block after each cut opens the next page. Spaces are left
         out of the comparison: textContent runs an employer into the date
         beside it, where the PDF text has a gap. */
      const squash = (text: string) => text.replace(/\s+/g, "");
      layout.cuts.forEach((cut, index) => {
        const first = flow.blocks.find(block => block.top >= cut.at - 0.5);
        const words = squash(first?.text ?? "").slice(0, 14);
        const text = squash(pageText(bytes, index + 2));
        expect(text.startsWith(words), `page ${index + 2} should open with “${words}”, not “${text.slice(0, 30)}”`).toBe(true);
      });
    });
  }
});
