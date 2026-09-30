import { z } from "zod";
import { hex } from "../color";
import { DEFAULT_ACCENT, uid } from "./defaults";
import type { Cv, Photo } from "./types";

/* Reads a CV from anywhere it can come from: localStorage, a backup file, or
   a request to the PDF route. It repairs rather than rejects: a missing or
   broken field gets its default, a string past its limit is cut, and a list
   past its limit loses its tail. So an old backup still opens, and a request
   can never make the server print an unbounded document. */

const str = (max: number) =>
  z
    .string()
    .transform(value => value.slice(0, max))
    .catch("");

const id = z
  .string()
  .regex(/^[A-Za-z0-9_-]{1,64}$/)
  .catch(() => uid());

/** Keeps the objects in a list, up to `max` of them. */
function list<T extends z.ZodType>(item: T, max: number) {
  return z.preprocess(
    value =>
      Array.isArray(value)
        ? value.filter(entry => entry !== null && typeof entry === "object").slice(0, max)
        : [],
    z.array(item),
  );
}

const TEXT = 300;
const RICH = 4000;

const link = z.object({ id, label: str(TEXT), url: str(1000) });
const bullet = z.object({ id, html: str(RICH) });

const role = z.object({
  id,
  title: str(TEXT),
  org: str(TEXT),
  url: str(1000),
  dates: str(120),
  note: str(TEXT),
  bullets: list(bullet, 40),
});

const project = z.object({
  id,
  name: str(TEXT),
  links: list(link, 10),
  bullets: list(bullet, 40),
});

const preset = z
  .enum(["experience", "education", "projects", "keySkills", "awards", "highlights", "text"])
  .optional()
  .catch(undefined);

const base = { id, title: str(TEXT), preset };

const section = z.discriminatedUnion("kind", [
  z.object({ ...base, kind: z.literal("roles"), items: list(role, 40) }),
  z.object({ ...base, kind: z.literal("projects"), items: list(project, 40) }),
  z.object({ ...base, kind: z.literal("rows"), rows: list(z.object({ id, label: str(TEXT), html: str(RICH) }), 40) }),
  z.object({ ...base, kind: z.literal("list"), bullets: list(bullet, 60) }),
  z.object({ ...base, kind: z.literal("text"), html: str(RICH * 2) }),
]);

const KINDS = ["roles", "projects", "rows", "list", "text"];

const time = z.number().int().nonnegative().catch(() => Date.now());

export const cvSchema = z.object({
  id,
  title: str(120).transform(value => value.trim() || "Untitled CV"),
  createdAt: time,
  updatedAt: time,
  sample: z.boolean().optional().catch(undefined),
  template: z.enum(["sidebar", "classic"]).catch("sidebar"),
  locale: z.enum(["en", "es", "de"]).catch("en"),
  accent: z
    .string()
    .transform(value => hex(value) || DEFAULT_ACCENT)
    .catch(DEFAULT_ACCENT),
  showPhoto: z.boolean().catch(true),
  person: z
    .object({
      name: str(TEXT),
      role: str(TEXT),
      location: str(TEXT),
      email: str(TEXT),
      phone: str(80),
    })
    .catch({ name: "", role: "", location: "", email: "", phone: "" }),
  links: list(link, 12),
  summaryTitle: str(TEXT),
  summary: str(RICH),
  skills: list(z.object({ id, text: str(TEXT) }), 40),
  languages: list(
    z.object({
      id,
      name: str(TEXT),
      level: str(TEXT),
      percent: z.number().min(0).max(100).catch(0),
    }),
    12,
  ),
  hobbies: str(TEXT),
  sections: z.preprocess(
    value =>
      Array.isArray(value)
        ? value
            .filter(entry => entry && typeof entry === "object" && KINDS.includes((entry as { kind?: string }).kind ?? ""))
            .slice(0, 30)
        : [],
    z.array(section),
  ),
});

/** A CV, repaired, or null when the value is not a CV at all. */
export function readCv(value: unknown): Cv | null {
  if (!value || typeof value !== "object") return null;
  const parsed = cvSchema.safeParse(value);
  return parsed.success ? (parsed.data as Cv) : null;
}

/* A photo is pasted into an src attribute of the proof and the PDF, so only a
   base64 image data URI gets through, and only up to a size a headshot needs. */
const DATA_URI = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
export const MAX_PHOTO_CHARS = 1_500_000;
export const MAX_SOURCE_CHARS = 4_000_000;

export function isPhotoUri(value: unknown, max = MAX_PHOTO_CHARS): value is string {
  return typeof value === "string" && value.length <= max && DATA_URI.test(value);
}

export function readPhoto(value: unknown): Photo | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (!isPhotoUri(record.src)) return null;
  const photo: Photo = { src: record.src };
  if (isPhotoUri(record.source, MAX_SOURCE_CHARS)) photo.source = record.source;
  const crop = record.crop as Photo["crop"];
  if (
    crop &&
    ["width", "height", "left", "top", "side"].every(key => Number.isFinite((crop as Record<string, number>)[key]))
  ) {
    photo.crop = { width: crop.width, height: crop.height, left: crop.left, top: crop.top, side: crop.side };
  }
  return photo;
}
