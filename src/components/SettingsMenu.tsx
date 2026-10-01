"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef } from "react";
import type { Ui } from "@/lib/storage";
import { Icon } from "./icons";
import { Popover } from "./ui/Popover";
import { Segmented } from "./ui/Segmented";

/* Everything that is not the CV, behind one button: how the editor looks,
   where the CVs live, and the account the AI button needs. The account block
   loads the first time Settings opens. */

const Account = dynamic(() => import("./Account"), {
  ssr: false,
  loading: () => <p className="menu-note">Checking your account…</p>,
});

export default function SettingsMenu({
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
  const file = useRef<HTMLInputElement>(null);

  return (
    <>
      <Popover
        label="Settings"
        align="end"
        className="menu-settings"
        trigger={({ toggle, ref, open, panelId }) => (
          <button
            ref={ref}
            type="button"
            className="iconbtn big"
            aria-label="Settings"
            title="Settings"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
            onClick={toggle}
          >
            <Icon name="sliders" size={18} />
          </button>
        )}
      >
        {({ close }) => (
          <>
            <div className="menu-block">
              <h3 className="menu-label">Look</h3>
              <div className="menu-row">
                <span className="menu-name">Theme</span>
                <Segmented
                  label="Theme"
                  value={ui.theme ?? "auto"}
                  onChange={value => onUi({ theme: value === "auto" ? undefined : value })}
                  options={[
                    { value: "auto", label: "Auto" },
                    { value: "light", label: "Light" },
                    { value: "dark", label: "Dark" },
                  ]}
                />
              </div>
              <div className="menu-row hide-narrow">
                <span className="menu-name">Zoom</span>
                <Segmented
                  label="Zoom"
                  value={ui.zoom ?? "fit"}
                  onChange={value => onUi({ zoom: value })}
                  options={[
                    { value: "fit", label: "Fit" },
                    { value: "actual", label: "100%" },
                  ]}
                />
              </div>
            </div>

            <hr className="menu-rule" />
            <div className="menu-block">
              <h3 className="menu-label">Your CVs</h3>
              <p className="menu-note">
                {tabOnly
                  ? "Your CVs and photo stay in this tab only. Closing it deletes them, so back up any you want to keep."
                  : "Your CVs are saved in this browser only. Clearing its site data deletes them, so keep a backup."}
              </p>
              <label className="switch">
                <input type="checkbox" checked={tabOnly} onChange={event => onTabOnly(event.target.checked)} />
                <span>Forget my CVs when I close this tab</span>
              </label>
              <div className="menu-buttons">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => {
                    onBackup();
                    close();
                  }}
                  disabled={!count}
                >
                  <Icon name="download" />
                  Back up
                </button>
                <button type="button" className="btn secondary" onClick={() => file.current?.click()}>
                  <Icon name="folder" />
                  Restore
                </button>
              </div>
            </div>

            <hr className="menu-rule" />
            <div className="menu-block">
              <h3 className="menu-label">Account</h3>
              <Account />
            </div>

            <hr className="menu-rule" />
            <p className="menu-links">
              <Link href="/privacy" target="_blank" rel="noopener">
                Privacy
                <span className="sr-only"> (opens in a new tab)</span>
              </Link>
              <Link href="/terms" target="_blank" rel="noopener">
                Terms
                <span className="sr-only"> (opens in a new tab)</span>
              </Link>
            </p>
          </>
        )}
      </Popover>
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
    </>
  );
}
