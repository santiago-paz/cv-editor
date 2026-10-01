"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef } from "react";
import type { Ui } from "@/lib/storage";
import { useT } from "./i18n";
import { Icon } from "./icons";
import { Popover } from "./ui/Popover";
import { Segmented } from "./ui/Segmented";

/* Everything that is not the CV, behind one button: how the editor looks,
   where the CVs live, and the account the AI button needs. The account block
   loads the first time Settings opens. */

function Checking() {
  return <p className="menu-note">{useT().account.checking}</p>;
}

const Account = dynamic(() => import("./Account"), {
  ssr: false,
  loading: () => <Checking />,
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
  const t = useT();
  const file = useRef<HTMLInputElement>(null);

  return (
    <>
      <Popover
        label={t.settings.label}
        align="end"
        className="menu-settings"
        trigger={({ toggle, ref, open, panelId }) => (
          <button
            ref={ref}
            type="button"
            className="iconbtn big"
            aria-label={t.settings.label}
            title={t.settings.label}
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
              <h3 className="menu-label">{t.settings.look}</h3>
              <div className="menu-row">
                <span className="menu-name">{t.settings.theme}</span>
                <Segmented
                  label={t.settings.theme}
                  value={ui.theme ?? "auto"}
                  onChange={value => onUi({ theme: value === "auto" ? undefined : value })}
                  options={[
                    { value: "auto", label: t.settings.auto },
                    { value: "light", label: t.settings.light },
                    { value: "dark", label: t.settings.dark },
                  ]}
                />
              </div>
              <div className="menu-row hide-narrow">
                <span className="menu-name">{t.settings.zoom}</span>
                <Segmented
                  label={t.settings.zoom}
                  value={ui.zoom ?? "fit"}
                  onChange={value => onUi({ zoom: value })}
                  options={[
                    { value: "fit", label: t.settings.fit },
                    { value: "actual", label: t.settings.actualSize },
                  ]}
                />
              </div>
            </div>

            <hr className="menu-rule" />
            <div className="menu-block">
              <h3 className="menu-label">{t.settings.cvs}</h3>
              <p className="menu-note">{tabOnly ? t.settings.tabNote : t.settings.browserNote}</p>
              <label className="switch">
                <input type="checkbox" checked={tabOnly} onChange={event => onTabOnly(event.target.checked)} />
                <span>{t.settings.forget}</span>
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
                  {t.settings.backUp}
                </button>
                <button type="button" className="btn secondary" onClick={() => file.current?.click()}>
                  <Icon name="folder" />
                  {t.settings.restore}
                </button>
              </div>
            </div>

            <hr className="menu-rule" />
            <div className="menu-block">
              <h3 className="menu-label">{t.settings.account}</h3>
              <Account />
            </div>

            <hr className="menu-rule" />
            <p className="menu-links">
              <Link href="/privacy" target="_blank" rel="noopener">
                {t.settings.privacy}
                <span className="sr-only">{t.common.newTab}</span>
              </Link>
              <Link href="/terms" target="_blank" rel="noopener">
                {t.settings.terms}
                <span className="sr-only">{t.common.newTab}</span>
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
