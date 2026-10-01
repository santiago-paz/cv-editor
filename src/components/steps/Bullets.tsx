"use client";

import type { KeyboardEvent } from "react";
import { bullet } from "@/lib/cv/defaults";
import type { Bullet } from "@/lib/cv/types";
import { textOf } from "@/lib/html";
import { useT } from "../i18n";
import { useSuggest } from "../suggest-context";
import type { Say } from "../types";
import { AddButton, IconButton } from "../ui/bits";
import { changeThenFocus, flowStep } from "../ui/flow";
import Improve from "../Improve";
import { RichField } from "../ui/RichField";
import { flash, move } from "../ui/util";

/* The bullets under a job, a project or a list heading.

   Enter starts the next bullet. Enter on an empty one leaves the list for the
   next box, and drops that empty bullet when others are there. Backspace in an
   empty bullet removes it. Alt with the arrow keys moves one up or down.

   With `title`, it suggests whole lines for that job. With `improve`, an AI
   button under the list offers to rewrite the bullets. */

export function BulletsEditor({
  bullets,
  path,
  edit,
  say,
  title,
  first,
  more,
  improve,
}: {
  bullets: Bullet[];
  /** The path of the list, such as `sections.ID.ID.bullets`. */
  path: string;
  edit: (recipe: (list: Bullet[]) => void) => void;
  say: Say;
  /** The job title to suggest lines for. Leave out to suggest nothing. */
  title?: string;
  /** The placeholder of the first bullet, and of the ones after it. */
  first?: string;
  more?: string;
  /** What the AI button tells the model about these bullets. Leave out for no button. */
  improve?: { title: string; dates: string };
}) {
  const t = useT();
  const suggest = useSuggest();
  const fieldOf = (id: string) => `[data-field="${path}.${id}"]`;

  function add(at: number) {
    const made = bullet();
    changeThenFocus(
      () =>
        edit(list => {
          list.splice(at, 0, made);
        }),
      fieldOf(made.id),
    );
  }

  function remove(index: number, focus: "previous" | "next") {
    const gone = bullets[index];
    const target = focus === "previous" ? bullets[index - 1] : (bullets[index + 1] ?? bullets[index - 1]);
    const removal = () =>
      edit(list => {
        list.splice(index, 1);
      });
    if (target) changeThenFocus(removal, fieldOf(target.id));
    else removal();
    if (textOf(gone.html)) {
      say(t.bullets.deleted, () =>
        edit(list => {
          list.splice(index, 0, gone);
        }),
      );
    }
  }

  function leave(index: number) {
    const element = document.querySelector<HTMLElement>(fieldOf(bullets[index].id));
    if (element) flowStep(element);
    // An empty bullet at the end of a list with others in it is only a leftover.
    if (index === bullets.length - 1 && bullets.length > 1) {
      const id = bullets[index].id;
      edit(list => {
        const at = list.findIndex(item => item.id === id);
        if (at > 0 && !textOf(list[at].html)) list.splice(at, 1);
      });
    }
  }

  function shift(index: number, to: number) {
    if (to < 0 || to >= bullets.length) return;
    const moving = bullets[index];
    changeThenFocus(() => edit(list => move(list, index, to)), fieldOf(moving.id));
  }

  const onKeys = (index: number) => (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      shift(index, index + (event.key === "ArrowUp" ? -1 : 1));
      return true;
    }
    return false;
  };

  return (
    <div className="bullets">
      {bullets.length > 0 && (
        <ul>
          {bullets.map((item, index) => {
            const others = bullets.filter(one => one.id !== item.id).map(one => textOf(one.html));
            return (
              <li key={item.id} className="bullet">
                <span className="bullet-dot" aria-hidden="true" />
                <RichField
                  value={item.html}
                  onChange={html =>
                    edit(list => {
                      const target = list.find(one => one.id === item.id);
                      if (target) target.html = html;
                    })
                  }
                  label={t.bullets.label(index + 1)}
                  field={`${path}.${item.id}`}
                  placeholder={index === 0 ? (first ?? t.bullets.first) : (more ?? t.bullets.more)}
                  suggest={title === undefined ? undefined : query => suggest.bullet(query, others, title)}
                  onEnter={() => add(index + 1)}
                  onEmptyEnter={() => leave(index)}
                  onEmptyBackspace={() => remove(index, "previous")}
                  onKeys={onKeys(index)}
                />
                <IconButton
                  icon="close"
                  label={t.bullets.delete(index + 1)}
                  danger
                  className="bullet-x"
                  tabIndex={-1}
                  onClick={() => remove(index, "next")}
                />
              </li>
            );
          })}
        </ul>
      )}
      <div className="block-actions">
        <AddButton flow={false} className="add-quiet" onClick={() => add(bullets.length)}>
          {bullets.length ? t.bullets.addAnother : t.bullets.add}
        </AddButton>
        {improve && bullets.some(item => textOf(item.html)) && (
          <Improve
            kind="bullets"
            blocks={bullets.map(item => ({ id: item.id, html: item.html }))}
            title={improve.title}
            dates={improve.dates}
            locale={suggest.locale}
            onUse={changes => {
              edit(list => {
                for (const change of changes) {
                  const target = list.find(one => one.id === change.id);
                  if (target) target.html = change.html;
                }
              });
              requestAnimationFrame(() => changes.forEach(change => flash(document.querySelector<HTMLElement>(fieldOf(change.id)))));
            }}
          />
        )}
      </div>
    </div>
  );
}
