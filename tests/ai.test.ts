import { describe, expect, it } from "vitest";
import { rewriteRequest, type RewriteRequest } from "@/lib/ai";
import { clean } from "@/lib/server/rewrite";

const request = (change: Partial<RewriteRequest> = {}): RewriteRequest => ({
  kind: "bullets",
  title: "Frontend Engineer",
  dates: "2022 - Present",
  locale: "en",
  items: ["Built the checkout.", "Helped with <strong>tests</strong>."],
  ...change,
});

describe("what the AI button may send", () => {
  it("takes a normal block", () => {
    expect(rewriteRequest.safeParse(request()).success).toBe(true);
  });

  it("refuses an empty block", () => {
    expect(rewriteRequest.safeParse(request({ items: ["", "<br>"] })).success).toBe(false);
    expect(rewriteRequest.safeParse(request({ items: [] })).success).toBe(false);
  });

  it("refuses a block too long to send", () => {
    expect(rewriteRequest.safeParse(request({ items: ["x".repeat(1400), "x".repeat(1400), "x".repeat(1400)] })).success).toBe(
      false,
    );
    expect(rewriteRequest.safeParse(request({ items: Array.from({ length: 13 }, () => "Did a thing.") })).success).toBe(
      false,
    );
  });

  it("refuses a language the CV cannot be in", () => {
    expect(rewriteRequest.safeParse({ ...request(), locale: "fr" }).success).toBe(false);
  });
});

describe("cleaning what the model sends back", () => {
  it("keeps one rewrite per bullet, in order", () => {
    const out = clean(request(), { items: ["Built the checkout in Next.js.", "Wrote <strong>tests</strong>."], tips: [] });
    expect(out.items).toEqual(["Built the checkout in Next.js.", "Wrote <strong>tests</strong>."]);
  });

  it("keeps the original where the model left a bullet out or empty", () => {
    const out = clean(request(), { items: [""], tips: [] });
    expect(out.items).toEqual(["Built the checkout.", "Helped with <strong>tests</strong>."]);
  });

  it("cleans the markup like any rich text", () => {
    const out = clean(request(), {
      items: ['<script>alert(1)</script>Led the <a href="javascript:alert(1)">move</a>.', '<div onclick="x">Wrote</div> tests.'],
      tips: [],
    });
    expect(out.items[0]).toBe("Led the move.");
    expect(out.items[1]).toBe("Wrote tests.");
  });

  it("returns a paragraph as one item", () => {
    const out = clean(request({ kind: "text", items: ["I build web apps."] }), {
      items: ["Frontend engineer who builds", "fast web apps."],
      tips: [],
    });
    expect(out.items).toEqual(["Frontend engineer who builds fast web apps."]);
  });

  it("keeps at most three short tips, as plain text", () => {
    const out = clean(request(), {
      items: [],
      tips: ["Add a <b>number</b>.", "  ", "Say how many users.", "Name the tool.", "One more."],
    });
    expect(out.tips).toEqual(["Add a number.", "Say how many users.", "Name the tool."]);
  });
});
