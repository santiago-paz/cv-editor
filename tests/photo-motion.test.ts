import { describe, expect, it } from "vitest";
import { renderCv } from "@/lib/cv/render";
import { sampleCv } from "@/lib/cv/sample";
import { TEMPLATE_ORDER } from "@/lib/cv/templates";
import { printsPhoto } from "@/lib/photo-motion";

/* The preview plays the photo's motion only when the body it is handed prints a
   photo, and it finds out by the mark the templates write. If a template stops
   writing it, the motion would silently stop, so each one is checked here. */
describe("telling whether the preview prints the photo", () => {
  const photo = "data:image/jpeg;base64,AAAA";

  it("finds the photo in every template", () => {
    for (const template of TEMPLATE_ORDER) {
      const cv = { ...sampleCv(), template };
      expect(printsPhoto(renderCv(cv, { photo, annotate: true }).body)).toBe(true);
    }
  });

  it("finds none when the CV does not print one", () => {
    for (const template of TEMPLATE_ORDER) {
      const cv = { ...sampleCv(), template };
      expect(printsPhoto(renderCv({ ...cv, showPhoto: false }, { photo, annotate: true }).body)).toBe(false);
      expect(printsPhoto(renderCv(cv, { photo: null, annotate: true }).body)).toBe(false);
    }
  });

  it("finds none in the markup the PDF prints, which has no marks", () => {
    expect(printsPhoto(renderCv(sampleCv(), { photo }).body)).toBe(false);
  });

  it("does not take typed text for the photo", () => {
    const cv = { ...sampleCv(), showPhoto: false };
    cv.person = { ...cv.person, name: 'x" data-edit="photo' };
    expect(printsPhoto(renderCv(cv, { photo, annotate: true }).body)).toBe(false);
  });
});
