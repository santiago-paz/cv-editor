"use client";

import { useId, type KeyboardEvent } from "react";
import { language, link, skill } from "@/lib/cv/defaults";
import type { Template } from "@/lib/cv/templates";
import type { Cv } from "@/lib/cv/types";
import { Field, RichField, RowButtons, Text, focusLater, move } from "./fields";

export type Update = (recipe: (draft: Cv) => void) => void;

/** The sidebar holds ten skills; past that the rail runs long. */
export const SKILL_CAP = 10;

function Meter({ tone, children }: { tone: "ok" | "warn" | "bad"; children: string }) {
  return (
    <span className={"meter " + tone} aria-live="polite">
      {children}
    </span>
  );
}

export default function DetailsTab({
  cv,
  update,
  template,
  summaryLines,
  photo,
  toast,
}: {
  cv: Cv;
  update: Update;
  template: Template;
  summaryLines: number | null;
  photo: React.ReactNode;
  toast: (text: string, undo?: () => void) => void;
}) {
  const id = useId();
  const sidebar = template.id === "sidebar";
  const person = cv.person;

  const setPerson = (key: keyof Cv["person"]) => (value: string) =>
    update(draft => {
      draft.person[key] = value;
    });

  /* ------------------------------------------------------------ skills */

  const skills = cv.skills;
  const filled = skills.filter(item => item.text.trim()).length;
  const empty = skills.length - filled;
  const over = sidebar && skills.length > SKILL_CAP;
  const skillMeter = sidebar
    ? `${skills.length} of ${SKILL_CAP}${over ? " · over the limit" : ""}${empty ? ` · ${empty} empty` : ""}`
    : `${filled} · printed as one line`;

  function addSkill(at = skills.length) {
    const item = skill();
    update(draft => {
      draft.skills.splice(at, 0, item);
    });
    focusLater(`[data-field="skills.${item.id}"]`);
  }

  function removeSkill(index: number) {
    const gone = skills[index];
    update(draft => {
      draft.skills.splice(index, 1);
    });
    const next = skills[index + 1] ?? skills[index - 1];
    focusLater(next ? `[data-field="skills.${next.id}"]` : "#addSkill");
    if (gone.text.trim()) {
      toast(`Deleted “${gone.text.trim()}”.`, () =>
        update(draft => {
          draft.skills.splice(index, 0, gone);
        }),
      );
    }
  }

  function trimSkills() {
    const cut = skills.slice(SKILL_CAP);
    update(draft => {
      draft.skills.splice(SKILL_CAP);
    });
    toast(`Took ${cut.length} skills off the end.`, () =>
      update(draft => {
        draft.skills.push(...cut);
      }),
    );
  }

  const skillKeys = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill(index + 1);
    }
    if (event.key === "Backspace" && !skills[index].text && skills.length > 1) {
      event.preventDefault();
      removeSkill(index);
    }
  };

  /* ------------------------------------------------------------- links */

  function addLink() {
    const item = link();
    update(draft => {
      draft.links.push(item);
    });
    focusLater(`[data-field="links.${item.id}"]`);
  }

  /* --------------------------------------------------------- languages */

  function addLanguage() {
    const item = language("", "", 50);
    update(draft => {
      draft.languages.push(item);
    });
    focusLater(`[data-field="languages.${item.id}"]`);
  }

  const lineTone = summaryLines === null ? "ok" : summaryLines >= 7 ? "bad" : summaryLines >= 5 ? "warn" : "ok";

  return (
    <div role="tabpanel" id="panel-details" aria-labelledby="tab-details">
      {photo}

      <h2 className="pane-label">You</h2>
      <div className="fields">
        <Field label="Name" htmlFor={`${id}-name`}>
          <Text
            id={`${id}-name`}
            name="name"
            value={person.name}
            onChange={setPerson("name")}
            field="person.name"
            autoComplete="name"
          />
        </Field>
        <Field label="Job title" htmlFor={`${id}-role`}>
          <Text
            id={`${id}-role`}
            name="job-title"
            autoComplete="organization-title"
            value={person.role}
            onChange={setPerson("role")}
            field="person.role"
            placeholder="Frontend Developer…"
          />
        </Field>
        <Field label="Location" htmlFor={`${id}-location`}>
          <Text
            id={`${id}-location`}
            name="location"
            value={person.location}
            onChange={setPerson("location")}
            field="person.location"
            placeholder="Berlin, Germany…"
          />
        </Field>
        <div className="field-row">
          <Field label="Email" htmlFor={`${id}-email`}>
            <Text
              id={`${id}-email`}
              name="email"
              type="email"
              value={person.email}
              onChange={setPerson("email")}
              field="person.email"
              spellCheck={false}
              autoComplete="email"
            />
          </Field>
          <Field label="Phone" htmlFor={`${id}-phone`}>
            <Text
              id={`${id}-phone`}
              name="tel"
              type="tel"
              value={person.phone}
              onChange={setPerson("phone")}
              field="person.phone"
              autoComplete="tel"
            />
          </Field>
        </div>
      </div>

      <h2 className="pane-label" id={`${id}-links`}>
        Links
      </h2>
      <ul className="list" aria-labelledby={`${id}-links`}>
        {cv.links.map((item, index) => (
          <li key={item.id} className="list-row" data-row={item.id}>
            <div className="grow pair">
              <Text
                value={item.label}
                onChange={value =>
                  update(draft => {
                    draft.links[index].label = value;
                  })
                }
                field={`links.${item.id}`}
                aria-label={`Link ${index + 1}, as printed`}
                placeholder="github.com/you…"
              />
              <Text
                value={item.url}
                onChange={value =>
                  update(draft => {
                    draft.links[index].url = value;
                  })
                }
                className="mono"
                inputMode="url"
                spellCheck={false}
                aria-label={`Link ${index + 1}, address`}
                placeholder="https://github.com/you…"
              />
            </div>
            <RowButtons
              index={index}
              count={cv.links.length}
              noun={`link ${index + 1}`}
              onMove={to => {
                update(draft => move(draft.links, index, to));
                focusLater(`[data-row="${item.id}"] [data-action="${to < index ? "up" : "down"}"]`);
              }}
              onDelete={() => {
                update(draft => {
                  draft.links.splice(index, 1);
                });
                toast("Deleted the link.", () =>
                  update(draft => {
                    draft.links.splice(index, 0, item);
                  }),
                );
              }}
            />
          </li>
        ))}
      </ul>
      <div className="list-add">
        <button type="button" className="add small" onClick={addLink}>
          <span className="plus" aria-hidden="true">+</span> Add a link
        </button>
        {cv.links.length > 0 && (
          <p className="hint">The first box is what prints. Leave it empty to print the address.</p>
        )}
      </div>

      <h2 className="pane-label">Summary</h2>
      <div className="fields">
        {sidebar && (
          <Field label="Heading" htmlFor={`${id}-sumtitle`}>
            <Text
              id={`${id}-sumtitle`}
              value={cv.summaryTitle}
              onChange={value =>
                update(draft => {
                  draft.summaryTitle = value;
                })
              }
              field="summaryTitle"
            />
          </Field>
        )}
        <div className="field">
          <span className="field-label" id={`${id}-sum`}>
            Text
            {summaryLines !== null && (
              <Meter tone={lineTone}>{`${summaryLines} ${summaryLines === 1 ? "line" : "lines"}`}</Meter>
            )}
          </span>
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
            placeholder="2 or 3 sentences: what you do, what you are good at, what you want next…"
          />
          <p className="hint">Recruiters skim, so 3 or 4 lines read best. Select words to make them bold.</p>
        </div>
      </div>

      <h2 className="pane-label" id="skillsLabel">
        Skills
        <Meter tone={over ? "bad" : empty ? "warn" : "ok"}>{skillMeter}</Meter>
      </h2>
      <ol className="list" aria-labelledby="skillsLabel">
        {skills.map((item, index) => (
          <li key={item.id} className={"list-row" + (sidebar && index >= SKILL_CAP ? " over" : "")} data-row={item.id}>
            <span className="tick" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <Text
              value={item.text}
              onChange={value =>
                update(draft => {
                  draft.skills[index].text = value;
                })
              }
              onKeyDown={skillKeys(index)}
              field={`skills.${item.id}`}
              aria-label={`Skill ${index + 1}`}
              placeholder="New skill…"
            />
            <RowButtons
              index={index}
              count={skills.length}
              noun={`skill ${index + 1}`}
              onMove={to => {
                update(draft => move(draft.skills, index, to));
                focusLater(`[data-row="${item.id}"] [data-action="${to < index ? "up" : "down"}"]`);
              }}
              onDelete={() => removeSkill(index)}
            />
          </li>
        ))}
      </ol>
      <div className="list-add">
        <button type="button" id="addSkill" className="add small" onClick={() => addSkill()}>
          <span className="plus" aria-hidden="true">+</span> Add a skill
        </button>
        {over && (
          <button type="button" className="tog" onClick={trimSkills}>
            Keep the first {SKILL_CAP}
          </button>
        )}
        <p className="hint">
          {sidebar
            ? "The rail holds 10. Pick the ones the job asks for. Enter adds the next one."
            : "Classic prints them as one line under your summary. Enter adds the next one."}
        </p>
      </div>

      <h2 className="pane-label" id={`${id}-langs`}>
        Languages
      </h2>
      <ul className="list" aria-labelledby={`${id}-langs`}>
        {cv.languages.map((item, index) => (
          <li key={item.id} className="list-row stacked" data-row={item.id}>
            <div className="grow lang">
              <Text
                value={item.name}
                onChange={value =>
                  update(draft => {
                    draft.languages[index].name = value;
                  })
                }
                field={`languages.${item.id}`}
                aria-label={`Language ${index + 1}`}
                placeholder="Spanish…"
              />
              <Text
                value={item.level}
                onChange={value =>
                  update(draft => {
                    draft.languages[index].level = value;
                  })
                }
                aria-label={`Language ${index + 1}, level`}
                placeholder="Native, Fluent, B2…"
              />
              {sidebar && (
                <div className="lang-bar">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={item.percent}
                    aria-label={`Language ${index + 1}, bar length`}
                    aria-valuetext={item.percent ? `${item.percent}%` : "No bar"}
                    onChange={event =>
                      update(draft => {
                        draft.languages[index].percent = Number(event.target.value);
                      })
                    }
                  />
                  <output>{item.percent ? `${item.percent}%` : "No bar"}</output>
                </div>
              )}
            </div>
            <RowButtons
              index={index}
              count={cv.languages.length}
              noun={`language ${index + 1}`}
              onMove={to => {
                update(draft => move(draft.languages, index, to));
                focusLater(`[data-row="${item.id}"] [data-action="${to < index ? "up" : "down"}"]`);
              }}
              onDelete={() => {
                update(draft => {
                  draft.languages.splice(index, 1);
                });
                toast(`Deleted ${item.name.trim() || "the language"}.`, () =>
                  update(draft => {
                    draft.languages.splice(index, 0, item);
                  }),
                );
              }}
            />
          </li>
        ))}
      </ul>
      <div className="list-add">
        <button type="button" className="add small" onClick={addLanguage}>
          <span className="plus" aria-hidden="true">+</span> Add a language
        </button>
      </div>

      <h2 className="pane-label">Hobbies</h2>
      <div className="fields">
        <Text
          value={cv.hobbies}
          onChange={value =>
            update(draft => {
              draft.hobbies = value;
            })
          }
          field="hobbies"
          aria-label="Hobbies"
          placeholder="Climbing, film photography…"
        />
      </div>
    </div>
  );
}
