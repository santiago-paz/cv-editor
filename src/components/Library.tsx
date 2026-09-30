"use client";

import { useRef } from "react";
import type { Cv } from "@/lib/cv/types";
import { IconButton } from "./fields";

/* The CVs in this browser, grouped by the day each was last changed. */

function dayKey(time: number): string {
  const day = new Date(time);
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
}

const DAY = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });
const TIME = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

function dayLabel(key: string, now: Date): string {
  if (key === dayKey(now.getTime())) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (key === dayKey(yesterday.getTime())) return "Yesterday";
  const [year, month, date] = key.split("-").map(Number);
  return DAY.format(new Date(year, month - 1, date));
}

export default function Library({
  cvs,
  openId,
  onOpen,
  onNew,
  onDuplicate,
  onDelete,
  onBackup,
  onRestore,
}: {
  cvs: Cv[];
  openId: string | null;
  onOpen: (id: string) => void;
  onNew: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
}) {
  const file = useRef<HTMLInputElement>(null);
  const now = new Date();
  const sorted = [...cvs].sort((a, b) => b.updatedAt - a.updatedAt);
  const groups: { key: string; items: Cv[] }[] = [];
  for (const cv of sorted) {
    const key = dayKey(cv.updatedAt);
    const group = groups[groups.length - 1];
    if (group?.key === key) group.items.push(cv);
    else groups.push({ key, items: [cv] });
  }

  return (
    <nav className="rail-left" aria-label="Your CVs">
      <div className="lib-head">
        <h2>Your CVs</h2>
        <span className="count">{cvs.length}</span>
      </div>
      <button type="button" className="add" onClick={onNew}>
        <span className="plus" aria-hidden="true">+</span> New CV
      </button>

      {groups.map(group => (
        <div key={group.key} role="group" aria-label={dayLabel(group.key, now)}>
          <div className="group-label" aria-hidden="true">
            <b>{dayLabel(group.key, now)}</b>
            <span className="count" style={{ marginLeft: "auto" }}>
              {group.items.length}
            </span>
          </div>
          {group.items.map(cv => (
            <div key={cv.id} className="cv-row">
              <button
                type="button"
                className={"cv-item" + (cv.sample ? " sample" : "")}
                aria-current={cv.id === openId ? "true" : undefined}
                title={cv.sample ? `${cv.title} (the sample)` : cv.title}
                onClick={() => onOpen(cv.id)}
              >
                <span className="dot" aria-hidden="true" />
                <span className="who">{cv.title}</span>
                <span className="when">{TIME.format(cv.updatedAt)}</span>
              </button>
              <span className="row-actions">
                <IconButton icon="copy" label={`Duplicate ${cv.title}`} onClick={() => onDuplicate(cv.id)} />
                <IconButton icon="close" label={`Delete ${cv.title}`} danger onClick={() => onDelete(cv.id)} />
              </span>
            </div>
          ))}
        </div>
      ))}

      <div className="lib-foot">
        <p className="lib-note">
          Your CVs are saved in this browser only. Clearing its site data deletes them, so keep a backup.
        </p>
        <div className="buttons">
          <button type="button" className="tog" onClick={onBackup} disabled={!cvs.length}>
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
    </nav>
  );
}
