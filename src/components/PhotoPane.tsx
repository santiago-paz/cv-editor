"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import type { Template } from "@/lib/cv/templates";
import type { Photo } from "@/lib/cv/types";
import { MAX_ZOOM, createStage, render, shrink, type Square, type Stage } from "@/lib/photo-crop";
import { Icon } from "./icons";

/* One photo serves every CV. This pane uploads it, places it in the frame
   the open CV prints, and says what it will print at. The placing happens in
   a dialog, so the writing panel stays as it was. */

const PHOTO_PX = 600; // the saved square: 760 dpi in the sidebar's 20 mm circle
const SOURCE_PX = 1600; // the original is kept this size, so the crop can move later
const PREVIEW_PX = 240; // what the proof shows while the photo moves
const PRINT_DPI = 300;
const SOFT_DPI = 150;

interface Draft {
  image: HTMLImageElement;
  /** A new original to keep on save, or null when the kept one stays. */
  source: string | null;
  changed: boolean;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("could not load the photo"));
    image.src = url;
  });
}

function shapeName(round: number): string {
  if (round > 0.49) return "circle";
  if (round < 0.01) return "square";
  return "rounded square";
}

export default function PhotoPane({
  photo,
  template,
  shown,
  users,
  total,
  onShown,
  onSave,
  onRemove,
  onPreview,
  onError,
}: {
  photo: Photo | null;
  template: Template;
  shown: boolean;
  users: number;
  total: number;
  onShown: (on: boolean) => void;
  onSave: (photo: Photo) => void;
  onRemove: () => void;
  /** The image the proof shows while the photo moves; null when done. */
  onPreview: (src: string | null) => void;
  onError: (message: string) => void;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [readout, setReadout] = useState({ zoom: 0, percent: 100, dpi: 0 });
  const [dropping, setDropping] = useState(false);
  const stageRoot = useRef<HTMLDivElement>(null);
  const stageImg = useRef<HTMLImageElement>(null);
  const marks = useRef<SVGPathElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const stage = useRef<Stage | null>(null);
  const pending = useRef(0);
  /* The draft as the stage's callbacks see it, kept in step with the state
     wherever the state is set. */
  const draftRef = useRef<Draft | null>(null);

  const frameMm = template.frame.mm;
  const round = template.frame.round;

  /* The stage exists only while a photo is being placed: built on the first
     frame its markup is on the page, torn down by stop(). */
  function ensureStage(): Stage | null {
    if (stage.current) return stage.current;
    if (!stageRoot.current || !stageImg.current || !marks.current || !svg.current) return null;
    stage.current = createStage(
      stageRoot.current,
      { img: stageImg.current, marks: marks.current, svg: svg.current },
      kind => {
        const current = draftRef.current;
        if (!current || !stage.current) return;
        if (kind !== "load" && !current.changed) {
          const next = { ...current, changed: true };
          draftRef.current = next;
          setDraft(next);
        }
        paintReadout();
        previewSoon();
      },
    );
    return stage.current;
  }

  /* A crop that moved but was not saved would be lost with the tab. */
  useEffect(() => {
    if (!draft?.changed) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [draft?.changed]);

  useEffect(
    () => () => {
      stage.current?.destroy();
      cancelAnimationFrame(pending.current);
    },
    [],
  );

  function paintReadout() {
    const square = stage.current?.square;
    if (!square || !stage.current) return;
    const dpi = Math.round(Math.min(square.side, PHOTO_PX) / (frameMm / 25.4));
    const zoom = Math.round((Math.log(stage.current.zoom) / Math.log(MAX_ZOOM)) * 1000) / 10;
    setReadout({ zoom, percent: Math.round(stage.current.zoom * 100), dpi });
  }

  /* The proof follows the photo as it moves, once a frame. */
  function previewSoon() {
    if (pending.current) return;
    pending.current = requestAnimationFrame(() => {
      pending.current = 0;
      const current = draftRef.current;
      const square = stage.current?.square;
      if (!current || !square) return;
      onPreview(render(current.image, square, PREVIEW_PX).toDataURL("image/jpeg", 0.9));
    });
  }

  function begin(image: HTMLImageElement, square: Square | null, source: string | null, changed: boolean) {
    const next = { image, source, changed };
    draftRef.current = next;
    setDraft(next);
    /* The stage mounts on this render; load the photo once it has. */
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const ready = ensureStage();
        if (!ready) return;
        ready.load(image, square);
        stageRoot.current?.focus({ preventScroll: true });
      }),
    );
  }

  function stop() {
    stage.current?.destroy();
    stage.current = null;
    draftRef.current = null;
    setDraft(null);
    onPreview(null);
  }

  async function take(picked: File | undefined) {
    if (!picked) return;
    try {
      const bitmap = await createImageBitmap(picked, { imageOrientation: "from-image" });
      const source = shrink(bitmap, bitmap.width, bitmap.height, SOURCE_PX).toDataURL("image/jpeg", 0.9);
      bitmap.close();
      if (stage.current) stop();
      begin(await loadImage(source), null, source, true);
    } catch {
      onError(`Could not read ${picked.name || "that file"}. Use a JPEG, PNG or WebP photo.`);
    }
  }

  /* Opens the original where it was cut. Without an original, starts from the
     printed square instead. */
  async function adjust() {
    if (!photo) return;
    try {
      if (photo.source && photo.crop) {
        const image = await loadImage(photo.source);
        const k = image.naturalWidth / photo.crop.width;
        begin(image, { left: photo.crop.left * k, top: photo.crop.top * k, side: photo.crop.side * k }, null, false);
      } else {
        begin(await loadImage(photo.src), null, photo.src, false);
      }
    } catch {
      onError("Could not open the saved photo. Upload it again.");
    }
  }

  function save() {
    const current = draftRef.current;
    const square = stage.current?.square;
    if (!current || !square) return;
    const size = Math.max(1, Math.round(Math.min(PHOTO_PX, square.side)));
    onSave({
      src: render(current.image, square, size).toDataURL("image/jpeg", 0.9),
      source: current.source ?? photo?.source,
      crop: {
        width: current.image.naturalWidth,
        height: current.image.naturalHeight,
        left: square.left,
        top: square.top,
        side: square.side,
      },
    });
    stop();
  }

  const onDrag = (event: DragEvent) => {
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDropping(true);
  };

  const level = readout.dpi >= PRINT_DPI ? "ok" : readout.dpi >= SOFT_DPI ? "warn" : "bad";
  const reach =
    total <= 1 ? "" : users === total ? `All ${total} CVs print this photo.` : `${users} of ${total} CVs print this photo.`;

  return (
    <section
      className={"photo" + (dropping ? " dropping" : "")}
      aria-label="Photo"
      style={{ ["--shape" as string]: `${round * 100}%` }}
      onDragOver={onDrag}
      onDragLeave={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropping(false);
      }}
      onDrop={event => {
        event.preventDefault();
        setDropping(false);
        void take(event.dataTransfer.files[0]);
      }}
    >
      <div className="photo-card">
        <button
          type="button"
          className={"avatar" + (photo ? "" : " empty")}
          aria-label={photo ? "Adjust your photo" : "Add a photo"}
          data-field="photo"
          onClick={() => (photo ? void adjust() : file.current?.click())}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.src} alt="" width={64} height={64} />
          ) : (
            <Icon name="user" size={26} />
          )}
        </button>
        <div className="photo-about">
          <p className="photo-title">
            Photo <span className="tag">Optional</span>
          </p>
          <p className="photo-sub">
            Prints as a {Math.round(frameMm)}&nbsp;mm {shapeName(round)} on {template.name}.{" "}
            {!photo && "Drop an image here, or pick one. It stays in this browser."}
            {reach && ` ${reach}`}
          </p>
          <div className="photo-buttons">
            {photo ? (
              <>
                <button type="button" className="chip-button" onClick={() => void adjust()}>
                  Adjust
                </button>
                <button type="button" className="chip-button" onClick={() => file.current?.click()}>
                  Upload new
                </button>
                <button type="button" className="chip-button danger" onClick={onRemove}>
                  Remove
                </button>
              </>
            ) : (
              <button type="button" className="chip-button" onClick={() => file.current?.click()}>
                <Icon name="image" size={14} />
                Upload a photo
              </button>
            )}
          </div>
          {photo && (
            <label className="switch">
              <input type="checkbox" checked={shown} onChange={event => onShown(event.target.checked)} />
              <span>Print it on this CV</span>
            </label>
          )}
        </div>
      </div>

      {draft && (
        <dialog
          className="dialog photo-dialog"
          aria-labelledby="photo-dialog-title"
          ref={node => {
            if (node && !node.open) node.showModal();
          }}
          onCancel={event => {
            event.preventDefault();
            stop();
          }}
        >
          <h2 className="dialog-title" id="photo-dialog-title">
            Place your photo
          </h2>
          <div
            className="crop-stage"
            ref={stageRoot}
            tabIndex={0}
            role="application"
            aria-label="Photo position"
            aria-describedby="cropHint"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="crop-img" ref={stageImg} alt="" draggable={false} />
            <div className="crop-frame" aria-hidden="true">
              <div className="crop-shape" />
            </div>
            <svg className="crop-marks" ref={svg} aria-hidden="true" focusable="false">
              <path ref={marks} d="" />
            </svg>
          </div>
          <div className="zoom-row">
            <button type="button" className="iconbtn" aria-label="Zoom out" onClick={() => stage.current?.zoomBy(1 / 1.25)}>
              <Icon name="minus" />
            </button>
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={readout.zoom}
              aria-label="Zoom"
              aria-valuetext={`${readout.percent}%`}
              onChange={event => stage.current?.zoomTo(Math.pow(MAX_ZOOM, Number(event.target.value) / 100))}
            />
            <button type="button" className="iconbtn" aria-label="Zoom in" onClick={() => stage.current?.zoomBy(1.25)}>
              <Icon name="plus" />
            </button>
          </div>
          <div className={"photo-res " + level}>
            <span>
              {Math.round(frameMm)}&nbsp;mm {shapeName(round)}
            </span>
            <span aria-hidden="true">·</span>
            <b>
              {readout.dpi}&nbsp;dpi
              {level === "warn" ? ", may print soft" : level === "bad" ? ", will print soft" : ""}
            </b>
            <button type="button" className="text-button" onClick={() => stage.current?.reset()}>
              Reset
            </button>
          </div>
          <p className="field-hint" id="cropHint">
            Drag to move the photo, or double-click a spot to center it. Scroll or pinch to zoom. On the keyboard, the
            arrow keys move it and + and - zoom.
          </p>
          <div className="dialog-actions">
            <button type="button" className="btn quiet" onClick={() => file.current?.click()}>
              Upload new
            </button>
            <span className="grow" />
            <button type="button" className="btn secondary" onClick={stop}>
              Cancel
            </button>
            <button type="button" className="btn primary" disabled={!draft.changed} onClick={save}>
              Save photo
            </button>
          </div>
        </dialog>
      )}

      <input
        ref={file}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/*"
        hidden
        onChange={event => {
          const picked = event.target.files?.[0];
          event.target.value = "";
          void take(picked);
        }}
      />
    </section>
  );
}
