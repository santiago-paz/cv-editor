"use client";

import type { Cv } from "@/lib/cv/types";
import { textOf } from "@/lib/html";
import { fold } from "@/lib/suggest/text";
import { summaryDrafts } from "@/lib/suggest/summary";
import Improve from "../Improve";
import { useSuggest } from "../suggest-context";
import type { Update } from "../types";
import { Field } from "../ui/bits";
import { Combo } from "../ui/Combo";
import { RichField } from "../ui/RichField";
import { flash } from "../ui/util";

/* The summary. Drafts built from what was typed in the earlier steps are
   offered, so a first version is one key away. They say only what the person
   already said. */

export function SummaryStep({
  cv,
  update,
  lines,
}: {
  cv: Cv;
  update: Update;
  /** How many lines the summary takes on the page, once measured. */
  lines: number | null;
}) {
  const suggest = useSuggest();
  const sidebar = cv.template === "sidebar";
  const drafts = summaryDrafts(cv);
  const tone = lines === null ? "ok" : lines >= 7 ? "bad" : lines >= 5 ? "warn" : "ok";

  return (
    <>
      <header className="pane-head">
        <h2 className="pane-title">Summary</h2>
        <p className="pane-help">
          A few lines on who you are.{" "}
          {drafts.length ? "Pick a draft, or write your own." : "Add your job title and skills first to get drafts."}
        </p>
      </header>

      <div className="fields">
        {sidebar && (
          <Field label="Heading on the CV" htmlFor="summary-title">
            <Combo
              id="summary-title"
              value={cv.summaryTitle}
              onChange={value =>
                update(draft => {
                  draft.summaryTitle = value;
                })
              }
              suggest={suggest.summaryHeading}
              openOnFocus
              field="summaryTitle"
            />
          </Field>
        )}
        <Field
          label="Summary"
          aside={
            lines !== null && (
              <span className={"meter " + tone} aria-live="polite">
                {lines} {lines === 1 ? "line" : "lines"}
              </span>
            )
          }
          hint="Recruiters skim, so 3 or 4 lines read best. Select words to make them bold."
        >
          <RichField
            value={cv.summary}
            onChange={html =>
              update(draft => {
                draft.summary = html;
              })
            }
            label="Summary"
            field="summary"
            tall
            placeholder="What you do and what you are good at"
            suggest={query => {
              const typed = fold(query.trim());
              return drafts.filter(text => !typed || fold(text).startsWith(typed)).map(value => ({ value }));
            }}
          />
        </Field>
        {textOf(cv.summary) && (
          <div className="block-actions">
            <Improve
              kind="text"
              blocks={[{ id: "summary", html: cv.summary }]}
              title={cv.person.role}
              locale={suggest.locale}
              onUse={([change]) => {
                update(draft => {
                  if (change) draft.summary = change.html;
                });
                requestAnimationFrame(() => flash(document.querySelector<HTMLElement>('[data-field="summary"]')));
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
