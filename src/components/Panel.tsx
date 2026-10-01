"use client";

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { section as newSection } from "@/lib/cv/defaults";
import type { Cv, Section } from "@/lib/cv/types";
import { textOf } from "@/lib/html";
import { SECTION_CHOICES, type SectionChoice } from "@/lib/suggest/data/misc";
import { fold } from "@/lib/suggest/text";
import { Icon, Key } from "./icons";
import { LanguagesStep } from "./steps/Languages";
import { SectionStep } from "./steps/Sections";
import { SkillsStep } from "./steps/Skills";
import { SummaryStep } from "./steps/Summary";
import { YouStep } from "./steps/You";
import type { Say, Update } from "./types";
import { MenuItem } from "./ui/bits";
import { FLOW_END, flowList, focusBox } from "./ui/flow";
import { Popover } from "./ui/Popover";

/* The writing side of the editor: a row of steps, one step at a time, and a
   button to go on. A step is a part of the CV, in the order people fill it in:
   you, each section, skills, languages, summary.

   Enter in the last box of a step moves to the next step, so the whole CV can
   be typed from start to end without the mouse. Cmd or Ctrl with Enter does
   the same from anywhere. */

export type StepId = "you" | "skills" | "languages" | "summary" | `s:${string}`;

export interface StepDef {
  id: StepId;
  label: string;
  /** Has something in it. */
  done: boolean;
}

function filled(section: Section): boolean {
  switch (section.kind) {
    case "roles":
      return section.items.some(item => item.title.trim() || item.org.trim());
    case "projects":
      return section.items.some(item => item.name.trim());
    case "rows":
      return section.rows.some(item => item.label.trim() || textOf(item.html));
    case "list":
      return section.bullets.some(item => textOf(item.html));
    case "text":
      return !!textOf(section.html);
  }
}

export function stepsOf(cv: Cv): StepDef[] {
  return [
    { id: "you", label: "You", done: !!(cv.person.name.trim() || cv.person.role.trim()) },
    ...cv.sections.map(
      (section): StepDef => ({ id: `s:${section.id}`, label: section.title.trim() || "Untitled", done: filled(section) }),
    ),
    { id: "skills", label: "Skills", done: cv.skills.some(item => item.text.trim()) },
    { id: "languages", label: "Languages", done: cv.languages.some(item => item.name.trim()) },
    { id: "summary", label: "Summary", done: !!textOf(cv.summary) },
  ];
}

/** The step that holds a field, from the path the preview and the boxes share. */
export function stepForPath(cv: Cv, path: string): StepId {
  if (path.startsWith("sections.")) {
    const id = path.split(".")[1];
    return cv.sections.some(section => section.id === id) ? `s:${id}` : "you";
  }
  if (path === "skills" || path.startsWith("skills.")) return "skills";
  if (path === "languages" || path.startsWith("languages.") || path === "hobbies") return "languages";
  if (path === "summary" || path === "summaryTitle") return "summary";
  return "you";
}

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);

export default function Panel({
  cv,
  update,
  say,
  step,
  onStep,
  summaryLines,
  photo,
  onDownload,
  busy,
  onFocusPath,
  onNew,
}: {
  cv: Cv;
  update: Update;
  say: Say;
  step: StepId;
  onStep: (step: StepId) => void;
  summaryLines: number | null;
  photo: ReactNode;
  onDownload: () => void;
  busy: boolean;
  /** The path of the box that has focus, for the preview to light. */
  onFocusPath: (path: string | null) => void;
  /** Starts a blank CV, offered when the open one is the sample. */
  onNew: () => void;
}) {
  const steps = stepsOf(cv);
  const at = Math.max(0, steps.findIndex(item => item.id === step));
  const current = steps[at];
  const next = steps[at + 1];
  const content = useRef<HTMLDivElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);

  /* Goes to a step and, when asked, puts focus in its first box. The step is
     drawn first, so a key pressed a moment later lands in the new step. */
  function go(to: StepId, focus: boolean) {
    if (!focus) {
      onStep(to);
      return;
    }
    flushSync(() => onStep(to));
    const first = content.current ? flowList(content.current)[0] : undefined;
    if (first) focusBox(first);
  }

  function goNext() {
    if (next) go(next.id, true);
    else nextButton.current?.focus();
  }

  /* The last box of a step hands over to the next step. */
  useEffect(() => {
    const element = content.current;
    if (!element) return;
    element.addEventListener(FLOW_END, goNext);
    return () => element.removeEventListener(FLOW_END, goNext);
  });

  /* A fade marks the edge of the tab row that has more tabs past it. */
  useEffect(() => {
    const element = tabs.current;
    if (!element) return;
    const update = () => {
      element.dataset.start = String(element.scrollLeft > 4);
      element.dataset.end = String(element.scrollLeft + element.clientWidth < element.scrollWidth - 4);
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [steps.length]);

  /* The tab in use stays in view when the row is wider than the panel. */
  useEffect(() => {
    tabs.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [step]);

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: steps.length - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const to = steps[(keys[event.key] + steps.length) % steps.length];
    go(to.id, false);
    requestAnimationFrame(() => document.getElementById(`tab-${to.id}`)?.focus());
  }

  function addSection(choice: SectionChoice) {
    const made = newSection(choice.preset, cv.locale);
    made.title = choice.title;
    update(draft => {
      draft.sections.push(made);
    });
    go(`s:${made.id}`, true);
  }

  const taken = new Set(cv.sections.map(item => fold(item.title)));
  const choices = SECTION_CHOICES[cv.locale].filter(choice => !taken.has(fold(choice.title)));

  const sectionAt = cv.sections.findIndex(item => `s:${item.id}` === current.id);
  const currentSection = sectionAt >= 0 ? cv.sections[sectionAt] : null;
  const mod = isMac() ? "⌘" : "Ctrl";

  return (
    <section
      className="write"
      aria-label="Write your CV"
      onFocusCapture={event => {
        const path = (event.target as HTMLElement).closest<HTMLElement>("[data-field]")?.dataset.field;
        if (path) onFocusPath(path);
      }}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onFocusPath(null);
      }}
      onKeyDown={event => {
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          goNext();
        }
      }}
    >
      {cv.sample && (
        <p className="sample-note">
          This is a sample. Type over it, or{" "}
          <button type="button" className="text-button inline" onClick={onNew}>
            start your own CV
          </button>
          .
        </p>
      )}

      <div className="steps">
        <div className="steps-scroll" ref={tabs}>
          <div className="steps-list" role="tablist" aria-label="Parts of the CV">
            {steps.map((item, index) => (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                type="button"
                role="tab"
                className="step"
                aria-selected={item.id === current.id}
                aria-controls={item.id === current.id ? "panel" : undefined}
                tabIndex={item.id === current.id ? 0 : -1}
                data-done={item.done || undefined}
                onClick={() => go(item.id, true)}
                onKeyDown={event => onTabKey(event, index)}
              >
                <span className="step-label">{item.label}</span>
                {item.done && <span className="sr-only"> (filled in)</span>}
              </button>
            ))}
          </div>
        </div>
        <Popover
          label="Add a section"
          align="end"
          menu
          className="menu-wide"
          trigger={({ toggle, ref, open, panelId }) => (
            <button
              ref={ref}
              type="button"
              className="steps-add"
              title="Add a section"
              aria-label="Add a section"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls={open ? panelId : undefined}
              onClick={toggle}
            >
              <Icon name="plus" size={16} />
            </button>
          )}
        >
          {({ close }) =>
            choices.length ? (
              choices.map(choice => (
                <MenuItem
                  key={choice.title}
                  hint={choice.hint}
                  onClick={() => {
                    close();
                    addSection(choice);
                  }}
                >
                  {choice.title}
                </MenuItem>
              ))
            ) : (
              <p className="menu-note">Every kind of section is already on the CV.</p>
            )
          }
        </Popover>
      </div>

      <div
        className="pane"
        role="tabpanel"
        id="panel"
        aria-labelledby={`tab-${current.id}`}
        ref={content}
        data-flow-root=""
        tabIndex={-1}
        key={current.id}
      >
        {current.id === "you" && <YouStep cv={cv} update={update} say={say} photo={photo} />}
        {currentSection && <SectionStep cv={cv} section={currentSection} index={sectionAt} update={update} say={say} />}
        {current.id === "skills" && <SkillsStep cv={cv} update={update} say={say} />}
        {current.id === "languages" && <LanguagesStep cv={cv} update={update} say={say} />}
        {current.id === "summary" && <SummaryStep cv={cv} update={update} lines={summaryLines} />}
      </div>

      <footer className="nav">
        {next ? (
          <button ref={nextButton} type="button" className="btn primary" onClick={() => go(next.id, true)}>
            <span>
              Next: <b>{next.label}</b>
            </span>
            <span className="keys">
              <Key>{mod}</Key>
              <Key>↵</Key>
            </span>
          </button>
        ) : (
          <button ref={nextButton} type="button" className="btn primary center" onClick={onDownload} disabled={busy}>
            <Icon name="download" />
            <span>{busy ? "Making the PDF…" : "Download the PDF"}</span>
          </button>
        )}
        {at > 0 && (
          <button type="button" className="btn quiet back" onClick={() => go(steps[at - 1].id, true)}>
            <Icon name="arrowLeft" />
            <span>Back</span>
          </button>
        )}
      </footer>
    </section>
  );
}
