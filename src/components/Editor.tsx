"use client";

import { produce } from "immer";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { blankCv, copyTitle, duplicate } from "@/lib/cv/defaults";
import { guessLocale } from "@/lib/cv/labels";
import { fileName, renderCv } from "@/lib/cv/render";
import { sampleCv } from "@/lib/cv/sample";
import { sanitizeCv } from "@/lib/cv/sanitize-cv";
import { TEMPLATES } from "@/lib/cv/templates";
import type { Cv, Photo } from "@/lib/cv/types";
import { fetchPdf, printCv, saveBlob } from "@/lib/download";
import { sanitize } from "@/lib/sanitize";
import { DONATE_URL } from "@/lib/site";
import {
  backup,
  isTabOnly,
  loadCvs,
  loadPhoto,
  loadUi,
  moveToBrowser,
  moveToTab,
  readBackup,
  saveCvs,
  savePhoto,
  saveUi,
  storageAvailable,
  watch,
  type Ui,
} from "@/lib/storage";
import DesignTab from "./DesignTab";
import DetailsTab from "./DetailsTab";
import { Icon, Mark } from "./icons";
import Library from "./Library";
import PhotoPane from "./PhotoPane";
import Proof, { type Measure } from "./Proof";
import RichToolbar from "./RichToolbar";
import SectionsTab from "./SectionsTab";
import Settings from "./Settings";
import { Toast, useToast } from "./Toast";

type Tab = "details" | "sections" | "design";
type SaveState = { ok: true } | { ok: false; reason: "full" | "unavailable" };

const TABS: { id: Tab; name: string }[] = [
  { id: "details", name: "Details" },
  { id: "sections", name: "Sections" },
  { id: "design", name: "Design" },
];

/* A transparent pixel holds the photo's place while one is being placed on a
   CV that has none yet, so the proof has an image to show it in. */
const NO_PHOTO = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const TIME = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

const newest = (list: Cv[]) => [...list].sort((a, b) => b.updatedAt - a.updatedAt)[0];

/* What the editor starts from: whatever this browser, or this tab, has kept.
   It runs in the browser only (see EditorLoader), so it can read storage
   while the first render is worked out. */
function start() {
  const tabOnly = isTabOnly();
  const available = storageAvailable();
  const stored = available ? loadCvs() : null;
  /* First visit: the sample. A list emptied on purpose stays empty. */
  const cvs = stored ?? [sampleCv()];
  const ui: Ui = available ? loadUi() : {};
  const first = cvs.find(cv => cv.id === ui.openId) ?? newest(cvs);
  return {
    tabOnly,
    available,
    loaded: stored !== null,
    cvs,
    photo: available ? loadPhoto() : null,
    ui,
    openId: first?.id ?? null,
    open: first?.sections[0] ? { [first.sections[0].id]: true } : {},
  };
}

export default function Editor() {
  const [boot] = useState(start);
  const [cvs, setCvs] = useState<Cv[]>(boot.cvs);
  const [openId, setOpenId] = useState<string | null>(boot.openId);
  const [photo, setPhoto] = useState<Photo | null>(boot.photo);
  const [tab, setTab] = useState<Tab>("details");
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [ui, setUi] = useState<Ui>(boot.ui);
  const [saved, setSaved] = useState<SaveState>(boot.available ? { ok: true } : { ok: false, reason: "unavailable" });
  const [measure, setMeasure] = useState<Measure | null>(null);
  const [placing, setPlacing] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>(boot.open);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ text: string; bad?: boolean } | null>(null);
  const [tabOnly, setTabOnly] = useState(boot.tabOnly);
  const toast = useToast();
  /* The first PDF of a visit mentions donations. Later ones do not. */
  const askedToDonate = useRef(false);

  const openRef = useRef(openId);
  const cvsRef = useRef(cvs);
  useLayoutEffect(() => {
    openRef.current = openId;
    cvsRef.current = cvs;
  });
  /* Set when the list came from storage, so it is not written straight back. */
  const fromStorage = useRef(boot.loaded);
  const pendingSave = useRef<number>(0);

  /* Another tab of the editor changed the CVs or the photo. */
  useEffect(
    () =>
      watch(what => {
        if (what === "photo") {
          setPhoto(loadPhoto());
          return;
        }
        const list = loadCvs();
        if (!list) return;
        fromStorage.current = true;
        setCvs(list);
        if (!list.some(cv => cv.id === openRef.current)) setOpenId(list[0]?.id ?? null);
      }),
    [],
  );

  /* ------------------------------------------------------------- saving */

  const flush = useCallback(() => {
    window.clearTimeout(pendingSave.current);
    pendingSave.current = 0;
    const result = saveCvs(cvsRef.current);
    setSaved(result.ok ? { ok: true } : result);
  }, []);

  useEffect(() => {
    if (fromStorage.current) {
      fromStorage.current = false;
      return;
    }
    window.clearTimeout(pendingSave.current);
    pendingSave.current = window.setTimeout(flush, 250);
  }, [cvs, flush]);

  useEffect(() => {
    const onHide = () => {
      if (pendingSave.current) flush();
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [flush]);

  const setPrefs = useCallback((change: Partial<Ui>) => {
    setUi(current => ({ ...current, ...change }));
    saveUi(change);
  }, []);

  /* A reload comes back to the CV that was open. */
  useEffect(() => {
    if (openId) saveUi({ openId });
  }, [openId]);

  useEffect(() => {
    const root = document.documentElement;
    if (ui.theme) root.dataset.theme = ui.theme;
    else delete root.dataset.theme;
  }, [ui.theme]);

  /* The folded CV list is drawn from the root, like the theme, so the page
     that loads before the editor folds it too. */
  const listShown = ui.library !== "collapsed";
  useEffect(() => {
    const root = document.documentElement;
    if (listShown) delete root.dataset.library;
    else root.dataset.library = "collapsed";
  }, [listShown]);

  /* ------------------------------------------------------------ the CV */

  const cv = cvs.find(item => item.id === openId) ?? null;
  const template = TEMPLATES[cv?.template ?? "sidebar"];

  const update = useCallback((recipe: (draft: Cv) => void) => {
    setCvs(list =>
      list.map(item =>
        item.id === openRef.current
          ? produce(item, draft => {
              recipe(draft);
              draft.updatedAt = Date.now();
              draft.sample = undefined;
            })
          : item,
      ),
    );
  }, []);

  const rendered = useMemo(() => {
    if (!cv) return null;
    const printed = placing ? photo?.src || NO_PHOTO : (photo?.src ?? null);
    return renderCv(cv, { photo: printed, annotate: true });
  }, [cv, photo, placing]);

  const { show } = toast;
  const say = useCallback(
    (text: string, undo?: () => void) => show(text, undo ? { action: { label: "Undo", run: undo } } : {}),
    [show],
  );

  /* ------------------------------------------------------------ library */

  function openCv(id: string) {
    setView("edit");
    /* The open CV is already measured; clearing its gauges here would leave
       them blank, since nothing changes to measure it again. */
    if (id === openId) return;
    setOpenId(id);
    setMeasure(null);
    setNote(null);
    const target = cvs.find(item => item.id === id);
    if (target?.sections[0]) setOpen({ [target.sections[0].id]: true });
    setView("edit");
  }

  function addCv(made: Cv, focus = true) {
    setCvs(list => [made, ...list]);
    setOpenId(made.id);
    setOpen(made.sections[0] ? { [made.sections[0].id]: true } : {});
    setMeasure(null);
    setTab("details");
    setView("edit");
    if (focus) {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => document.querySelector<HTMLInputElement>('[data-field="person.name"]')?.focus()),
      );
    }
  }

  function newCv() {
    addCv(blankCv(guessLocale(navigator.language)));
  }

  function duplicateCv(id: string) {
    const source = cvs.find(item => item.id === id);
    if (!source) return;
    const copy = duplicate(
      source,
      copyTitle(
        source.title,
        cvs.map(item => item.title),
      ),
    );
    addCv(copy, false);
    say(`Made a copy called “${copy.title}”. The original stays as it was.`);
  }

  function deleteCv(id: string) {
    const index = cvs.findIndex(item => item.id === id);
    const gone = cvs[index];
    if (!gone) return;
    const rest = cvs.filter(item => item.id !== id);
    setCvs(rest);
    if (openId === id) {
      const next = [...rest].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      setOpenId(next?.id ?? null);
      setMeasure(null);
    }
    say(`Deleted “${gone.title}”.`, () => {
      setCvs(list => {
        const copy = [...list];
        copy.splice(Math.min(index, copy.length), 0, gone);
        return copy;
      });
      setOpenId(gone.id);
    });
  }

  function backUp() {
    const stamp = new Date().toISOString().slice(0, 10);
    saveBlob(new Blob([backup(cvs, photo)], { type: "application/json" }), `cv-editor-backup-${stamp}.json`);
    say(`Saved a backup of ${cvs.length} ${cvs.length === 1 ? "CV" : "CVs"}. Open it with Restore, in this browser or another.`);
  }

  async function restore(file: File) {
    try {
      const found = readBackup(await file.text());
      /* The file came from outside: its rich text goes through the same
         sanitizer as anything typed. */
      found.cvs.forEach(item => sanitizeCv(item, sanitize));
      let added = 0;
      let replaced = 0;
      let kept = 0;
      const next = [...cvs];
      for (const item of found.cvs) {
        const at = next.findIndex(existing => existing.id === item.id);
        if (at === -1) {
          next.push(item);
          added++;
        } else if (item.updatedAt > next[at].updatedAt) {
          next[at] = item;
          replaced++;
        } else kept++;
      }
      setCvs(next);
      if (!openId && next[0]) setOpenId(next[0].id);
      let photoNote = "";
      if (found.photo && !photo) {
        setPhoto(found.photo);
        savePhoto(found.photo);
        photoNote = " The photo came back too.";
      }
      const changed = [added && `${added} added`, replaced && `${replaced} updated`].filter(Boolean);
      const stayed = kept
        ? ` ${kept} stayed as ${kept === 1 ? "it was, because the copy" : "they were, because the copies"} here ${kept === 1 ? "is" : "are"} newer.`
        : "";
      say(`Restored the backup${changed.length ? `: ${changed.join(", ")}` : ""}.${stayed}${photoNote}`);
    } catch (error) {
      say(error instanceof Error ? error.message : "Could not read that backup.");
    }
  }

  /* -------------------------------------------------------------- photo */

  function keepPhoto(next: Photo | null) {
    setPhoto(next);
    const result = savePhoto(next);
    if (!result.ok) {
      say(
        result.reason === "full"
          ? "This browser's storage is full, so the photo is not saved. Delete some CVs, or use a smaller photo."
          : "This browser does not let the editor save, so the photo lasts until you close the tab.",
      );
    } else if ("dropped" in result && result.dropped) {
      say("Saved the photo. The original did not fit in storage, so a later adjustment starts from the crop.");
    }
  }

  /* ------------------------------------------------- where the CVs live */

  function chooseTabOnly(on: boolean) {
    /* A save still waiting would land in the store being left. The move
       takes the latest list itself. */
    window.clearTimeout(pendingSave.current);
    pendingSave.current = 0;
    if (on) {
      const result = moveToTab(cvsRef.current, photo);
      if (!result.ok) {
        say(
          result.reason === "full"
            ? "This tab has no room for your CVs, so they stay saved in this browser."
            : "This browser does not let a tab keep its own copy, so your CVs stay saved in the browser.",
        );
        return;
      }
      setTabOnly(true);
      setSaved({ ok: true });
      toast.show("This tab now forgets your CVs when you close it. Back up any you want to keep.", {
        action: { label: "Back up", run: backUp },
        ms: 9000,
      });
      return;
    }
    const moved = moveToBrowser(cvsRef.current, photo);
    if (!moved.result.ok) {
      say(
        moved.result.reason === "full"
          ? "This browser's storage is full, so your CVs stay in this tab only. Delete some CVs, or back them up."
          : "This browser does not let the editor save, so your CVs stay in this tab only.",
      );
      return;
    }
    setTabOnly(false);
    fromStorage.current = true;
    setCvs(moved.cvs);
    setSaved({ ok: true });
    say("Your CVs are saved in this browser again.");
  }

  /* ---------------------------------------------------------- download */

  async function download() {
    if (!cv || busy) return;
    setBusy(true);
    setNote({ text: "Making the PDF…" });
    try {
      const blob = await fetchPdf(cv, photo?.src ?? null);
      const name = fileName(cv);
      saveBlob(blob, name);
      setNote({ text: `Downloaded ${name}` });
      if (DONATE_URL && !askedToDonate.current) {
        askedToDonate.current = true;
        toast.show(`Downloaded ${name}. If the editor helped, you can support it with a donation.`, {
          action: { label: "Donate", href: DONATE_URL },
          ms: 10_000,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "The PDF could not be made.";
      setNote({ text: message, bad: true });
      toast.show(`${message} Your browser can print it to PDF instead.`, {
        action: { label: "Print instead", run: () => printCv(cv, cv.showPhoto ? (photo?.src ?? null) : null) },
        ms: 10_000,
      });
    } finally {
      setBusy(false);
    }
  }

  /* Cmd/Ctrl+S would save the page's HTML, and Cmd/Ctrl+P would print the
     editor itself. Neither is what anyone pressing them wants here. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === "s") {
        event.preventDefault();
        flush();
        toast.show(`Saved in this ${tabOnly ? "tab" : "browser"}. Everything saves as you type.`);
      }
      if (key === "p" && cv) {
        event.preventDefault();
        printCv(cv, cv.showPhoto ? (photo?.src ?? null) : null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cv, photo, flush, toast, tabOnly]);

  /* ---------------------------------------------------- click to edit */

  function focusPath(path: string) {
    const destination: Tab = path.startsWith("sections.") ? "sections" : "details";
    setTab(destination);
    setView("edit");
    if (destination === "sections") {
      const id = path.split(".")[1];
      setOpen(current => ({ ...current, [id]: true }));
    }
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const quote = (value: string) => value.replace(/"/g, '\\"');
        let found: HTMLElement | null = null;
        const parts = path.split(".");
        while (!found && parts.length) {
          const at = quote(parts.join("."));
          found =
            document.querySelector<HTMLElement>(`[data-field="${at}"]`) ??
            document.querySelector<HTMLElement>(`[data-field^="${at}."]`);
          parts.pop();
        }
        if (!found) return;
        const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
        found.scrollIntoView({ block: "center", behavior: still ? "auto" : "smooth" });
        found.focus({ preventScroll: true });
        found.classList.remove("found");
        void found.offsetWidth;
        found.classList.add("found");
      }),
    );
  }

  /* ------------------------------------------------------------ layout */

  const pages = measure?.count ?? 0;
  const over = pages > template.pages;
  const fill = measure ? Math.round(measure.lastFill * 100) : 0;
  const fillTone = !measure ? "" : measure.lastFill > 0.94 ? "bad" : measure.lastFill > 0.86 ? "warn" : "ok";
  const wasteTone = !measure ? "" : measure.stranded || measure.worstDead > 25 ? "warn" : "ok";
  const photoUsers = cvs.filter(item => item.showPhoto).length;

  /* The header already says the CVs stay in the browser, so a plain save
     needs one word. Only the tab that forgets says where. */
  const savedText = saved.ok
    ? tabOnly
      ? "Saved in this tab"
      : "Saved"
    : saved.reason === "full"
      ? "Not saved: storage is full"
      : "Not saved: this browser blocks storage";

  return (
    <div className="app" data-view={view}>
      <a className="skip-link" href="#preview">
        Skip to the preview
      </a>

      <header className="top">
        <button
          type="button"
          className="iconbtn rail-toggle"
          aria-label="Your CVs"
          title={listShown ? "Hide your CVs" : "Show your CVs"}
          aria-expanded={listShown}
          aria-controls="library"
          onClick={() => setPrefs({ library: listShown ? "collapsed" : undefined })}
        >
          <Icon name="rail" />
        </button>
        <h1 className="mark">
          <Mark /> CV Editor <s className="hide-narrow">/ no account, saved in your browser</s>
        </h1>
        <div className="views" role="group" aria-label="Show">
          <button type="button" aria-pressed={view === "edit"} onClick={() => setView("edit")}>
            Edit
          </button>
          <button type="button" aria-pressed={view === "preview"} onClick={() => setView("preview")}>
            Preview
          </button>
        </div>
        <div className="top-end">
          <span className={"saved " + (saved.ok ? "ok" : "bad")} role="status" aria-live="polite">
            {savedText}
          </span>
          <Settings
            ui={ui}
            onUi={setPrefs}
            count={cvs.length}
            tabOnly={tabOnly}
            onTabOnly={chooseTabOnly}
            onBackup={backUp}
            onRestore={file => void restore(file)}
          />
        </div>
      </header>

      <Library
        cvs={cvs}
        openId={openId}
        onOpen={openCv}
        onNew={newCv}
        onDuplicate={duplicateCv}
        onDelete={deleteCv}
      />

      {cv && rendered ? (
        <Proof
          rendered={rendered}
          template={template}
          zoom={ui.zoom ?? "fit"}
          photoOverride={placing}
          onMeasure={setMeasure}
          onPick={focusPath}
        />
      ) : (
        <main className="stage" id="preview" aria-label="Preview">
          <div className="empty-state">
            <h2>No CVs yet</h2>
            <p>Start a blank one, or open the sample to see how the editor works.</p>
            <div className="buttons">
              <button type="button" className="save" onClick={newCv}>
                New CV
              </button>
              <button type="button" className="tog" onClick={() => addCv(sampleCv(), false)}>
                Open the sample
              </button>
            </div>
          </div>
        </main>
      )}

      <aside className="rail-right" aria-label="Edit the CV">
        {cv && (
          <>
            <div className="open-on">
              <label className="sr-only" htmlFor="cvTitle">
                CV name
              </label>
              <input
                id="cvTitle"
                className="co"
                value={cv.title}
                spellCheck={false}
                autoComplete="off"
                onChange={event =>
                  update(draft => {
                    draft.title = event.target.value;
                  })
                }
                onBlur={() => {
                  if (!cv.title.trim())
                    update(draft => {
                      draft.title = "Untitled CV";
                    });
                }}
              />
              <p className="open-meta">
                {template.name} · {pages ? `${pages} ${pages === 1 ? "page" : "pages"}` : "measuring"} · edited{" "}
                {TIME.format(cv.updatedAt)}
              </p>
              {cv.sample && (
                <p className="sample-note">
                  This is a sample. Type your own details over it, or start from an empty CV.
                  <br />
                  <button type="button" onClick={newCv}>
                    Start a blank CV
                  </button>
                </p>
              )}
              <div className="tabs" role="tablist" aria-label="Parts of the CV">
                {TABS.map((item, index) => (
                  <button
                    key={item.id}
                    id={`tab-${item.id}`}
                    type="button"
                    role="tab"
                    className="tab"
                    aria-selected={tab === item.id}
                    aria-controls={tab === item.id ? `panel-${item.id}` : undefined}
                    tabIndex={tab === item.id ? 0 : -1}
                    onClick={() => setTab(item.id)}
                    onKeyDown={event => {
                      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                      const step = event.key === "ArrowRight" ? 1 : -1;
                      const next = TABS[(index + step + TABS.length) % TABS.length];
                      setTab(next.id);
                      requestAnimationFrame(() => document.getElementById(`tab-${next.id}`)?.focus());
                    }}
                  >
                    {item.name}
                    {item.id === "sections" && <span className="n">{cv.sections.length}</span>}
                  </button>
                ))}
              </div>
            </div>

            {tab === "details" && (
              <DetailsTab
                cv={cv}
                update={update}
                template={template}
                summaryLines={measure?.summaryLines ?? null}
                toast={say}
                photo={
                  <PhotoPane
                    photo={photo}
                    template={template}
                    shown={cv.showPhoto}
                    users={photoUsers}
                    total={cvs.length}
                    onShown={on =>
                      update(draft => {
                        draft.showPhoto = on;
                      })
                    }
                    onSave={next => {
                      keepPhoto(next);
                      if (!cv.showPhoto)
                        update(draft => {
                          draft.showPhoto = true;
                        });
                      say("Saved the photo.");
                    }}
                    onRemove={() => {
                      const before = photo;
                      keepPhoto(null);
                      say("Removed the photo from every CV.", () => keepPhoto(before));
                    }}
                    onPreview={setPlacing}
                    onError={message => say(message)}
                  />
                }
              />
            )}
            {tab === "sections" && (
              <SectionsTab
                cv={cv}
                update={update}
                open={open}
                setOpen={(id, on) => setOpen(current => ({ ...current, [id]: on }))}
                toast={say}
              />
            )}
            {tab === "design" && <DesignTab cv={cv} update={update} />}
          </>
        )}
      </aside>

      <footer className="foot">
        <div className={"gauge " + (measure ? (over ? "bad" : "ok") : "")} title={`${template.name} is meant for ${template.pages === 1 ? "one page" : `up to ${template.pages} pages`}.`}>
          <span>Pages</span> <b>{measure ? (over ? `${pages} · over by ${pages - template.pages}` : pages) : "-"}</b>
        </div>
        <div className={"gauge " + fillTone}>
          <span>{measure ? `Page ${pages}` : "Last page"}</span> <b>{measure ? `${fill}% full` : "-"}</b>
          <span className="bar" aria-hidden="true">
            <i style={{ transform: `scaleX(${fill / 100})` }} />
          </span>
        </div>
        {measure && pages > 1 && (
          <div className={"gauge " + wasteTone} title="Paper left empty at the foot of a page because the next entry did not fit.">
            <span>Wasted at cut</span>{" "}
            <b>
              {measure.worstDead < 1 ? "flush" : `${Math.round(measure.worstDead)}mm`}
              {measure.stranded ? " · heading stranded" : ""}
            </b>
          </div>
        )}
        <div className={"note" + (note?.bad ? " bad" : "")} role="status" aria-live="polite">
          {note?.text}
        </div>
        <button type="button" className="save" onClick={() => void download()} disabled={!cv || busy}>
          <Icon name="download" />
          {busy ? "Making PDF…" : "Download PDF"}
        </button>
      </footer>

      <RichToolbar />
      <Toast message={toast.message} onDone={toast.hide} />
    </div>
  );
}
