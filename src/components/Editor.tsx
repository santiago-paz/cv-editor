"use client";

import { produce } from "immer";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { cvLabel, exampleFor, isBlank } from "@/lib/cv/blank";
import { DEFAULT_ACCENT, UNTITLED, blankCv, copyTitle, duplicate } from "@/lib/cv/defaults";
import { guessLocale } from "@/lib/cv/labels";
import { fileName, renderCv } from "@/lib/cv/render";
import { sampleCv } from "@/lib/cv/sample";
import { sanitizeCv } from "@/lib/cv/sanitize-cv";
import { TEMPLATES } from "@/lib/cv/templates";
import type { Cv, Photo } from "@/lib/cv/types";
import { defaultWay, fetchPdf, printCv, saveBlob } from "@/lib/download";
import { backupMessage, pdfMessage } from "@/lib/i18n/errors";
import { sanitize } from "@/lib/sanitize";
import { returnedFromSignIn, whoIsSignedIn } from "@/lib/sign-in";
import { DONATE_URL } from "@/lib/site";
import { catalogOf } from "@/lib/suggest/catalog";
import { historyOf } from "@/lib/suggest/history";
import { makeSuggesters } from "@/lib/suggest/sources";
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
import type { PdfControls } from "./DownloadMenu";
import { useT } from "./i18n";
import { Icon } from "./icons";
import Panel, { stepForPath, stepsOf, type StepId } from "./Panel";
import PhotoPane from "./PhotoPane";
import RichToolbar from "./RichToolbar";
import SheetMeter from "./SheetMeter";
import Stage, { type Measure } from "./Stage";
import { SuggestProvider } from "./suggest-context";
import { Toast, useToast } from "./Toast";
import TopBar from "./TopBar";
import { flash } from "./ui/util";

type SaveState = { ok: true } | { ok: false; reason: "full" | "unavailable" };

/* A transparent pixel holds the photo's place while one is being placed on a
   CV that has none yet, so the proof has an image to show it in. */
const NO_PHOTO = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const newest = (list: Cv[]) => [...list].sort((a, b) => b.updatedAt - a.updatedAt)[0];

/* What the editor starts from: whatever this browser, or this tab, has kept.
   It runs in the browser only (see EditorLoader), so it can read storage
   while the first render is worked out. */
function start() {
  const tabOnly = isTabOnly();
  const available = storageAvailable();
  const stored = available ? loadCvs() : null;
  /* First visit: a blank CV, with an example on the sheet until the first
     keystroke. A list emptied on purpose stays empty. */
  const cvs = stored ?? [blankCv(guessLocale(navigator.language))];
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
  };
}

export default function Editor() {
  const [boot] = useState(start);
  const [cvs, setCvs] = useState<Cv[]>(boot.cvs);
  const [openId, setOpenId] = useState<string | null>(boot.openId);
  const [photo, setPhoto] = useState<Photo | null>(boot.photo);
  const [step, setStep] = useState<StepId>("you");
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [ui, setUi] = useState<Ui>(boot.ui);
  const [saved, setSaved] = useState<SaveState>(boot.available ? { ok: true } : { ok: false, reason: "unavailable" });
  const [measure, setMeasure] = useState<Measure | null>(null);
  const [placing, setPlacing] = useState<string | null>(null);
  const [focusPath, setFocusPath] = useState<string | null>(null);
  /* The server is making a PDF file. Printing from the browser is not busy
     work: the dialog takes over the screen. */
  const [busy, setBusy] = useState(false);
  /* What the main PDF button does. It stays the same for the whole visit. */
  const [way] = useState(defaultWay);
  const [tabOnly, setTabOnly] = useState(boot.tabOnly);
  const toast = useToast();
  const t = useT();
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

  /* Storage that refused the CVs means closing the tab loses them. */
  const unsaved = !saved.ok && cvs.some(item => !isBlank(item));
  useEffect(() => {
    if (!unsaved) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

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

  /* The desk behind the sheet and the layout thumbnails take the CV's color.
     It sits on the root, because menus are drawn in the page body. */
  const accent = cvs.find(item => item.id === openId)?.accent ?? DEFAULT_ACCENT;
  useEffect(() => {
    document.documentElement.style.setProperty("--cv-accent", accent);
  }, [accent]);

  /* ------------------------------------------------------------ the CV */

  const cv = cvs.find(item => item.id === openId) ?? null;
  const template = TEMPLATES[cv?.template ?? "sidebar"];
  const locale = cv?.locale ?? "en";

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

  /* A CV nobody has typed into shows an example on the sheet. */
  const example = !!cv && isBlank(cv) && !placing;

  const rendered = useMemo(() => {
    if (!cv) return null;
    if (example) return renderCv({ ...exampleFor(cv), showPhoto: false }, { photo: null, annotate: true });
    const printed = placing ? photo?.src || NO_PHOTO : (photo?.src ?? null);
    return renderCv(cv, { photo: printed, annotate: true });
  }, [cv, photo, placing, example]);

  /* What each box suggests: the built in lists in the CV's language, led by
     what the person wrote in their other CVs. */
  const history = historyOf(cvs, openId);
  const role = cv?.person.role ?? "";
  const suggesters = useMemo(() => makeSuggesters({ locale, history, role }), [locale, history, role]);

  /* The lists are built the first time a box asks. Doing it once the editor
     is on screen keeps the first keystroke quick. */
  useEffect(() => {
    const timer = window.setTimeout(() => catalogOf(locale), 400);
    return () => window.clearTimeout(timer);
  }, [locale]);

  const { show } = toast;
  const say = useCallback(
    (text: string, undo?: () => void) => show(text, undo ? { action: { label: t.common.undo, run: undo } } : {}),
    [show, t],
  );

  /* A blank CV on a desktop screen starts with the caret in the name box, so the
     first key already types. On a phone it waits, since that would raise the
     keyboard over the page. */
  useEffect(() => {
    if (!cvsRef.current.some(item => item.id === openRef.current && isBlank(item))) return;
    if (!matchMedia("(pointer: fine) and (min-width: 901px)").matches) return;
    focusName();
  }, []);

  /* Google sends the person back to this page. Say that it worked. */
  useEffect(() => {
    if (!returnedFromSignIn()) return;
    void whoIsSignedIn()
      .then(({ user }) => {
        if (user) show(t.editor.signedIn(user.email));
      })
      .catch(() => undefined);
  }, [show, t]);

  /* ------------------------------------------------------------ library */

  /* Puts the caret in the first box of the first step. */
  function focusName() {
    document.querySelector<HTMLInputElement>('[data-field="person.name"]')?.focus();
  }

  function openCv(id: string) {
    setView("edit");
    /* The open CV is already measured; clearing its gauges here would leave
       them blank, since nothing changes to measure it again. */
    if (id === openId) return;
    setOpenId(id);
    setMeasure(null);
    setStep("you");
    setFocusPath(null);
  }

  function addCv(made: Cv, focus = true) {
    flushSync(() => {
      setCvs(list => [made, ...list]);
      setOpenId(made.id);
      setMeasure(null);
      setStep("you");
      setFocusPath(null);
      setView("edit");
    });
    if (focus) focusName();
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
        source.title === UNTITLED ? t.cvs.untitled : source.title,
        cvs.map(item => item.title),
        t.cvs.copyWord,
      ),
    );
    addCv(copy, false);
    say(t.editor.copyMade(copy.title));
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
      setStep("you");
    }
    say(t.editor.deleted(cvLabel(gone, t.cvs.untitled)), () => {
      setCvs(list => {
        const copy = [...list];
        copy.splice(Math.min(index, copy.length), 0, gone);
        return copy;
      });
      setOpenId(gone.id);
    });
  }

  function renameCv(title: string) {
    update(draft => {
      draft.title = title;
    });
  }

  function backUp() {
    const stamp = new Date().toISOString().slice(0, 10);
    saveBlob(new Blob([backup(cvs, photo)], { type: "application/json" }), `cv-editor-backup-${stamp}.json`);
    say(t.editor.backedUp(cvs.length));
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
      let photoBack = false;
      if (found.photo && !photo) {
        setPhoto(found.photo);
        savePhoto(found.photo);
        photoBack = true;
      }
      say(t.editor.restored(added, replaced, kept, photoBack));
    } catch (error) {
      say(backupMessage(t.errors.backup, error));
    }
  }

  /* -------------------------------------------------------------- photo */

  function keepPhoto(next: Photo | null) {
    setPhoto(next);
    const result = savePhoto(next);
    if (!result.ok) {
      say(result.reason === "full" ? t.editor.photoFull : t.editor.photoBlocked);
    } else if ("dropped" in result && result.dropped) {
      say(t.editor.photoDropped);
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
        say(result.reason === "full" ? t.editor.tabFull : t.editor.tabBlocked);
        return;
      }
      setTabOnly(true);
      setSaved({ ok: true });
      toast.show(t.editor.tabOn, {
        action: { label: t.editor.tabOnAction, run: backUp },
        ms: 9000,
      });
      return;
    }
    const moved = moveToBrowser(cvsRef.current, photo);
    if (!moved.result.ok) {
      say(moved.result.reason === "full" ? t.editor.browserFull : t.editor.browserBlocked);
      return;
    }
    setTabOnly(false);
    fromStorage.current = true;
    setCvs(moved.cvs);
    setSaved({ ok: true });
    say(t.editor.browserOn);
  }

  /* ---------------------------------------------------------- download */

  /* There are two ways to get the PDF (see lib/download.ts), and both start
     here: an empty CV has nothing to print, so say so and put the caret where
     the CV starts. */
  function printable(): boolean {
    if (!cv) return false;
    if (!isBlank(cv)) return true;
    flushSync(() => {
      setStep("you");
      setView("edit");
    });
    focusName();
    say(t.editor.emptyCv);
    return false;
  }

  /* The first PDF of a visit asks for a donation, after what `lead` says. */
  function thank(lead: string) {
    if (DONATE_URL && !askedToDonate.current) {
      askedToDonate.current = true;
      const ask = t.editor.donateAsk;
      toast.show(lead ? `${lead}. ${ask}` : ask, { action: { label: t.editor.donate, href: DONATE_URL }, ms: 10_000 });
    } else if (lead) toast.show(lead);
  }

  /* The browser's print dialog. The CV never leaves this device. */
  async function savePdf() {
    if (!cv || !printable()) return;
    try {
      await printCv(cv, photo?.src ?? null);
      thank("");
    } catch {
      toast.show(t.editor.printFailed, {
        action: { label: t.editor.downloadFile, run: () => void downloadFile() },
        ms: 10_000,
      });
    }
  }

  /* A file from the server. The CV goes over the network once and is not kept. */
  async function downloadFile() {
    if (!cv || busy || !printable()) return;
    setBusy(true);
    try {
      const blob = await fetchPdf(cv, photo?.src ?? null);
      const name = fileName(cv);
      saveBlob(blob, name);
      thank(t.editor.downloaded(name));
    } catch (error) {
      toast.show(pdfMessage(t.errors.pdf, error) + t.editor.printHint, {
        action: { label: t.pdf.print.title, run: () => void savePdf() },
        ms: 10_000,
      });
    } finally {
      setBusy(false);
    }
  }

  const pdf: PdfControls = { way, busy, onPrint: () => void savePdf(), onFile: () => void downloadFile() };

  /* Cmd/Ctrl+S would save the page's HTML, and Cmd/Ctrl+P would print the
     editor itself. Neither is what anyone pressing them wants here. P opens
     the print dialog on the CV, whichever way the main button takes. */
  const printNow = useRef(savePdf);
  useLayoutEffect(() => {
    printNow.current = savePdf;
  });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === "s") {
        event.preventDefault();
        flush();
        toast.show(tabOnly ? t.editor.savedKeyTab : t.editor.savedKeyBrowser);
      }
      if (key === "p" && cv) {
        event.preventDefault();
        void printNow.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cv, flush, toast, tabOnly, t]);

  /* ---------------------------------------------------- click to edit */

  /* A click on a line of the sheet opens its step and its box. */
  function openField(path: string) {
    if (!cv) return;
    flushSync(() => {
      setStep(stepForPath(cv, path));
      setView("edit");
    });
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
    flash(found);
  }

  /* The step in use must exist: deleting a section can remove it. */
  const steps = cv ? stepsOf(cv, t.panel) : [];
  const currentStep = steps.some(item => item.id === step) ? step : "you";
  const photoUsers = cvs.filter(item => item.showPhoto).length;

  return (
    <div className="app" data-view={view}>
      <a className="skip-link" href="#preview">
        {t.editor.skip}
      </a>

      <TopBar
        cv={cv}
        cvs={cvs}
        update={update}
        saved={saved}
        tabOnly={tabOnly}
        ui={ui}
        onUi={setPrefs}
        pdf={pdf}
        onOpen={openCv}
        onNew={newCv}
        onSample={() => addCv(sampleCv(t.cvs.sampleTitle), false)}
        onDuplicate={duplicateCv}
        onDelete={deleteCv}
        onRename={renameCv}
        onTabOnly={chooseTabOnly}
        onBackup={backUp}
        onRestore={file => void restore(file)}
      />

      <main className="work">
        {cv ? (
          <SuggestProvider value={suggesters}>
            <Panel
              cv={cv}
              update={update}
              say={say}
              step={currentStep}
              onStep={setStep}
              summaryLines={measure?.summaryLines ?? null}
              pdf={pdf}
              onFocusPath={setFocusPath}
              onNew={newCv}
              noteClosed={ui.serversNote === "closed"}
              onCloseNote={() => setPrefs({ serversNote: "closed" })}
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
                    say(t.editor.photoSaved);
                  }}
                  onRemove={() => {
                    const before = photo;
                    keepPhoto(null);
                    say(t.editor.photoRemoved, () => keepPhoto(before));
                  }}
                  onPreview={setPlacing}
                  onError={message => say(message)}
                />
              }
            />
          </SuggestProvider>
        ) : (
          <section className="write empty" aria-label={t.editor.writeLabel}>
            <div className="empty-state">
              <h2>{t.editor.emptyTitle}</h2>
              <p>{t.editor.emptyText}</p>
              <div className="buttons">
                <button type="button" className="btn primary" onClick={newCv}>
                  <Icon name="plus" />
                  {t.cvs.new}
                </button>
                <button type="button" className="btn secondary" onClick={() => addCv(sampleCv(t.cvs.sampleTitle), false)}>
                  {t.editor.openSample}
                </button>
              </div>
            </div>
          </section>
        )}

        <div className="stage-wrap">
          {cv && rendered ? (
            <>
              <Stage
                rendered={rendered}
                template={template}
                zoom={ui.zoom ?? "fit"}
                photoOverride={placing}
                focusPath={focusPath}
                docId={cv.id}
                example={example}
                onMeasure={setMeasure}
                onPick={openField}
              />
              <SheetMeter measure={measure} template={template} example={example} />
            </>
          ) : (
            <div className="stage" id="preview" role="region" aria-label={t.stage.previewLabel} />
          )}
        </div>
      </main>

      <nav className="dock" aria-label={t.editor.dockLabel}>
        <button type="button" aria-pressed={view === "edit"} onClick={() => setView("edit")}>
          <Icon name="pencil" />
          {t.editor.edit}
        </button>
        <button type="button" aria-pressed={view === "preview"} onClick={() => setView("preview")}>
          <Icon name="eye" />
          {t.editor.preview}
        </button>
      </nav>

      <RichToolbar />
      <Toast message={toast.message} onDone={toast.hide} />
    </div>
  );
}
