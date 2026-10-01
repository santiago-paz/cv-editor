"use client";

import { cvLabel } from "@/lib/cv/blank";
import { TEMPLATES } from "@/lib/cv/templates";
import type { Cv } from "@/lib/cv/types";
import { AUTHOR, DONATE_URL } from "@/lib/site";
import { Icon } from "./icons";
import { IconButton } from "./ui/bits";
import { Popover } from "./ui/Popover";

/* The CVs in this browser. The button shows the open one by name, and opens
   the list: switch, start a new one, copy one for another job, rename the open
   one. The credit and the Donate link sit at the foot, where the old left rail
   kept them. */

const SHORT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

/** "just now", "5 min ago", "3 h ago", "2 d ago", then the date. */
export function ago(time: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - time) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  return SHORT.format(time);
}

export default function CvMenu({
  cvs,
  openId,
  onOpen,
  onNew,
  onSample,
  onDuplicate,
  onDelete,
  onRename,
}: {
  cvs: Cv[];
  openId: string | null;
  onOpen: (id: string) => void;
  onNew: () => void;
  onSample: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (title: string) => void;
}) {
  const open = cvs.find(cv => cv.id === openId) ?? null;
  const sorted = [...cvs].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <Popover
      label="Your CVs"
      className="menu-cvs"
      trigger={({ toggle, ref, open: shown, panelId }) => (
        <button
          ref={ref}
          type="button"
          className="cvname"
          aria-haspopup="dialog"
          aria-expanded={shown}
          aria-controls={shown ? panelId : undefined}
          onClick={toggle}
        >
          <span className="cvname-text">{open ? cvLabel(open) : "Your CVs"}</span>
          <Icon name="down" size={14} />
        </button>
      )}
    >
      {({ close }) => (
        <>
          {open && (
            <div className="menu-block">
              <label className="menu-label" htmlFor="cv-rename">
                Name of this CV
              </label>
              <input
                id="cv-rename"
                className="plain-input"
                value={open.title === "Untitled CV" ? "" : open.title}
                placeholder={cvLabel(open)}
                spellCheck={false}
                autoComplete="off"
                onChange={event => onRename(event.target.value)}
                onBlur={() => {
                  if (!open.title.trim()) onRename("Untitled CV");
                }}
                onKeyDown={event => {
                  if (event.key === "Enter") close();
                }}
              />
              <p className="menu-note">Only you see this name. It is never printed. Leave it empty to use your own name.</p>
            </div>
          )}

          <div className="menu-block tight">
            <div className="menu-head">
              <h3 className="menu-label">Your CVs</h3>
              <span className="menu-count">{cvs.length}</span>
            </div>
            <ul className="cv-list">
              {sorted.map(cv => (
                <li key={cv.id} className={"cv-item" + (cv.id === openId ? " on" : "")}>
                  <button
                    type="button"
                    className="cv-open"
                    aria-current={cv.id === openId ? "true" : undefined}
                    data-autofocus={cv.id === openId ? "" : undefined}
                    onClick={() => {
                      onOpen(cv.id);
                      close();
                    }}
                  >
                    <span className="cv-title">{cvLabel(cv)}</span>
                    <span className="cv-meta">
                      {cv.sample ? "Sample · " : ""}
                      {TEMPLATES[cv.template].name} · {ago(cv.updatedAt)}
                    </span>
                    {cv.id === openId && <Icon name="check" size={15} />}
                  </button>
                  <span className="cv-actions">
                    <IconButton icon="copy" label={`Make a copy of ${cvLabel(cv)}`} onClick={() => onDuplicate(cv.id)} />
                    <IconButton icon="trash" label={`Delete ${cvLabel(cv)}`} danger onClick={() => onDelete(cv.id)} />
                  </span>
                </li>
              ))}
            </ul>
            <div className="menu-buttons">
              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  onNew();
                  close(false);
                }}
              >
                <Icon name="plus" />
                New CV
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  onSample();
                  close();
                }}
              >
                Try the sample
              </button>
            </div>
          </div>

          <p className="colophon">
            <span>
              Made by{" "}
              {AUTHOR.url ? (
                <a href={AUTHOR.url} target="_blank" rel="noopener">
                  {AUTHOR.name}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                AUTHOR.name
              )}
            </span>
            {DONATE_URL && (
              <a className="donate" href={DONATE_URL} target="_blank" rel="noopener">
                <Icon name="heart" size={13} />
                Donate
                <span className="sr-only"> with PayPal (opens in a new tab)</span>
              </a>
            )}
          </p>
        </>
      )}
    </Popover>
  );
}
