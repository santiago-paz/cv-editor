"use client";

import { memo, useState } from "react";
import { project, row } from "@/lib/cv/defaults";
import type { Cv, Link, Project, ProjectsSection, RowsSection, Section } from "@/lib/cv/types";
import { useT } from "../i18n";
import { Icon } from "../icons";
import { useSuggest } from "../suggest-context";
import type { Say, Update } from "../types";
import { AddButton, Field, IconButton, MenuItem } from "../ui/bits";
import Improve from "../Improve";
import { Combo } from "../ui/Combo";
import { changeThenFocus, flowStep } from "../ui/flow";
import { Popover } from "../ui/Popover";
import { RichField } from "../ui/RichField";
import { flash, move } from "../ui/util";
import { BulletsEditor } from "./Bullets";
import { CardMenu } from "./CardMenu";
import { inDraft } from "./helpers";
import { LinksEditor } from "./Links";
import { RolesEditor } from "./Roles";
import { textOf } from "@/lib/html";

/* One section of the CV as a step: its heading, a menu to rename, move or
   delete it, and whatever its entries are. */

export function SectionStep({
  cv,
  section,
  index,
  update,
  say,
}: {
  cv: Cv;
  section: Section;
  index: number;
  update: Update;
  say: Say;
}) {
  const t = useT();
  const suggest = useSuggest();
  const [renaming, setRenaming] = useState(false);
  const sid = section.id;
  const name = section.title.trim() || t.sections.untitled;

  function rename(value: string) {
    update(draft => {
      const target = inDraft(draft, sid);
      if (target) target.title = value;
    });
  }

  function shift(to: number) {
    update(draft => move(draft.sections, index, to));
  }

  function remove() {
    update(draft => {
      draft.sections.splice(index, 1);
    });
    say(t.sections.deleted(name), () =>
      update(draft => {
        draft.sections.splice(Math.min(index, draft.sections.length), 0, section);
      }),
    );
  }

  const helpFor = (key: string | undefined) => (t.sections.help as Record<string, string>)[key ?? ""] ?? "";
  const help = helpFor(section.preset ?? section.kind) || helpFor(section.kind);

  return (
    <>
      <header className="pane-head">
        <div className="pane-title-row">
          {renaming ? (
            <Combo
              className="title-input"
              boxClassName="title-box"
              value={section.title}
              onChange={rename}
              suggest={suggest.sectionHeading}
              openOnFocus
              autoFocus
              field={`sections.${sid}.title`}
              aria-label={t.sections.headingLabel}
              onAdvance={() => setRenaming(false)}
              onFocus={event => event.currentTarget.select()}
              onBlur={() => setRenaming(false)}
            />
          ) : (
            <h2
              className="pane-title"
              tabIndex={-1}
              data-field={`sections.${sid}.title`}
              onFocus={() => setRenaming(true)}
            >
              {name}
            </h2>
          )}
          <Popover
            label={t.sections.optionsFor(name)}
            align="end"
            menu
            trigger={({ toggle, ref, open, panelId }) => (
              <button
                ref={ref}
                type="button"
                className="iconbtn"
                aria-label={t.sections.optionsForSection(name)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                onClick={toggle}
              >
                <Icon name="more" />
              </button>
            )}
          >
            {({ close }) => (
              <>
                <MenuItem
                  icon="pencil"
                  onClick={() => {
                    close();
                    setRenaming(true);
                  }}
                >
                  {t.sections.rename}
                </MenuItem>
                <MenuItem
                  icon="left"
                  disabled={index === 0}
                  onClick={() => {
                    shift(index - 1);
                    close();
                  }}
                >
                  {t.sections.moveEarlier}
                </MenuItem>
                <MenuItem
                  icon="right"
                  disabled={index === cv.sections.length - 1}
                  onClick={() => {
                    shift(index + 1);
                    close();
                  }}
                >
                  {t.sections.moveLater}
                </MenuItem>
                <MenuItem
                  icon="trash"
                  danger
                  onClick={() => {
                    close();
                    remove();
                  }}
                >
                  {t.sections.delete}
                </MenuItem>
              </>
            )}
          </Popover>
        </div>
        {help && <p className="pane-help">{help}</p>}
      </header>

      <SectionBody section={section} update={update} say={say} />
    </>
  );
}

function SectionBody({ section, update, say }: { section: Section; update: Update; say: Say }) {
  const t = useT();
  const suggest = useSuggest();
  const sid = section.id;
  switch (section.kind) {
    case "roles":
      return <RolesEditor section={section} update={update} say={say} />;
    case "projects":
      return <ProjectsEditor section={section} update={update} say={say} />;
    case "rows":
      return <RowsEditor section={section} update={update} say={say} />;
    case "list":
      return (
        <BulletsEditor
          bullets={section.bullets}
          path={`sections.${sid}`}
          say={say}
          edit={recipe =>
            update(draft => {
              const target = inDraft(draft, sid);
              if (target?.kind === "list") recipe(target.bullets);
            })
          }
          improve={{ title: section.title, dates: "" }}
        />
      );
    case "text":
      return (
        <>
          <RichField
            value={section.html}
            onChange={html =>
              update(draft => {
                const target = inDraft(draft, sid);
                if (target?.kind === "text") target.html = html;
              })
            }
            label={section.title || t.sections.paragraph}
            field={`sections.${sid}`}
            tall
            placeholder={t.sections.paragraphPlaceholder}
          />
          {textOf(section.html) && (
            <div className="block-actions">
              <Improve
                kind="text"
                blocks={[{ id: sid, html: section.html }]}
                title={section.title}
                locale={suggest.locale}
                onUse={([change]) => {
                  update(draft => {
                    const target = inDraft(draft, sid);
                    if (target?.kind === "text" && change) target.html = change.html;
                  });
                  requestAnimationFrame(() => flash(document.querySelector<HTMLElement>(`[data-field="sections.${sid}"]`)));
                }}
              />
            </div>
          )}
        </>
      );
  }
}

/* --------------------------------------------------------------- projects */

function ProjectsEditor({ section, update, say }: { section: ProjectsSection; update: Update; say: Say }) {
  const t = useT();
  const sid = section.id;

  function addProject() {
    const made = project();
    changeThenFocus(
      () =>
        update(draft => {
          const target = inDraft(draft, sid);
          if (target?.kind === "projects") target.items.push(made);
        }),
      `[data-field="sections.${sid}.${made.id}.name"]`,
    );
  }

  return (
    <>
      {section.items.map((item, index) => (
        <ProjectCard key={item.id} sid={sid} item={item} index={index} total={section.items.length} update={update} say={say} />
      ))}
      <AddButton onClick={addProject}>{section.items.length ? t.sections.addAnotherProject : t.sections.addProject}</AddButton>
    </>
  );
}

const ProjectCard = memo(function ProjectCard({
  sid,
  item,
  index,
  total,
  update,
  say,
}: {
  sid: string;
  item: Project;
  index: number;
  total: number;
  update: Update;
  say: Say;
}) {
  const t = useT();
  const edit = (recipe: (project: Project) => void) =>
    update(draft => {
      const target = inDraft(draft, sid);
      const found = target?.kind === "projects" ? target.items.find(one => one.id === item.id) : undefined;
      if (found) recipe(found);
    });
  const name = item.name.trim() || t.sections.newProject;
  const path = `sections.${sid}.${item.id}`;

  function remove() {
    update(draft => {
      const target = inDraft(draft, sid);
      if (target?.kind === "projects") target.items.splice(index, 1);
    });
    say(t.editor.deleted(name), () =>
      update(draft => {
        const target = inDraft(draft, sid);
        if (target?.kind === "projects") target.items.splice(Math.min(index, target.items.length), 0, item);
      }),
    );
  }

  function shift(to: number) {
    update(draft => {
      const target = inDraft(draft, sid);
      if (target?.kind === "projects") move(target.items, index, to);
    });
  }

  return (
    <article className="card" data-row={item.id}>
      <header className="card-head">
        <h3 className="card-title">{name}</h3>
        <CardMenu name={name} index={index} total={total} onShift={shift} onDelete={remove} />
      </header>
      <div className="fields">
        <Field label={t.sections.projectName} htmlFor={`${item.id}-name`}>
          <Combo
            id={`${item.id}-name`}
            value={item.name}
            onChange={value =>
              edit(one => {
                one.name = value;
              })
            }
            field={`${path}.name`}
            placeholder="Tempo"
            aria-label={t.sections.projectName}
          />
        </Field>
        <Field label={t.sections.projectLinks}>
          <LinksEditor
            links={item.links}
            path={`${path}.links`}
            say={say}
            max={3}
            addLabel={t.sections.addLink}
            edit={recipe => edit(one => recipe(one.links as Link[]))}
          />
        </Field>
      </div>
      <BulletsEditor
        bullets={item.bullets}
        path={`${path}.bullets`}
        edit={recipe => edit(one => recipe(one.bullets))}
        say={say}
        first={t.sections.projectFirst}
        improve={{ title: item.name, dates: "" }}
      />
    </article>
  );
});

/* ------------------------------------------------------------ labeled lines */

function RowsEditor({ section, update, say }: { section: RowsSection; update: Update; say: Say }) {
  const t = useT();
  const suggest = useSuggest();
  const sid = section.id;
  const rows = section.rows;

  const edit = (recipe: (list: RowsSection["rows"]) => void) =>
    update(draft => {
      const target = inDraft(draft, sid);
      if (target?.kind === "rows") recipe(target.rows);
    });

  function add(at: number) {
    const made = row();
    changeThenFocus(
      () =>
        edit(list => {
          list.splice(at, 0, made);
        }),
      `[data-row="${made.id}"] input`,
    );
  }

  function remove(index: number) {
    const gone = rows[index];
    edit(list => {
      list.splice(index, 1);
    });
    if (gone.label.trim() || textOf(gone.html)) {
      say(t.sections.lineDeleted, () =>
        edit(list => {
          list.splice(Math.min(index, list.length), 0, gone);
        }),
      );
    }
  }

  return (
    <div className="rows">
      {rows.map((item, index) => {
        const last = index === rows.length - 1;
        return (
          <div key={item.id} className="row-line" data-row={item.id}>
            <Field label={index === 0 ? t.sections.label : ""} className="row-label">
              <Combo
                value={item.label}
                onChange={value =>
                  edit(list => {
                    const target = list.find(one => one.id === item.id);
                    if (target) target.label = value;
                  })
                }
                suggest={query => suggest.rowLabel(query, section.preset)}
                openOnFocus
                placeholder={section.preset === "awards" ? "Certificate" : "Frontend"}
                aria-label={t.sections.lineLabel(index + 1)}
              />
            </Field>
            <Field label={index === 0 ? t.sections.text : ""} className="row-text">
              <RichField
                value={item.html}
                onChange={html =>
                  edit(list => {
                    const target = list.find(one => one.id === item.id);
                    if (target) target.html = html;
                  })
                }
                label={t.sections.line(index + 1)}
                field={`sections.${sid}.${item.id}`}
                placeholder={section.preset === "awards" ? "AWS Certified Developer, 2023" : "React, TypeScript, CSS"}
                onEnter={() => {
                  const here = document.querySelector<HTMLElement>(`[data-row="${item.id}"] [contenteditable]`);
                  if (last && (item.label.trim() || textOf(item.html))) add(index + 1);
                  else if (here) flowStep(here);
                }}
                onEmptyEnter={() => {
                  const here = document.querySelector<HTMLElement>(`[data-row="${item.id}"] [contenteditable]`);
                  if (here) flowStep(here);
                  if (last && rows.length > 1 && !item.label.trim()) remove(index);
                }}
              />
            </Field>
            <IconButton icon="close" label={t.sections.deleteLine(index + 1)} danger tabIndex={-1} onClick={() => remove(index)} />
          </div>
        );
      })}
      <AddButton flow={false} onClick={() => add(rows.length)}>
        {rows.length ? t.sections.addAnotherLine : t.sections.addLine}
      </AddButton>
    </div>
  );
}

