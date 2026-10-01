"use client";

import { skill } from "@/lib/cv/defaults";
import type { Cv } from "@/lib/cv/types";
import { fold } from "@/lib/suggest/text";
import { Icon } from "../icons";
import { useSuggest } from "../suggest-context";
import type { Say, Update } from "../types";
import { TokenInput } from "../ui/TokenInput";

/** The sidebar holds ten skills; past that the rail runs long. */
export const SKILL_CAP = 10;

/* Skills as chips. Type a few letters and press Enter to add one, and the box
   stays ready for the next. The skills people in the same job list are offered
   below, one click each. */

export function SkillsStep({ cv, update, say }: { cv: Cv; update: Update; say: Say }) {
  const suggest = useSuggest();
  const sidebar = cv.template === "sidebar";
  // Rows left empty by an older version of the editor are not shown as chips.
  const shown = cv.skills.filter(item => item.text.trim());
  const have = shown.map(item => item.text);
  const over = sidebar && shown.length > SKILL_CAP;
  const offered = suggest.suggestedSkills(have, 12);
  const job = cv.person.role.trim();

  function add(text: string) {
    update(draft => {
      const key = fold(text);
      if (draft.skills.some(item => fold(item.text) === key)) return;
      draft.skills.push(skill(text));
    });
  }

  function remove(index: number) {
    const gone = shown[index];
    if (!gone) return;
    update(draft => {
      const at = draft.skills.findIndex(item => item.id === gone.id);
      if (at > -1) draft.skills.splice(at, 1);
    });
    say(`Removed “${gone.text}”.`, () =>
      update(draft => {
        draft.skills.splice(Math.min(cv.skills.findIndex(item => item.id === gone.id), draft.skills.length), 0, gone);
      }),
    );
  }

  function moveChip(from: number, to: number) {
    const a = shown[from];
    const b = shown[to];
    if (!a || !b) return;
    update(draft => {
      const fromAt = draft.skills.findIndex(item => item.id === a.id);
      const toAt = draft.skills.findIndex(item => item.id === b.id);
      if (fromAt < 0 || toAt < 0) return;
      draft.skills.splice(toAt, 0, draft.skills.splice(fromAt, 1)[0]);
    });
  }

  function keepFirst() {
    const keep = new Set(shown.slice(0, SKILL_CAP).map(item => item.id));
    const cut = cv.skills.filter(item => item.text.trim() && !keep.has(item.id));
    update(draft => {
      draft.skills = draft.skills.filter(item => !item.text.trim() || keep.has(item.id));
    });
    say(`Took ${cut.length} ${cut.length === 1 ? "skill" : "skills"} off the end.`, () =>
      update(draft => {
        draft.skills.push(...cut);
      }),
    );
  }

  return (
    <>
      <header className="pane-head">
        <h2 className="pane-title">Your skills</h2>
        <p className="pane-help">
          {sidebar
            ? `The sidebar fits ${SKILL_CAP}. Put the ones the job asks for first.`
            : "Classic prints them as one line under your summary."}
        </p>
      </header>

      <TokenInput
        chips={shown.map(item => ({ id: item.id, text: item.text }))}
        onAdd={add}
        onRemove={remove}
        onMove={moveChip}
        suggest={query => suggest.skill(query, have)}
        label="Skills"
        placeholder="Type a skill, then Enter"
        field="skills"
        chipField={chip => `skills.${chip.id}`}
        over={sidebar ? SKILL_CAP : Number.POSITIVE_INFINITY}
      />

      {sidebar && (
        <p className={"count" + (over ? " bad" : "")} aria-live="polite">
          {shown.length} of {SKILL_CAP} fit on the sidebar
          {over && (
            <>
              {" "}
              <button type="button" className="text-button inline" onClick={keepFirst}>
                Keep the first {SKILL_CAP}
              </button>
            </>
          )}
        </p>
      )}

      {offered.length > 0 && (
        <section className="block" aria-label="Suggested skills">
          <h3 className="block-title">{job ? `Often listed by ${job}` : "Popular skills"}</h3>
          <div className="suggest-chips">
            {offered.map(name => (
              <button key={name} type="button" className="chip-add" tabIndex={-1} onClick={() => add(name)}>
                <Icon name="plus" size={13} />
                {name}
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
