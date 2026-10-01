"use client";

import { useId, useState } from "react";
import { BAND_COLORS, MIN_CONTRAST, hex, railContrast } from "@/lib/color";
import { relocalize } from "@/lib/cv/defaults";
import { LOCALES } from "@/lib/cv/labels";
import { TEMPLATES, TEMPLATE_ORDER } from "@/lib/cv/templates";
import type { Cv, Locale, TemplateId } from "@/lib/cv/types";
import { Icon } from "./icons";
import type { Update } from "./types";
import { Popover } from "./ui/Popover";
import { Segmented } from "./ui/Segmented";

/* How the CV looks: its layout, the color of the sidebar, and the language of
   the headings the layout prints on its own. */

function Thumb({ id }: { id: TemplateId }) {
  return id === "sidebar" ? (
    <svg viewBox="0 0 48 64" aria-hidden="true" focusable="false" className="thumb">
      <rect x="0.5" y="0.5" width="47" height="63" rx="4" className="thumb-paper" />
      <path d="M4.5 0.5h14v63h-14a4 4 0 0 1-4-4v-55a4 4 0 0 1 4-4z" className="thumb-band" />
      <circle cx="11.5" cy="12" r="4" className="thumb-light" />
      <path d="M6.5 22h10M6.5 26h7M6.5 34h10M6.5 38h8M6.5 46h9" className="thumb-lines-light" />
      <path d="M24 10h18M24 15h12M24 24h18M24 28h16M24 32h18M24 40h18M24 44h14M24 48h17" className="thumb-lines" />
    </svg>
  ) : (
    <svg viewBox="0 0 48 64" aria-hidden="true" focusable="false" className="thumb">
      <rect x="0.5" y="0.5" width="47" height="63" rx="4" className="thumb-paper" />
      <rect x="6" y="6" width="9" height="9" rx="2" className="thumb-block" />
      <path d="M19 8h18M19 12.5h11" className="thumb-lines-strong" />
      <path d="M6 22h36M6 27h30M6 35h36M6 40h33M6 45h26M6 53h36M6 58h22" className="thumb-lines" />
    </svg>
  );
}

export default function StyleMenu({ cv, update }: { cv: Cv; update: Update }) {
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

  return (
    <Popover
      label="Style of the CV"
      align="end"
      className="menu-style"
      trigger={({ toggle, ref, open, panelId }) => (
        <button
          ref={ref}
          type="button"
          className="btn quiet"
          aria-label="Style of the CV"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          onClick={toggle}
        >
          <Icon name="palette" />
          <span className="hide-narrow">Style</span>
        </button>
      )}
    >
      {() => (
        <>
          <div className="menu-block">
            <h3 className="menu-label" id={`${id}-layout`}>
              Layout
            </h3>
            <div className="layouts" role="radiogroup" aria-labelledby={`${id}-layout`}>
              {TEMPLATE_ORDER.map(templateId => {
                const template = TEMPLATES[templateId];
                const on = cv.template === templateId;
                return (
                  <label key={templateId} className={"layout" + (on ? " on" : "")}>
                    <input
                      type="radio"
                      name={`${id}-layout`}
                      checked={on}
                      onChange={() => pick(templateId)}
                      data-autofocus={on || undefined}
                    />
                    <Thumb id={templateId} />
                    <span className="layout-name">{template.name}</span>
                    <span className="layout-pages">
                      {template.pages === 1 ? "1 page" : `Up to ${template.pages} pages`}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="menu-note">{TEMPLATES[cv.template].note}</p>
          </div>

          {cv.template === "sidebar" && (
            <div className="menu-block">
              <div className="menu-head">
                <h3 className="menu-label" id={`${id}-band`}>
                  Sidebar color
                </h3>
                <span className={"meter " + (low ? "bad" : "ok")} role="status">
                  {low ? "Text is hard to read" : "Text is easy to read"}
                </span>
              </div>
              <div className="swatches" role="group" aria-labelledby={`${id}-band`}>
                {BAND_COLORS.map(item => (
                  <button
                    key={item.color}
                    type="button"
                    className="swatch"
                    aria-pressed={item.color === accent}
                    aria-label={item.name}
                    title={item.name}
                    style={{ ["--swatch" as string]: item.color }}
                    onClick={() => setAccent(item.color)}
                  >
                    {item.color === accent && <Icon name="check" size={14} />}
                  </button>
                ))}
                <label
                  className={"swatch custom" + (preset ? "" : " on")}
                  title="Pick any color"
                  style={preset ? undefined : { ["--swatch" as string]: accent }}
                >
                  <input
                    type="color"
                    value={accent.toLowerCase()}
                    aria-label="Custom sidebar color"
                    onChange={event => setAccent(event.target.value)}
                  />
                  {!preset && <Icon name="check" size={14} />}
                </label>
              </div>
              <div className="hex">
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
                <p className={"menu-note" + (bad ? " bad" : "")} id={`${id}-hexnote`}>
                  {bad ? "Type 6 hex digits, like #1E4A35." : "Applies to this CV only."}
                </p>
              </div>
            </div>
          )}

          <div className="menu-block">
            <h3 className="menu-label">CV language</h3>
            <Segmented<Locale>
              label="CV language"
              value={cv.locale}
              onChange={value =>
                update(draft => {
                  relocalize(draft, value);
                })
              }
              options={LOCALES.map(item => ({ value: item.id, label: item.name }))}
            />
            <p className="menu-note">
              Changes the headings the layout prints itself, like Skills and Languages. It also changes the suggestions.
              Headings you renamed stay as they are.
            </p>
          </div>
        </>
      )}
    </Popover>
  );
}
