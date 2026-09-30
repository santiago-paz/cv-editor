import type { Cv } from "./types";

/** Runs `clean` over every rich-text field of a CV, in place. Plain-text
    fields need nothing: the templates escape them where they print. */
export function sanitizeCv(cv: Cv, clean: (html: string) => string): Cv {
  cv.summary = clean(cv.summary);
  for (const section of cv.sections) {
    switch (section.kind) {
      case "roles":
      case "projects":
        for (const item of section.items) {
          for (const one of item.bullets) one.html = clean(one.html);
        }
        break;
      case "rows":
        for (const one of section.rows) one.html = clean(one.html);
        break;
      case "list":
        for (const one of section.bullets) one.html = clean(one.html);
        break;
      case "text":
        section.html = clean(section.html);
        break;
    }
  }
  return cv;
}
