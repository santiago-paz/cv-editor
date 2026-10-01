"use client";

import type { Cv } from "@/lib/cv/types";
import { textOf } from "@/lib/html";
import { fold } from "@/lib/suggest/text";
import { summaryDrafts } from "@/lib/suggest/summary";
import { useT } from "../i18n";
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
  const t = useT();
  const suggest = useSuggest();
  const sidebar = cv.template === "sidebar";
  const drafts = summaryDrafts(cv);
  const tone = lines === null ? "ok" : lines >= 7 ? "bad" : lines >= 5 ? "warn" : "ok";

  return (
    <>
      <header className="pane-head">
        <h2 className="pane-title">{t.summary.title}</h2>
        <p className="pane-help">{t.summary.help(drafts.length > 0)}</p>
      </header>

      <div className="fields">
        {sidebar && (
          <Field label={t.summary.headingField} htmlFor="summary-title">
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
          label={t.summary.field}
          aside={
            lines !== null && (
              <span className={"meter " + tone} aria-live="polite">
                {t.summary.lines(lines)}
              </span>
            )
          }
          hint={t.summary.hint}
        >
          <RichField
            value={cv.summary}
            onChange={html =>
              update(draft => {
                draft.summary = html;
              })
            }
            label={t.summary.field}
            field="summary"
            tall
            placeholder={t.summary.placeholder}
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
