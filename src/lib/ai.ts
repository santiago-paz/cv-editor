import { z } from "zod";

/* What the AI button sends and gets back. The browser and the route share
   these, so a change shows up in both. */

/** Rewrites each account gets while the AI is free to use. */
export const LIMITS = { day: 10, month: 30 } as const;

/** The most HTML one request may carry, across all its items. */
const MAX_TEXT = 4000;

/** One block of a CV: the bullets of one job or project, or one paragraph. */
export const rewriteRequest = z
  .object({
    kind: z.enum(["bullets", "text"]),
    /** What the block belongs to: a job title, or the CV's headline. */
    title: z.string().max(200),
    /** The job's dates, which decide past or present tense. */
    dates: z.string().max(80),
    locale: z.enum(["en", "es", "de"]),
    items: z.array(z.string().max(1500)).min(1).max(12),
  })
  .refine(value => value.items.join("").length <= MAX_TEXT, "too long")
  .refine(value => value.items.some(item => item.replace(/<[^>]*>/g, "").trim()), "empty");

export type RewriteRequest = z.infer<typeof rewriteRequest>;

export interface RewriteReply {
  /** Names this rewrite, so the browser can say it was used. */
  id: string;
  /** One rewrite per item sent, cleaned like any rich text. */
  items: string[];
  /** Short hints about what is missing, such as a number. */
  tips: string[];
  left: { day: number; month: number };
}
