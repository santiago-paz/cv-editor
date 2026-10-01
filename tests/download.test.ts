import { afterEach, describe, expect, it, vi } from "vitest";
import { sampleCv } from "@/lib/cv/sample";
import { defaultWay, fetchPdf, inChromium, printCv } from "@/lib/download";

/* What the editor says when the PDF route, or Vercel in front of it, says
   no. The message ends up in a toast, so it must be plain text. */

function answer(status: number, body: unknown) {
  vi.stubGlobal("fetch", async () => new Response(JSON.stringify(body), { status }));
}

const failure = () => fetchPdf(sampleCv(), null).then(() => "", (error: Error) => error.message);

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("a PDF the server won't make", () => {
  it("asks for a minute when the firewall's limit is reached", async () => {
    answer(429, { error: { code: "429", message: "Too Many Requests" } });
    expect(await failure()).toBe("Too many PDFs came from this network in the last minute. Wait a minute, then try again.");
  });

  it("shows the route's own message", async () => {
    answer(413, { error: "That CV is too large to print. Try a smaller photo." });
    expect(await failure()).toBe("That CV is too large to print. Try a smaller photo.");
  });

  it("never shows an object that Vercel put in the reply", async () => {
    answer(403, { error: { code: "403", message: "Forbidden" } });
    expect(await failure()).toBe("The server could not make the PDF (error 403).");
  });

  it("copes with a reply that isn't JSON", async () => {
    vi.stubGlobal("fetch", async () => new Response("An error occurred with your deployment", { status: 504 }));
    expect(await failure()).toBe("The server could not make the PDF (error 504).");
  });
});

/* The main PDF button prints from the browser, except where that is not to be
   trusted: a phone or a tablet, whose first finger is a touch. */

describe("the way the main button takes", () => {
  const screen = (touch: boolean) =>
    vi.stubGlobal("window", {
      matchMedia: (query: string) => ({
        matches: touch && query.includes("hover: none") && query.includes("pointer: coarse"),
      }),
    });

  it("is the print dialog on a computer", () => {
    screen(false);
    expect(defaultWay()).toBe("print");
  });

  it("is the file from the server on a phone or a tablet", () => {
    screen(true);
    expect(defaultWay()).toBe("file");
  });

  it("is the print dialog when the browser cannot be asked", () => {
    vi.stubGlobal("window", {});
    expect(defaultWay()).toBe("print");
  });
});

describe("a browser built on Chromium", () => {
  it("is told apart by userAgentData", () => {
    vi.stubGlobal("navigator", { userAgentData: { brands: [] } });
    expect(inChromium()).toBe(true);
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 Firefox/130.0" });
    expect(inChromium()).toBe(false);
  });
});

/* The print dialog, against a stand-in for the page. There is no browser
   here, so the frame, the document and the clock are fakes that record what
   is done to them. */

interface Frame {
  onload: (() => void) | null;
  removed: boolean;
  srcdoc: string;
  tabIndex: number;
  style: { cssText: string };
  attributes: Record<string, string>;
  setAttribute: (name: string, value: string) => void;
  remove: () => void;
  contentWindow: unknown;
}

/** A page whose frame loads at once, or never, and whose print() calls
    `onPrint` with the page's title at that moment. */
function standIn({ onPrint = () => {}, loads = true }: { onPrint?: (title: string) => void; loads?: boolean } = {}) {
  const page = { title: "CV Editor", frames: [] as Frame[] };
  vi.stubGlobal("document", {
    get title() {
      return page.title;
    },
    set title(value: string) {
      page.title = value;
    },
    createElement: () => {
      const frame: Frame = {
        onload: null,
        removed: false,
        srcdoc: "",
        tabIndex: 0,
        style: { cssText: "" },
        attributes: {},
        setAttribute: (name, value) => {
          frame.attributes[name] = value;
        },
        remove: () => {
          frame.removed = true;
        },
        contentWindow: {
          document: { body: { firstElementChild: {} }, fonts: { ready: Promise.resolve() } },
          focus: () => {},
          print: () => onPrint(page.title),
        },
      };
      page.frames.push(frame);
      return frame;
    },
    body: { append: (frame: Frame) => loads && queueMicrotask(() => frame.onload?.()) },
  });
  vi.stubGlobal("window", {
    setTimeout: (run: () => void, ms?: number) => setTimeout(run, ms),
    clearTimeout: (id: ReturnType<typeof setTimeout>) => clearTimeout(id),
  });
  return page;
}

describe("the print dialog", () => {
  it("opens on a frame that holds only the CV, with no scripts", async () => {
    const page = standIn();
    vi.useFakeTimers();
    const done = printCv(sampleCv(), null);
    await vi.advanceTimersByTimeAsync(1000);
    await done;
    const [frame] = page.frames;
    expect(frame.attributes.sandbox).toBe("allow-same-origin allow-modals");
    expect(frame.srcdoc).toContain("Alex Moreno");
  });

  it("names the page after the file while it is open, then puts the title back", async () => {
    const seen: string[] = [];
    const page = standIn({ onPrint: title => seen.push(title) });
    vi.useFakeTimers();
    const done = printCv(sampleCv(), null);
    await vi.advanceTimersByTimeAsync(0);
    expect(seen).toEqual(["Alex_Moreno_CV"]);
    expect(page.title).toBe("Alex_Moreno_CV");
    expect(page.frames[0].removed).toBe(false);

    await vi.advanceTimersByTimeAsync(1000);
    await done;
    expect(page.title).toBe("CV Editor");
    expect(page.frames[0].removed).toBe(true);
  });

  it("joins a print that is already open, and starts a new one after it", async () => {
    const page = standIn();
    vi.useFakeTimers();
    const first = printCv(sampleCv(), null);
    expect(printCv(sampleCv(), null)).toBe(first);
    await vi.advanceTimersByTimeAsync(1000);
    await first;
    expect(page.frames).toHaveLength(1);

    const second = printCv(sampleCv(), null);
    await vi.advanceTimersByTimeAsync(1000);
    await second;
    expect(page.frames).toHaveLength(2);
  });

  it("says so, and cleans up, when the browser will not print", async () => {
    const page = standIn({
      onPrint: () => {
        throw new Error("blocked");
      },
    });
    vi.useFakeTimers();
    const caught = printCv(sampleCv(), null).then(() => "", (error: Error) => error.message);
    await vi.advanceTimersByTimeAsync(0);
    expect(await caught).toBe("blocked");
    expect(page.title).toBe("CV Editor");
    expect(page.frames[0].removed).toBe(true);
  });

  it("gives up when the frame never loads", async () => {
    const page = standIn({ loads: false });
    vi.useFakeTimers();
    const caught = printCv(sampleCv(), null).then(() => "", (error: Error) => error.message);
    await vi.advanceTimersByTimeAsync(15_000);
    expect(await caught).toBe("The print frame did not load.");
    expect(page.frames[0].removed).toBe(true);
  });
});
