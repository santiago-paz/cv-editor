"use client";

import { produce } from "immer";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { cvLabel, exampleFor, isBlank } from "@/lib/cv/blank";
import { DEFAULT_ACCENT, blankCv, copyTitle, duplicate } from "@/lib/cv/defaults";
import { guessLocale } from "@/lib/cv/labels";
import { fileName, renderCv } from "@/lib/cv/render";
import { sampleCv } from "@/lib/cv/sample";
import { sanitizeCv } from "@/lib/cv/sanitize-cv";
import { TEMPLATES } from "@/lib/cv/templates";
import type { Cv, Photo } from "@/lib/cv/types";
import { fetchPdf, printCv, saveBlob } from "@/lib/download";
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
  const [busy, setBusy] = useState(false);
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
    (text: string, undo?: () => void) => show(text, undo ? { action: { label: "Undo", run: undo } } : {}),
    [show],
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
        if (user) show(`Signed in as ${user.email}. Press Improve with AI to try it.`);
      })
      .catch(() => undefined);
  }, [show]);

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
      setStep("you");
    }
    say(`Deleted “${cvLabel(gone)}”.`, () => {
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
    if (isBlank(cv)) {
      flushSync(() => {
        setStep("you");
        setView("edit");
      });
      focusName();
      say("The CV is empty. Add your name and job title first.");
      return;
    }
    setBusy(true);
    try {
      const blob = await fetchPdf(cv, photo?.src ?? null);
      const name = fileName(cv);
      saveBlob(blob, name);
      if (DONATE_URL && !askedToDonate.current) {
        askedToDonate.current = true;
        toast.show(`Downloaded ${name}. If the editor helped, you can support it with a donation.`, {
          action: { label: "Donate", href: DONATE_URL },
          ms: 10_000,
        });
      } else toast.show(`Downloaded ${name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The PDF could not be made.";
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
  const steps = cv ? stepsOf(cv) : [];
  const currentStep = steps.some(item => item.id === step) ? step : "you";
  const photoUsers = cvs.filter(item => item.showPhoto).length;

  return (
    <div className="app" data-view={view}>
      <a className="skip-link" href="#preview">
        Skip to the preview
      </a>

      <TopBar
        cv={cv}
        cvs={cvs}
        update={update}
        saved={saved}
        tabOnly={tabOnly}
        ui={ui}
        onUi={setPrefs}
        busy={busy}
        onOpen={openCv}
        onNew={newCv}
        onSample={() => addCv(sampleCv(), false)}
        onDuplicate={duplicateCv}
        onDelete={deleteCv}
        onRename={renameCv}
        onTabOnly={chooseTabOnly}
        onBackup={backUp}
        onRestore={file => void restore(file)}
        onDownload={() => void download()}
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
              onDownload={() => void download()}
              busy={busy}
              onFocusPath={setFocusPath}
              onNew={newCv}
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
          </SuggestProvider>
        ) : (
          <section className="write empty" aria-label="Write your CV">
            <div className="empty-state">
              <h2>No CVs yet</h2>
              <p>Start a new one, or open the sample to see how the editor works.</p>
              <div className="buttons">
                <button type="button" className="btn primary" onClick={newCv}>
                  <Icon name="plus" />
                  New CV
                </button>
                <button type="button" className="btn secondary" onClick={() => addCv(sampleCv(), false)}>
                  Open the sample
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
                example={example}
                onMeasure={setMeasure}
                onPick={openField}
              />
              <SheetMeter measure={measure} template={template} example={example} />
            </>
          ) : (
            <div className="stage" id="preview" role="region" aria-label="Preview of your CV" />
          )}
        </div>
      </main>

      <nav className="dock" aria-label="Show">
        <button type="button" aria-pressed={view === "edit"} onClick={() => setView("edit")}>
          <Icon name="pencil" />
          Edit
        </button>
        <button type="button" aria-pressed={view === "preview"} onClick={() => setView("preview")}>
          <Icon name="eye" />
          Preview
        </button>
      </nav>

      <RichToolbar />
      <Toast message={toast.message} onDone={toast.hide} />
    </div>
  );
}
