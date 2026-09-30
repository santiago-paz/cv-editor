"use client";

import { useEffect, useRef, useState } from "react";
import type { Ui } from "@/lib/storage";

/* Everything that is not the CV, behind one button in the header: how the
   editor looks, and where the CVs live. */

type Option<T extends string> = { value: T; label: string };

const THEMES: Option<"auto" | "light" | "dark">[] = [
  { value: "auto", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const ZOOMS: Option<"fit" | "actual">[] = [
  { value: "fit", label: "Fit" },
  { value: "actual", label: "100%" },
];

export default function Settings({
  ui,
  onUi,
  count,
  tabOnly,
  onTabOnly,
  onBackup,
  onRestore,
}: {
  ui: Ui;
  onUi: (change: Partial<Ui>) => void;
  /** How many CVs there are. With none, there is nothing to back up. */
  count: number;
  /** True when this tab forgets its CVs as it closes. */
  tabOnly: boolean;
  onTabOnly: (on: boolean) => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div
      className="settings"
      ref={wrap}
      onKeyDown={event => {
        if (event.key !== "Escape" || !open) return;
        setOpen(false);
        button.current?.focus();
      }}
    >
      <button
        ref={button}
        type="button"
        className="tog"
        aria-expanded={open}
        aria-controls="settings"
        onClick={() => setOpen(on => !on)}
      >
        Settings
      </button>
      <div className="settings-panel" id="settings" role="group" aria-label="Settings" hidden={!open}>
        <Choice
          label="Theme"
          name="theme"
          options={THEMES}
          value={ui.theme ?? "auto"}
          onChange={value => onUi({ theme: value === "auto" ? undefined : value })}
        />
        <Choice
          label="Zoom"
          name="zoom"
          options={ZOOMS}
          value={ui.zoom ?? "fit"}
          onChange={value => onUi({ zoom: value })}
          narrow={false}
        />
        <hr />
        <p className="settings-note">
          {tabOnly
            ? "Your CVs and photo stay in this tab only. Closing it deletes them, so back up any you want to keep."
            : "Your CVs are saved in this browser only. Clearing its site data deletes them, so keep a backup."}
        </p>
        <label className="switch">
          <input type="checkbox" checked={tabOnly} onChange={event => onTabOnly(event.target.checked)} />
          Forget my CVs when I close this tab
        </label>
        <div className="buttons">
          <button type="button" className="tog" onClick={onBackup} disabled={!count}>
            Back up
          </button>
          <button type="button" className="tog" onClick={() => file.current?.click()}>
            Restore
          </button>
        </div>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={event => {
            const picked = event.target.files?.[0];
            event.target.value = "";
            if (picked) onRestore(picked);
          }}
        />
      </div>
    </div>
  );
}

/** A row of options drawn as one segmented control. They stay real radio
    buttons, so the arrow keys move between them. */
function Choice<T extends string>({
  label,
  name,
  options,
  value,
  onChange,
  narrow = true,
}: {
  label: string;
  name: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** False hides the row on narrow screens, where it does nothing. */
  narrow?: boolean;
}) {
  const id = `setting-${name}`;
  return (
    <div className={"setting" + (narrow ? "" : " hide-narrow")}>
      <span className="setting-name" id={id}>
        {label}
      </span>
      <div className="seg" role="radiogroup" aria-labelledby={id}>
        {options.map(option => (
          <label key={option.value}>
            <input
              type="radio"
              name={id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
