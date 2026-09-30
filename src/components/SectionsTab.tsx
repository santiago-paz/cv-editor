"use client";

import { memo, useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { bullet, link, project, role, row, section as newSection } from "@/lib/cv/defaults";
import { PRESETS, PRESET_ORDER } from "@/lib/cv/labels";
import type { Bullet, Cv, Locale, Project, Role, Section } from "@/lib/cv/types";
import { textOf } from "@/lib/html";
import type { Update } from "./DetailsTab";
import { IconButton, RichField, RowButtons, Text, focusLater, move } from "./fields";
import Improve from "./Improve";

type Toast = (text: string, undo?: () => void) => void;

const KIND_NAMES: Record<Section["kind"], string> = {
  roles: "Entries",
  projects: "Projects",
  rows: "Lines",
  list: "Bullets",
  text: "Paragraph",
};

function count(section: Section): number {
  switch (section.kind) {
    case "roles":
    case "projects":
      return section.items.length;
    case "rows":
      return section.rows.length;
    case "list":
      return section.bullets.length;
    case "text":
      return textOf(section.html) ? 1 : 0;
  }
}

/** Finds a section in a draft by id, since its index can move under a recipe. */
function inDraft(draft: Cv, id: string): Section | undefined {
  return draft.sections.find(item => item.id === id);
}

export default function SectionsTab({
  cv,
  update,
  open,
  setOpen,
  toast,
}: {
  cv: Cv;
  update: Update;
  open: Record<string, boolean>;
  setOpen: (id: string, on: boolean) => void;
  toast: Toast;
}) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [drop, setDrop] = useState<{ index: number; below: boolean } | null>(null);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menu]);

  function moveSection(from: number, to: number) {
    if (to < 0 || to >= cv.sections.length) return;
    const moved = cv.sections[from];
    update(draft => move(draft.sections, from, to));
    toast(`Moved “${moved.title || "Untitled"}”. The page cuts moved with it.`);
  }

  function removeSection(index: number) {
    const gone = cv.sections[index];
    update(draft => {
      draft.sections.splice(index, 1);
    });
    toast(`Deleted the “${gone.title || "Untitled"}” section.`, () =>
      update(draft => {
        draft.sections.splice(index, 0, gone);
      }),
    );
  }

  function addSection(preset: (typeof PRESET_ORDER)[number]) {
    const made = newSection(preset, cv.locale);
    update(draft => {
      draft.sections.push(made);
    });
    setOpen(made.id, true);
    setMenu(false);
    focusLater(`[data-field="sections.${made.id}.title"]`, true);
  }

  const onDragOver = (index: number) => (event: DragEvent) => {
    if (dragging === null) return;
    event.preventDefault();
    const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setDrop({ index, below: event.clientY > box.top + box.height / 2 });
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    if (dragging !== null && drop) {
      let to = drop.index + (drop.below ? 1 : 0);
      if (dragging < to) to -= 1;
      if (to !== dragging) moveSection(dragging, to);
    }
    setDragging(null);
    setDrop(null);
  };

  return (
    <div role="tabpanel" id="panel-sections" aria-labelledby="tab-sections">
      <h2 className="pane-label">Sections, in print order</h2>
      <div className="sections">
        {cv.sections.map((section, index) => {
          const isOpen = !!open[section.id];
          const classes = ["sec"];
          if (isOpen) classes.push("open");
          if (dragging === index) classes.push("dragging");
          if (drop?.index === index && dragging !== null && dragging !== index) {
            classes.push(drop.below ? "drop-below" : "drop-above");
          }
          return (
            <section
              key={section.id}
              className={classes.join(" ")}
              data-sec={section.id}
              onDragOver={onDragOver(index)}
              onDrop={onDrop}
              aria-label={section.title || "Untitled section"}
            >
              <div className="sec-head">
                <span
                  className="grip"
                  draggable
                  title="Drag to move"
                  aria-hidden="true"
                  onDragStart={event => {
                    setDragging(index);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", section.id);
                    const strip = (event.currentTarget as HTMLElement).closest(".sec");
                    if (strip) event.dataTransfer.setDragImage(strip, 16, 16);
                  }}
                  onDragEnd={() => {
                    setDragging(null);
                    setDrop(null);
                  }}
                >
                  ⠿
                </span>
                <input
                  type="text"
                  className="sec-title"
                  value={section.title}
                  aria-label="Section heading"
                  placeholder="Untitled"
                  spellCheck={false}
                  data-field={`sections.${section.id}.title`}
                  onChange={event =>
                    update(draft => {
                      const target = inDraft(draft, section.id);
                      if (target) target.title = event.target.value;
                    })
                  }
                />
                <span className="sec-kind">
                  {KIND_NAMES[section.kind]} <span className="count">{count(section)}</span>
                </span>
                <IconButton
                  icon="up"
                  label={`Move ${section.title || "section"} up`}
                  disabled={index === 0}
                  onClick={() => moveSection(index, index - 1)}
                />
                <IconButton
                  icon="down"
                  label={`Move ${section.title || "section"} down`}
                  disabled={index === cv.sections.length - 1}
                  onClick={() => moveSection(index, index + 1)}
                />
                <button
                  type="button"
                  className="iconbtn"
                  aria-expanded={isOpen}
                  aria-controls={`sec-body-${section.id}`}
                  aria-label={`${isOpen ? "Close" : "Open"} ${section.title || "section"}`}
                  title={isOpen ? "Close" : "Open"}
                  onClick={() => setOpen(section.id, !isOpen)}
                >
                  <svg viewBox="0 0 12 12" aria-hidden="true">
                    <path d={isOpen ? "M2.5 4 6 7.5 9.5 4" : "M4 2.5 7.5 6 4 9.5"} />
                  </svg>
                </button>
                <IconButton
                  icon="close"
                  label={`Delete the ${section.title || "untitled"} section`}
                  danger
                  onClick={() => removeSection(index)}
                />
              </div>
              {isOpen && (
                <div className="sec-body" id={`sec-body-${section.id}`}>
                  <SectionBody section={section} update={update} toast={toast} locale={cv.locale} />
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="add-section" ref={menuRef}>
        <button
          type="button"
          className="add"
          aria-expanded={menu}
          aria-controls="sectionMenu"
          onClick={() => {
            setMenu(on => !on);
            if (!menu) focusLater("#sectionMenu button");
          }}
          onKeyDown={event => {
            if (event.key === "Escape") setMenu(false);
          }}
        >
          <span className="plus" aria-hidden="true">+</span> Add a section
        </button>
        {menu && (
          <div
            className="menu"
            id="sectionMenu"
            onKeyDown={event => {
              if (event.key === "Escape") setMenu(false);
            }}
          >
            {PRESET_ORDER.map(id => (
              <button key={id} type="button" onClick={() => addSection(id)}>
                <b>{PRESETS[id].name}</b>
                <span>{PRESETS[id].hint}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="rail-note">
        Tip: click any line in the preview to jump to its field. Drag a section by its dots, or use the arrows.
      </p>
    </div>
  );
}

/* ----------------------------------------------------------- the entries */

function SectionBody({
  section,
  update,
  toast,
  locale,
}: {
  section: Section;
  update: Update;
  toast: Toast;
  locale: Locale;
}) {
  const sid = section.id;

  switch (section.kind) {
    case "roles": {
      const education = section.preset === "education";
      return (
        <>
          {section.items.map((item, index) => (
            <RoleEditor
              key={item.id}
              sid={sid}
              item={item}
              index={index}
              total={section.items.length}
              education={education}
              update={update}
              toast={toast}
              locale={locale}
            />
          ))}
          <button
            type="button"
            className="add small"
            onClick={() => {
              const made = role({ bullets: education ? [] : [bullet()] });
              update(draft => {
                const target = inDraft(draft, sid);
                if (target?.kind === "roles") target.items.push(made);
              });
              focusLater(`[data-field="sections.${sid}.${made.id}"]`);
            }}
          >
            <span className="plus" aria-hidden="true">+</span> {education ? "Add a degree or course" : "Add a job"}
          </button>
        </>
      );
    }
    case "projects":
      return (
        <>
          {section.items.map((item, index) => (
            <ProjectEditor
              key={item.id}
              sid={sid}
              item={item}
              index={index}
              total={section.items.length}
              update={update}
              toast={toast}
              locale={locale}
            />
          ))}
          <button
            type="button"
            className="add small"
            onClick={() => {
              const made = project();
              update(draft => {
                const target = inDraft(draft, sid);
                if (target?.kind === "projects") target.items.push(made);
              });
              focusLater(`[data-field="sections.${sid}.${made.id}"]`);
            }}
          >
            <span className="plus" aria-hidden="true">+</span> Add a project
          </button>
        </>
      );
    case "rows":
      return (
        <>
          <ul className="bullets">
            {section.rows.map((item, index) => (
              <li key={item.id} className="ent" data-row={item.id}>
                <div className="ent-bar">
                  <span className="who">{item.label.trim() || `Line ${index + 1}`}</span>
                  <RowButtons
                    index={index}
                    count={section.rows.length}
                    noun={`line ${index + 1}`}
                    onMove={to => {
                      update(draft => {
                        const target = inDraft(draft, sid);
                        if (target?.kind === "rows") move(target.rows, index, to);
                      });
                      focusLater(`[data-row="${item.id}"] [data-action="${to < index ? "up" : "down"}"]`);
                    }}
                    onDelete={() => {
                      update(draft => {
                        const target = inDraft(draft, sid);
                        if (target?.kind === "rows") target.rows.splice(index, 1);
                      });
                      toast("Deleted the line.", () =>
                        update(draft => {
                          const target = inDraft(draft, sid);
                          if (target?.kind === "rows") target.rows.splice(index, 0, item);
                        }),
                      );
                    }}
                  />
                </div>
                <div className="ent-grid">
                  <label className="wide">
                    <span className="mini-label">Label, printed in bold</span>
                    <Text
                      value={item.label}
                      onChange={value =>
                        update(draft => {
                          const target = inDraft(draft, sid);
                          if (target?.kind === "rows") target.rows[index].label = value;
                        })
                      }
                      placeholder="Frontend"
                    />
                  </label>
                  <div className="wide">
                    <RichField
                      value={item.html}
                      onChange={html =>
                        update(draft => {
                          const target = inDraft(draft, sid);
                          if (target?.kind === "rows") target.rows[index].html = html;
                        })
                      }
                      label={`Line ${index + 1}`}
                      field={`sections.${sid}.${item.id}`}
                      placeholder="React, TypeScript, CSS…"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="add small"
            onClick={() => {
              const made = row();
              update(draft => {
                const target = inDraft(draft, sid);
                if (target?.kind === "rows") target.rows.push(made);
              });
              focusLater(`[data-row="${made.id}"] input`);
            }}
          >
            <span className="plus" aria-hidden="true">+</span> Add a line
          </button>
        </>
      );
    case "list":
      return (
        <Bullets
          bullets={section.bullets}
          path={`sections.${sid}`}
          noun="bullet"
          edit={recipe =>
            update(draft => {
              const target = inDraft(draft, sid);
              if (target?.kind === "list") recipe(target.bullets);
            })
          }
          toast={toast}
          improve={{ title: section.title, dates: "", locale }}
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
            label={section.title || "Paragraph"}
            field={`sections.${sid}`}
            tall
            placeholder="Write a short paragraph…"
          />
          <div className="block-actions">
            <Improve
              kind="text"
              blocks={[{ id: sid, html: section.html }]}
              title={section.title}
              locale={locale}
              onUse={([change]) =>
                update(draft => {
                  const target = inDraft(draft, sid);
                  if (target?.kind === "text" && change) target.html = change.html;
                })
              }
            />
          </div>
        </>
      );
  }
}

/* Memoized: the immer draft keeps an untouched job the same object, so a
   keystroke redraws only the entry being typed in. */
const RoleEditor = memo(function RoleEditor({
  sid,
  item,
  index,
  total,
  education,
  update,
  toast,
  locale,
}: {
  sid: string;
  item: Role;
  index: number;
  total: number;
  education: boolean;
  update: Update;
  toast: Toast;
  locale: Locale;
}) {
  const edit = (recipe: (role: Role) => void) =>
    update(draft => {
      const target = inDraft(draft, sid);
      if (target?.kind === "roles" && target.items[index]) recipe(target.items[index]);
    });
  const set = (key: "title" | "org" | "url" | "dates" | "note") => (value: string) =>
    edit(role => {
      role[key] = value;
    });
  const name = item.org.trim() || item.title.trim() || (education ? "New entry" : "New job");

  return (
    <div className="ent" data-row={item.id}>
      <div className="ent-bar">
        <span className="who">{name}</span>
        <RowButtons
          index={index}
          count={total}
          noun={name}
          onMove={to => {
            update(draft => {
              const target = inDraft(draft, sid);
              if (target?.kind === "roles") move(target.items, index, to);
            });
            focusLater(`[data-row="${item.id}"] [data-action="${to < index ? "up" : "down"}"]`);
          }}
          onDelete={() => {
            update(draft => {
              const target = inDraft(draft, sid);
              if (target?.kind === "roles") target.items.splice(index, 1);
            });
            toast(`Deleted “${name}”.`, () =>
              update(draft => {
                const target = inDraft(draft, sid);
                if (target?.kind === "roles") target.items.splice(index, 0, item);
              }),
            );
          }}
        />
      </div>
      <div className="ent-grid">
        <label>
          <span className="mini-label">{education ? "Degree or course" : "Job title"}</span>
          <Text value={item.title} onChange={set("title")} field={`sections.${sid}.${item.id}`} />
        </label>
        <label>
          <span className="mini-label">{education ? "School" : "Company"}</span>
          <Text value={item.org} onChange={set("org")} />
        </label>
        <label>
          <span className="mini-label">Dates</span>
          <Text value={item.dates} onChange={set("dates")} placeholder="Mar 2022 - Present" />
        </label>
        <label>
          <span className="mini-label">Website</span>
          <Text
            value={item.url}
            onChange={set("url")}
            className="mono"
            inputMode="url"
            spellCheck={false}
            placeholder="example.com…"
          />
        </label>
        <label className="wide">
          <span className="mini-label">Note, in gray after the title</span>
          <Text value={item.note} onChange={set("note")} placeholder={education ? "(completed)" : "(part-time)"} />
        </label>
      </div>
      <Bullets
        bullets={item.bullets}
        path={`sections.${sid}.${item.id}.bullets`}
        noun="bullet"
        edit={recipe => edit(role => recipe(role.bullets))}
        toast={toast}
        improve={{ title: item.title, dates: item.dates, locale }}
      />
    </div>
  );
});

const ProjectEditor = memo(function ProjectEditor({
  sid,
  item,
  index,
  total,
  update,
  toast,
  locale,
}: {
  sid: string;
  item: Project;
  index: number;
  total: number;
  update: Update;
  toast: Toast;
  locale: Locale;
}) {
  const edit = (recipe: (project: Project) => void) =>
    update(draft => {
      const target = inDraft(draft, sid);
      if (target?.kind === "projects" && target.items[index]) recipe(target.items[index]);
    });
  const name = item.name.trim() || "New project";

  return (
    <div className="ent" data-row={item.id}>
      <div className="ent-bar">
        <span className="who">{name}</span>
        <RowButtons
          index={index}
          count={total}
          noun={name}
          onMove={to => {
            update(draft => {
              const target = inDraft(draft, sid);
              if (target?.kind === "projects") move(target.items, index, to);
            });
            focusLater(`[data-row="${item.id}"] [data-action="${to < index ? "up" : "down"}"]`);
          }}
          onDelete={() => {
            update(draft => {
              const target = inDraft(draft, sid);
              if (target?.kind === "projects") target.items.splice(index, 1);
            });
            toast(`Deleted “${name}”.`, () =>
              update(draft => {
                const target = inDraft(draft, sid);
                if (target?.kind === "projects") target.items.splice(index, 0, item);
              }),
            );
          }}
        />
      </div>
      <div className="ent-grid">
        <label className="wide">
          <span className="mini-label">Name</span>
          <Text
            value={item.name}
            onChange={value =>
              edit(project => {
                project.name = value;
              })
            }
            field={`sections.${sid}.${item.id}`}
          />
        </label>
        {item.links.map((one, linkIndex) => (
          <div key={one.id} className="wide list-row" style={{ margin: 0 }}>
            <div className="grow pair">
              <Text
                value={one.label}
                onChange={value =>
                  edit(project => {
                    project.links[linkIndex].label = value;
                  })
                }
                aria-label={`${name}, link ${linkIndex + 1}, as printed`}
                placeholder="example.com"
              />
              <Text
                value={one.url}
                onChange={value =>
                  edit(project => {
                    project.links[linkIndex].url = value;
                  })
                }
                className="mono"
                inputMode="url"
                spellCheck={false}
                aria-label={`${name}, link ${linkIndex + 1}, address`}
                placeholder="https://example.com…"
              />
            </div>
            <IconButton
              icon="close"
              label={`Delete link ${linkIndex + 1}`}
              danger
              onClick={() =>
                edit(project => {
                  project.links.splice(linkIndex, 1);
                })
              }
            />
          </div>
        ))}
        {item.links.length < 3 && (
          <button
            type="button"
            className="add small wide"
            onClick={() =>
              edit(project => {
                project.links.push(link());
              })
            }
          >
            <span className="plus" aria-hidden="true">+</span> Add a link
          </button>
        )}
      </div>
      <Bullets
        bullets={item.bullets}
        path={`sections.${sid}.${item.id}.bullets`}
        noun="bullet"
        edit={recipe => edit(project => recipe(project.bullets))}
        toast={toast}
        improve={{ title: item.name, dates: "", locale }}
      />
    </div>
  );
});

/** A list of bullets. Enter starts the next one, Backspace in an empty one
    removes it, and Alt with an arrow key moves one up or down. */
function Bullets({
  bullets,
  path,
  noun,
  edit,
  toast,
  improve,
}: {
  bullets: Bullet[];
  path: string;
  noun: string;
  edit: (recipe: (list: Bullet[]) => void) => void;
  toast: Toast;
  /** What the AI button tells the model about these bullets. */
  improve?: { title: string; dates: string; locale: Locale };
}) {
  function add(at: number) {
    const made = bullet();
    edit(list => {
      list.splice(at, 0, made);
    });
    focusLater(`[data-field="${path}.${made.id}"]`);
  }

  function remove(index: number, focusPrevious: boolean) {
    const gone = bullets[index];
    edit(list => {
      list.splice(index, 1);
    });
    const next = focusPrevious ? bullets[index - 1] : (bullets[index + 1] ?? bullets[index - 1]);
    if (next) focusLater(`[data-field="${path}.${next.id}"]`);
    if (textOf(gone.html)) {
      toast(`Deleted a ${noun}.`, () =>
        edit(list => {
          list.splice(index, 0, gone);
        }),
      );
    }
  }

  function shift(index: number, to: number) {
    if (to < 0 || to >= bullets.length) return;
    const moving = bullets[index];
    edit(list => move(list, index, to));
    focusLater(`[data-field="${path}.${moving.id}"]`);
  }

  return (
    <>
      <ul className="bullets">
        {bullets.map((item, index) => (
          <li
            key={item.id}
            className="bullet"
            onKeyDown={(event: KeyboardEvent) => {
              if (event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
                event.preventDefault();
                shift(index, index + (event.key === "ArrowUp" ? -1 : 1));
              }
            }}
          >
            <span className="tick" aria-hidden="true">
              ·
            </span>
            <RichField
              value={item.html}
              onChange={html =>
                edit(list => {
                  const target = list.find(one => one.id === item.id);
                  if (target) target.html = html;
                })
              }
              label={`${noun[0].toUpperCase()}${noun.slice(1)} ${index + 1}`}
              field={`${path}.${item.id}`}
              placeholder="What you did, and what came of it…"
              onEnter={() => add(index + 1)}
              onEmptyBackspace={() => remove(index, true)}
            />
            <IconButton icon="close" label={`Delete ${noun} ${index + 1}`} danger onClick={() => remove(index, false)} />
          </li>
        ))}
      </ul>
      <div className="block-actions">
        <button type="button" className="add small" onClick={() => add(bullets.length)}>
          <span className="plus" aria-hidden="true">+</span> Add a {noun}
        </button>
        {improve && bullets.length > 0 && (
          <Improve
            kind="bullets"
            blocks={bullets.map(item => ({ id: item.id, html: item.html }))}
            {...improve}
            onUse={changes =>
              edit(list => {
                for (const change of changes) {
                  const target = list.find(one => one.id === change.id);
                  if (target) target.html = change.html;
                }
              })
            }
          />
        )}
      </div>
    </>
  );
}
