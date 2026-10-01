"use client";

import { memo, useState } from "react";
import { bullet, role } from "@/lib/cv/defaults";
import type { Role, RolesSection } from "@/lib/cv/types";
import { textOf } from "@/lib/html";
import { exampleRange } from "@/lib/suggest/dates";
import { useT } from "../i18n";
import { Icon } from "../icons";
import { useSuggest } from "../suggest-context";
import type { Say, Update } from "../types";
import { AddButton, Field } from "../ui/bits";
import { Combo } from "../ui/Combo";
import { changeThenFocus, focusLater } from "../ui/flow";
import { move } from "../ui/util";
import { BulletsEditor } from "./Bullets";
import { CardMenu } from "./CardMenu";
import { inDraft } from "./helpers";

/* The jobs of an Experience section, or the degrees of an Education one. The
   same entry holds both: a title, a place, dates, and a few bullets. */

export function RolesEditor({ section, update, say }: { section: RolesSection; update: Update; say: Say }) {
  const t = useT();
  const study = section.preset === "education";
  const sid = section.id;

  function addRole() {
    const made = role({ bullets: study ? [] : [bullet()] });
    changeThenFocus(
      () =>
        update(draft => {
          const target = inDraft(draft, sid);
          if (target?.kind === "roles") target.items.push(made);
        }),
      `[data-field="sections.${sid}.${made.id}.title"]`,
    );
  }

  return (
    <>
      {section.items.map((item, index) => (
        <RoleCard
          key={item.id}
          sid={sid}
          item={item}
          index={index}
          total={section.items.length}
          study={study}
          update={update}
          say={say}
        />
      ))}
      <AddButton onClick={addRole}>
        {section.items.length === 0
          ? study
            ? t.roles.addDegree
            : t.roles.addLatest
          : study
            ? t.roles.addAnotherDegree
            : t.roles.addJob}
      </AddButton>
    </>
  );
}

/* Memoized: the draft keeps an untouched job the same object, so a keystroke
   redraws only the entry being typed in. */
const RoleCard = memo(function RoleCard({
  sid,
  item,
  index,
  total,
  study,
  update,
  say,
}: {
  sid: string;
  item: Role;
  index: number;
  total: number;
  study: boolean;
  update: Update;
  say: Say;
}) {
  const t = useT();
  const suggest = useSuggest();
  const [more, setMore] = useState(!!(item.note || item.url));
  const [details, setDetails] = useState(item.bullets.some(one => textOf(one.html)));

  const edit = (recipe: (role: Role) => void) =>
    update(draft => {
      const target = inDraft(draft, sid);
      const found = target?.kind === "roles" ? target.items.find(one => one.id === item.id) : undefined;
      if (found) recipe(found);
    });
  const set = (key: "title" | "org" | "url" | "dates" | "note") => (value: string) =>
    edit(one => {
      one[key] = value;
    });
  const path = `sections.${sid}.${item.id}`;
  const name = item.org.trim() || item.title.trim() || (study ? t.roles.newEntry : t.roles.newJob);

  function shift(to: number) {
    update(draft => {
      const target = inDraft(draft, sid);
      if (target?.kind === "roles") move(target.items, index, to);
    });
  }

  function remove() {
    update(draft => {
      const target = inDraft(draft, sid);
      if (target?.kind === "roles") target.items.splice(index, 1);
    });
    say(t.editor.deleted(name), () =>
      update(draft => {
        const target = inDraft(draft, sid);
        if (target?.kind === "roles") target.items.splice(Math.min(index, target.items.length), 0, item);
      }),
    );
  }

  const showBullets = !study || details;

  return (
    <article className="card" data-row={item.id}>
      <header className="card-head">
        <h3 className="card-title">{name}</h3>
        <CardMenu name={name} index={index} total={total} onShift={shift} onDelete={remove} />
      </header>

      <div className="fields">
        <Field label={study ? t.roles.degree : t.roles.jobTitle} htmlFor={`${item.id}-title`}>
          <Combo
            id={`${item.id}-title`}
            value={item.title}
            onChange={set("title")}
            suggest={study ? suggest.degree : suggest.title}
            field={`${path}.title`}
            placeholder={study ? "B.Sc. Computer Science" : "Senior Frontend Engineer"}
            aria-label={study ? t.roles.degree : t.roles.jobTitle}
          />
        </Field>
        <div className="two when">
          <Field label={study ? t.roles.school : t.roles.company} htmlFor={`${item.id}-org`}>
            <Combo
              id={`${item.id}-org`}
              value={item.org}
              onChange={set("org")}
              suggest={study ? suggest.school : suggest.company}
              field={`${path}.org`}
              placeholder={study ? "University of Valencia" : "Northwind Commerce"}
              aria-label={study ? t.roles.school : t.roles.company}
            />
          </Field>
          <Field label={t.roles.when} htmlFor={`${item.id}-dates`}>
            <Combo
              id={`${item.id}-dates`}
              value={item.dates}
              onChange={set("dates")}
              suggest={suggest.dates}
              field={`${path}.dates`}
              placeholder={study ? "2012 - 2016" : exampleRange(suggest.locale)}
              aria-label={t.roles.datesLabel}
            />
          </Field>
        </div>
        <p className="field-hint tight">{t.roles.datesHint("3/22 -", exampleRange(suggest.locale), "2019 2022", "2019 - 2022")}</p>

        {more ? (
          <div className="two">
            <Field label={t.roles.note} htmlFor={`${item.id}-note`}>
              <Combo
                id={`${item.id}-note`}
                value={item.note}
                onChange={set("note")}
                suggest={query => suggest.note(query, study)}
                openOnFocus
                field={`${path}.note`}
                placeholder={study ? "(completed)" : "(part-time)"}
                aria-label={t.roles.note}
              />
            </Field>
            <Field label={t.roles.website} htmlFor={`${item.id}-url`}>
              <Combo
                id={`${item.id}-url`}
                value={item.url}
                onChange={set("url")}
                field={`${path}.url`}
                inputMode="url"
                placeholder="example.com"
                aria-label={t.roles.websiteLabel}
              />
            </Field>
          </div>
        ) : (
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setMore(true);
              focusLater(`[data-field="${path}.note"]`);
            }}
          >
            <Icon name="plus" size={13} /> {t.roles.noteOrWebsite}
          </button>
        )}
      </div>

      {showBullets ? (
        <BulletsEditor
          bullets={item.bullets}
          path={`${path}.bullets`}
          edit={recipe => edit(one => recipe(one.bullets))}
          say={say}
          title={study ? undefined : item.title}
          first={study ? t.roles.firstDetail : t.bullets.first}
          improve={{ title: item.title, dates: item.dates }}
        />
      ) : (
        <button
          type="button"
          className="text-button"
          onClick={() => {
            setDetails(true);
            if (!item.bullets.length) {
              const made = bullet();
              edit(one => {
                one.bullets.push(made);
              });
              focusLater(`[data-field="${path}.bullets.${made.id}"]`);
            }
          }}
        >
          <Icon name="plus" size={13} /> {t.roles.addDetails}
        </button>
      )}
    </article>
  );
});
