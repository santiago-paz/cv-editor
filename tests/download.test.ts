import { afterEach, describe, expect, it, vi } from "vitest";
import { sampleCv } from "@/lib/cv/sample";
import { fetchPdf } from "@/lib/download";

/* What the editor says when the PDF route, or Vercel in front of it, says
   no. The message ends up in a toast, so it must be plain text. */

function answer(status: number, body: unknown) {
  vi.stubGlobal("fetch", async () => new Response(JSON.stringify(body), { status }));
}

const failure = () => fetchPdf(sampleCv(), null).then(() => "", (error: Error) => error.message);

afterEach(() => {
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
