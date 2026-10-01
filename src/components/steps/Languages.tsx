"use client";

import { language } from "@/lib/cv/defaults";
import type { Cv } from "@/lib/cv/types";
import { levelPercent } from "@/lib/suggest/sources";
import { useSuggest } from "../suggest-context";
import type { Say, Update } from "../types";
import { AddButton, IconButton } from "../ui/bits";
import { Combo } from "../ui/Combo";
import { changeThenFocus, flowStep } from "../ui/flow";
import { TokenInput } from "../ui/TokenInput";

/* Languages with a level each, and the interests that close a CV. A language
   is a few letters and Enter, then its level. The bar the sidebar draws
   follows the level, so there is nothing to drag. */

const words = (text: string) =>
  text
    .split(",")
    .map(part => part.trim())
    .filter(Boolean);

export function LanguagesStep({ cv, update, say }: { cv: Cv; update: Update; say: Say }) {
  const suggest = useSuggest();
  const languages = cv.languages;
  const have = languages.map(item => item.name).filter(Boolean);
  const interests = words(cv.hobbies);

  function add(at: number) {
    const made = language("", "", 0);
    changeThenFocus(
      () =>
        update(draft => {
          draft.languages.splice(at, 0, made);
        }),
      `[data-field="languages.${made.id}"]`,
    );
  }

  function remove(index: number) {
    const gone = languages[index];
    update(draft => {
      draft.languages.splice(index, 1);
    });
    if (gone.name.trim()) {
      say(`Deleted ${gone.name.trim()}.`, () =>
        update(draft => {
          draft.languages.splice(Math.min(index, draft.languages.length), 0, gone);
        }),
      );
    }
  }

  function advanceName(index: number, input: HTMLInputElement) {
    const item = languages[index];
    if (item.name.trim()) {
      flowStep(input);
      return;
    }
    // An empty language means "no more". Leave from the last box of the row, so the
    // row's own level box is skipped too, and drop the leftover row.
    const level = input.closest<HTMLElement>(".lang-row")?.querySelectorAll<HTMLInputElement>("input")[1];
    flowStep(level ?? input);
    if (languages.length > 1) {
      update(draft => {
        const at = draft.languages.findIndex(one => one.id === item.id);
        if (at > -1 && !draft.languages[at].name.trim() && !draft.languages[at].level.trim()) draft.languages.splice(at, 1);
      });
    }
  }

  function advanceLevel(index: number, input: HTMLInputElement) {
    if (index === languages.length - 1 && languages[index].name.trim()) add(index + 1);
    else flowStep(input);
  }

  const setInterests = (list: string[]) =>
    update(draft => {
      draft.hobbies = list.join(", ");
    });

  return (
    <>
      <header className="pane-head">
        <h2 className="pane-title">Languages</h2>
        <p className="pane-help">Pick the language, then how well you speak it.</p>
      </header>

      <div className="rows">
        {languages.map((item, index) => (
          <div key={item.id} className="lang-row" data-row={item.id}>
            <Combo
              value={item.name}
              onChange={value =>
                update(draft => {
                  const target = draft.languages.find(one => one.id === item.id);
                  if (target) target.name = value;
                })
              }
              suggest={query => suggest.language(query, have.filter(name => name !== item.name))}
              openOnFocus
              field={`languages.${item.id}`}
              aria-label={`Language ${index + 1}`}
              placeholder={suggest.language("", [])[0]?.value ?? "Spanish"}
              onAdvance={input => advanceName(index, input)}
            />
            <Combo
              value={item.level}
              onChange={value =>
                update(draft => {
                  const target = draft.languages.find(one => one.id === item.id);
                  if (!target) return;
                  target.level = value;
                  const percent = levelPercent(value);
                  if (percent !== null) target.percent = percent;
                })
              }
              suggest={suggest.level}
              openOnFocus
              aria-label={`Language ${index + 1}, level`}
              placeholder={suggest.level("")[0]?.value ?? "Native"}
              onAdvance={input => advanceLevel(index, input)}
            />
            <IconButton icon="close" label={`Delete language ${index + 1}`} danger tabIndex={-1} onClick={() => remove(index)} />
          </div>
        ))}
        <AddButton flow={false} onClick={() => add(languages.length)}>
          {languages.length ? "Add another language" : "Add a language"}
        </AddButton>
      </div>

      <section className="block" aria-labelledby="lang-interests">
        <h3 className="block-title" id="lang-interests">
          Interests
        </h3>
        <TokenInput
          chips={interests.map(text => ({ id: text, text }))}
          onAdd={text => setInterests([...interests, text])}
          onRemove={index => setInterests(interests.filter((_, at) => at !== index))}
          onMove={(from, to) => {
            const next = [...interests];
            next.splice(to, 0, next.splice(from, 1)[0]);
            setInterests(next);
          }}
          suggest={query => suggest.hobby(query, interests)}
          label="Interests"
          placeholder="Climbing, film photography"
          field="hobbies"
        />
      </section>
    </>
  );
}
