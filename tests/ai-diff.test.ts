import { describe, expect, it } from "vitest";
import { markNew, sameWords } from "@/lib/ai-diff";

describe("marking what an AI suggestion changed", () => {
  it("marks the words the original did not have", () => {
    expect(markNew("Built the design system that five teams use.", "Built the design system used by five teams.")).toBe(
      "Built the design system <mark>that</mark> five teams <mark>use</mark>.",
    );
  });

  it("leaves a suggestion alone when nothing is new", () => {
    expect(markNew("Led the rebuild.", "Led the rebuild.")).toBe("Led the rebuild.");
  });

  it("joins new words that sit next to each other into one mark", () => {
    expect(markNew("Led the checkout redesign from scratch.", "Led the checkout.")).toBe(
      "Led the checkout <mark>redesign from scratch</mark>.",
    );
  });

  it("does not split a word at a dot or a hyphen inside it", () => {
    expect(markNew("Built apps in Next.js for end-to-end delivery teams.", "Built apps for delivery teams.")).toBe(
      "Built apps <mark>in Next.js</mark> for <mark>end-to-end</mark> delivery teams.",
    );
  });

  it("marks the second use of a word the original had once", () => {
    expect(markNew("Wrote tests and tests.", "Wrote tests.")).toBe("Wrote tests <mark>and tests</mark>.");
  });

  it("matches words whatever their case", () => {
    expect(markNew("BUILT the checkout.", "built the checkout.")).toBe("BUILT the checkout.");
  });

  it("leaves tags and entities alone", () => {
    const out = markNew('Ran <strong>R&amp;D</strong> for <a href="https://example.com/x">Acme</a>.', "Ran R&D.");
    expect(out).toBe('Ran <strong>R&amp;D</strong> <mark>for</mark> <a href="https://example.com/x"><mark>Acme</mark></a>.');
  });

  it("does not mark anything when the line was written again from scratch", () => {
    expect(markNew("Designed and shipped a new onboarding flow.", "Helped with the signup page.")).toBe(
      "Designed and shipped a new onboarding flow.",
    );
  });

  it("works on words with accents and other scripts", () => {
    expect(markNew("Lideré la migración al nuevo sistema.", "Lideré la migración.")).toBe(
      "Lideré la migración <mark>al nuevo sistema</mark>.",
    );
  });
});

describe("telling that a suggestion changed nothing", () => {
  it("ignores markup, case and spacing", () => {
    expect(sameWords("Built the <strong>checkout</strong>.", "built the  checkout.")).toBe(true);
  });

  it("sees a changed word", () => {
    expect(sameWords("Built the checkout.", "Built the cart.")).toBe(false);
  });
});
