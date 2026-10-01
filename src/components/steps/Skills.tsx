"use client";

import { skill } from "@/lib/cv/defaults";
import type { Cv } from "@/lib/cv/types";
import { fold } from "@/lib/suggest/text";
import { useT } from "../i18n";
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
  const t = useT();
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
    say(t.skills.removed(gone.text), () =>
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
    say(t.skills.cut(cut.length), () =>
      update(draft => {
        draft.skills.push(...cut);
      }),
    );
  }

  return (
    <>
      <header className="pane-head">
        <h2 className="pane-title">{t.skills.title}</h2>
        <p className="pane-help">{sidebar ? t.skills.helpSidebar(SKILL_CAP) : t.skills.helpClassic}</p>
      </header>

      <TokenInput
        chips={shown.map(item => ({ id: item.id, text: item.text }))}
        onAdd={add}
        onRemove={remove}
        onMove={moveChip}
        suggest={query => suggest.skill(query, have)}
        label={t.skills.label}
        placeholder={t.skills.placeholder}
        field="skills"
        chipField={chip => `skills.${chip.id}`}
        over={sidebar ? SKILL_CAP : Number.POSITIVE_INFINITY}
      />

      {sidebar && (
        <p className={"count" + (over ? " bad" : "")} aria-live="polite">
          {t.skills.count(shown.length, SKILL_CAP)}
          {over && (
            <>
              {" "}
              <button type="button" className="text-button inline" onClick={keepFirst}>
                {t.skills.keepFirst(SKILL_CAP)}
              </button>
            </>
          )}
        </p>
      )}

      {offered.length > 0 && (
        <section className="block" aria-label={t.skills.suggested}>
          <h3 className="block-title">{job ? t.skills.oftenListedBy(job) : t.skills.popular}</h3>
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
