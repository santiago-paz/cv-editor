"use client";

import { cvLabel } from "@/lib/cv/blank";
import { UNTITLED } from "@/lib/cv/defaults";
import type { Cv } from "@/lib/cv/types";
import { LANG_TAGS, type Lang } from "@/lib/i18n";
import type { Dict } from "@/lib/i18n/en";
import { AUTHOR, DONATE_URL } from "@/lib/site";
import { useLang, useT } from "./i18n";
import { Icon } from "./icons";
import { IconButton } from "./ui/bits";
import { Popover } from "./ui/Popover";

/* The CVs in this browser. The button shows the open one by name, and opens
   the list: switch, start a new one, copy one for another job, rename the open
   one. The credit and the Donate link sit at the foot, where the old left rail
   kept them. */

const shortDates: Partial<Record<Lang, Intl.DateTimeFormat>> = {};
const shortDate = (lang: Lang) => (shortDates[lang] ??= new Intl.DateTimeFormat(LANG_TAGS[lang], { day: "numeric", month: "short" }));

/** "just now", "5 min ago", "3 h ago", "2 d ago", then the date. */
export function ago(time: number, t: Dict["cvs"], lang: Lang, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - time) / 1000));
  if (seconds < 60) return t.justNow;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return t.minutesAgo(minutes);
  const hours = Math.round(minutes / 60);
  if (hours < 24) return t.hoursAgo(hours);
  const days = Math.round(hours / 24);
  if (days < 7) return t.daysAgo(days);
  return shortDate(lang).format(time);
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
  const t = useT();
  const lang = useLang();
  const open = cvs.find(cv => cv.id === openId) ?? null;
  const sorted = [...cvs].sort((a, b) => b.updatedAt - a.updatedAt);
  const label = (cv: Cv) => cvLabel(cv, t.cvs.untitled);

  return (
    <Popover
      label={t.cvs.label}
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
          <span className="cvname-text">{open ? label(open) : t.cvs.label}</span>
          <Icon name="down" size={14} />
        </button>
      )}
    >
      {({ close }) => (
        <>
          {open && (
            <div className="menu-block">
              <label className="menu-label" htmlFor="cv-rename">
                {t.cvs.nameLabel}
              </label>
              <input
                id="cv-rename"
                className="plain-input"
                value={open.title === UNTITLED ? "" : open.title}
                placeholder={label(open)}
                spellCheck={false}
                autoComplete="off"
                onChange={event => onRename(event.target.value)}
                onBlur={() => {
                  if (!open.title.trim()) onRename(UNTITLED);
                }}
                onKeyDown={event => {
                  if (event.key === "Enter") close();
                }}
              />
              <p className="menu-note">{t.cvs.nameNote}</p>
            </div>
          )}

          <div className="menu-block tight">
            <div className="menu-head">
              <h3 className="menu-label">{t.cvs.label}</h3>
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
                    <span className="cv-title">{label(cv)}</span>
                    <span className="cv-meta">
                      {cv.sample ? `${t.cvs.sample} · ` : ""}
                      {t.templates[cv.template].name} · {ago(cv.updatedAt, t.cvs, lang)}
                    </span>
                    {cv.id === openId && <Icon name="check" size={15} />}
                  </button>
                  <span className="cv-actions">
                    <IconButton icon="copy" label={t.cvs.copyOf(label(cv))} onClick={() => onDuplicate(cv.id)} />
                    <IconButton icon="trash" label={t.cvs.deleteOf(label(cv))} danger onClick={() => onDelete(cv.id)} />
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
                {t.cvs.new}
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  onSample();
                  close();
                }}
              >
                {t.cvs.trySample}
              </button>
            </div>
          </div>

          <p className="colophon">
            <span>
              {t.cvs.madeBy}{" "}
              {AUTHOR.url ? (
                <a href={AUTHOR.url} target="_blank" rel="noopener">
                  {AUTHOR.name}
                  <span className="sr-only">{t.common.newTab}</span>
                </a>
              ) : (
                AUTHOR.name
              )}
            </span>
            {DONATE_URL && (
              <a className="donate" href={DONATE_URL} target="_blank" rel="noopener">
                <Icon name="heart" size={13} />
                {t.cvs.donate}
                <span className="sr-only">{t.cvs.donateVia}</span>
              </a>
            )}
          </p>
        </>
      )}
    </Popover>
  );
}
