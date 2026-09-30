"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { BAND_COLORS, MIN_CONTRAST, hex, railContrast } from "@/lib/color";
import { relocalize } from "@/lib/cv/defaults";
import { LOCALES } from "@/lib/cv/labels";
import { TEMPLATES, TEMPLATE_ORDER } from "@/lib/cv/templates";
import type { Cv, Locale, TemplateId } from "@/lib/cv/types";
import type { Update } from "./DetailsTab";

function LayoutIcon({ id }: { id: TemplateId }) {
  return id === "sidebar" ? (
    <svg viewBox="0 0 14 18" aria-hidden="true" focusable="false">
      <rect x="0.5" y="0.5" width="13" height="17" rx="1" />
      <rect className="ink" x="0.5" y="0.5" width="4.5" height="17" rx="1" />
      <path d="M7 4h4.5M7 6.5h4.5M7 9h3M7 11.5h4.5M7 14h3" />
    </svg>
  ) : (
    <svg viewBox="0 0 14 18" aria-hidden="true" focusable="false">
      <rect x="0.5" y="0.5" width="13" height="17" rx="1" />
      <rect className="ink" x="2.5" y="2.5" width="3" height="3" />
      <path d="M7 3h4.5M7 5h3M2.5 8.5h9M2.5 11h9M2.5 13.5h7" />
    </svg>
  );
}

export default function DesignTab({ cv, update }: { cv: Cv; update: Update }) {
  const id = useId();
  const accent = hex(cv.accent) || BAND_COLORS[0].color;
  const preset = BAND_COLORS.find(item => item.color === accent);
  const ratio = railContrast(accent);
  const low = ratio < MIN_CONTRAST;

  /* A typed hex applies once all six digits are in; three digits apply on
     Enter or on leaving the field, since halfway through six they are not the
     color meant. */
  const [typed, setTyped] = useState(accent);
  const [bad, setBad] = useState(false);
  /* While the field has focus it shows what is being typed; otherwise the
     color in use. */
  const [editing, setEditing] = useState(false);

  const setAccent = (value: string) => {
    const color = hex(value);
    if (!color) return false;
    update(draft => {
      draft.accent = color;
    });
    return true;
  };

  const pick = (template: TemplateId) =>
    update(draft => {
      draft.template = template;
    });

  const onLayoutKey = (index: number) => (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const next = TEMPLATE_ORDER[(index + step + TEMPLATE_ORDER.length) % TEMPLATE_ORDER.length];
    pick(next);
    requestAnimationFrame(() => document.getElementById(`${id}-layout-${next}`)?.focus());
  };

  return (
    <div role="tabpanel" id="panel-design" aria-labelledby="tab-design">
      <h2 className="pane-label" id={`${id}-template`}>
        Template
      </h2>
      <div className="layouts" role="radiogroup" aria-labelledby={`${id}-template`}>
        {TEMPLATE_ORDER.map((templateId, index) => {
          const on = cv.template === templateId;
          const template = TEMPLATES[templateId];
          return (
            <button
              key={templateId}
              id={`${id}-layout-${templateId}`}
              type="button"
              className="layout"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              onClick={() => pick(templateId)}
              onKeyDown={onLayoutKey(index)}
            >
              <LayoutIcon id={templateId} />
              <span>{template.name}</span>
              <span className="layout-pages">
                {template.pages === 1 ? "1 page" : `up to ${template.pages} pages`}
              </span>
            </button>
          );
        })}
      </div>
      <p className="layout-note">{TEMPLATES[cv.template].note}</p>

      <h2 className="pane-label">
        <label htmlFor={`${id}-locale`}>CV language</label>
      </h2>
      <div className="select-row">
        <select
          id={`${id}-locale`}
          value={cv.locale}
          onChange={event =>
            update(draft => {
              relocalize(draft, event.target.value as Locale);
            })
          }
        >
          {LOCALES.map(item => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <p className="hint">
          Sets the headings the template prints on its own, such as Skills and Languages, and any section heading you
          have not renamed.
        </p>
      </div>

      {cv.template === "sidebar" && (
        <>
          <h2 className="pane-label" id={`${id}-band`}>
            Rail color
            <span className={"meter " + (low ? "bad" : "ok")} aria-live="polite">
              Text contrast {ratio.toFixed(1)}:1{low ? " · too light" : ""}
            </span>
          </h2>
          <div className="chips" role="group" aria-labelledby={`${id}-band`}>
            {BAND_COLORS.map(item => (
              <button
                key={item.color}
                type="button"
                className="chip"
                aria-pressed={item.color === accent}
                style={{ ["--chip" as string]: item.color }}
                onClick={() => setAccent(item.color)}
              >
                <span className="chip-ink" aria-hidden="true" />
                <span className="chip-name">{item.name}</span>
              </button>
            ))}
            <label
              className={"chip custom" + (preset ? "" : " on")}
              title="Pick any color"
              style={preset ? undefined : { ["--chip" as string]: accent }}
            >
              <input
                type="color"
                value={accent.toLowerCase()}
                aria-label="Custom rail color"
                onChange={event => setAccent(event.target.value)}
              />
              <span className="chip-ink" aria-hidden="true" />
              <span className="chip-name">Custom</span>
            </label>
          </div>
          <div className="band-hex">
            <label htmlFor={`${id}-hex`}>Hex</label>
            <input
              id={`${id}-hex`}
              type="text"
              value={editing ? typed : accent}
              maxLength={7}
              spellCheck={false}
              autoComplete="off"
              aria-invalid={bad || undefined}
              aria-describedby={`${id}-hexnote`}
              onFocus={() => {
                setTyped(accent);
                setEditing(true);
              }}
              onChange={event => {
                const value = event.target.value.trim();
                setTyped(value);
                const full = /^#?[0-9a-f]{6}$/i.test(value);
                setBad(!full && !/^#?[0-9a-f]{0,5}$/i.test(value));
                if (full) setAccent(value);
              }}
              onKeyDown={event => {
                if (event.key === "Enter") setBad(!setAccent(typed));
              }}
              onBlur={() => {
                setEditing(false);
                setAccent(typed);
                setBad(false);
              }}
            />
            <p className={"band-note" + (bad ? " bad" : "")} id={`${id}-hexnote`}>
              {bad ? "Type 6 hex digits, like #1E4A35." : "Changes this CV only."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
