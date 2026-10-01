"use client";

import type { Cv } from "@/lib/cv/types";
import type { Ui } from "@/lib/storage";
import CvMenu from "./CvMenu";
import DownloadMenu, { type PdfControls } from "./DownloadMenu";
import { Icon, Mark } from "./icons";
import SettingsMenu from "./SettingsMenu";
import StyleMenu from "./StyleMenu";
import type { Update } from "./types";

/* The bar across the top: what the editor is, which CV is open, whether it is
   saved, and the two things you do with a CV: change how it looks, and get the
   PDF. Everything else is one click away in a menu. */

export default function TopBar({
  cv,
  cvs,
  update,
  saved,
  tabOnly,
  ui,
  onUi,
  pdf,
  onOpen,
  onNew,
  onSample,
  onDuplicate,
  onDelete,
  onRename,
  onTabOnly,
  onBackup,
  onRestore,
}: {
  cv: Cv | null;
  cvs: Cv[];
  update: Update;
  saved: { ok: true } | { ok: false; reason: "full" | "unavailable" };
  tabOnly: boolean;
  ui: Ui;
  onUi: (change: Partial<Ui>) => void;
  pdf: PdfControls;
  onOpen: (id: string) => void;
  onNew: () => void;
  onSample: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (title: string) => void;
  onTabOnly: (on: boolean) => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
}) {
  /* Everything saves as you type, so a plain save needs one word. Only the tab
     that forgets says where, and a failure says why. */
  const savedText = saved.ok
    ? tabOnly
      ? "Saved in this tab"
      : "Saved"
    : saved.reason === "full"
      ? "Not saved: storage is full"
      : "Not saved: this browser blocks storage";

  return (
    <header className="topbar">
      <h1 className="brand">
        <Mark />
        <span className="brand-name">
          <span className="brand-cv">CV</span> Editor
        </span>
      </h1>

      <CvMenu
        cvs={cvs}
        openId={cv?.id ?? null}
        onOpen={onOpen}
        onNew={onNew}
        onSample={onSample}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onRename={onRename}
      />

      <div className="bar-end">
        <span className={"saved " + (saved.ok ? "ok" : "bad")} role="status" aria-live="polite">
          <Icon name={saved.ok ? "check" : "alert"} size={14} />
          <span className="saved-text">{savedText}</span>
        </span>
        {cv && <StyleMenu cv={cv} update={update} />}
        <SettingsMenu
          ui={ui}
          onUi={onUi}
          count={cvs.length}
          tabOnly={tabOnly}
          onTabOnly={onTabOnly}
          onBackup={onBackup}
          onRestore={onRestore}
        />
        <DownloadMenu pdf={pdf} disabled={!cv} />
      </div>
    </header>
  );
}
