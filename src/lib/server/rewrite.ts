import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { RewriteRequest } from "../ai";
import { sanitizeServer } from "./sanitize";

/* The one place that talks to the model. A change of model or provider
   touches this file only.

   Only the block's text, its title, its dates and the CV's language go to
   the model. Never the name, contact details, photo or the rest of the CV. */

export const MODEL = "claude-haiku-4-5";

const LANGUAGES = { en: "English", es: "Spanish", de: "German" } as const;

const SYSTEM = `You rewrite one part of a CV so it reads better. The part is either the bullet points of one job or project, or one paragraph, such as the profile at the top.

You get JSON with the part's kind, the job title or headline it belongs to, the job's dates, the CV's language, and the text as HTML strings in "items".

Rules:
1. Keep every fact. Never add a number, tool, company, result, date or claim that the input does not state, and never drop one.
2. Answer in the language the input is written in.
3. For bullets, return exactly one rewrite per input bullet, in the same order. Start each with a strong verb, in the past tense for a finished job and the present tense for a current one. Cut filler such as "Responsible for" or "Helped with". Keep each bullet to one or two lines.
4. For a paragraph, return one item: one paragraph, no longer than the input.
5. Keep <strong>, <em> and <a href="..."> tags around the same words. Use no other markup.
6. Write plainly and specifically. No buzzwords such as "results-driven" or "synergy", no "I" in bullets, no exclamation marks.
7. If the input already reads well, change little.
8. If a number would make a bullet stronger and the input has none, do not invent one. Put a short tip in "tips" instead, in the input's language, such as "Add how many users this served." At most three tips, and none when nothing is missing.`;

const Reply = z.object({ items: z.array(z.string()), tips: z.array(z.string()) });

export interface Tokens {
  input: number;
  output: number;
}

export type Rewrite =
  | { ok: true; items: string[]; tips: string[]; tokens: Tokens }
  | { ok: false; status: number; error: string; tokens: Tokens };

let client: Anthropic | null = null;

export async function rewrite(input: RewriteRequest): Promise<Rewrite> {
  client ??= new Anthropic({ timeout: 25_000, maxRetries: 1 });
  const none = { input: 0, output: 0 };
  let response;
  try {
    response = await client.messages.parse({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            kind: input.kind === "bullets" ? "bullets of one job or project" : "one paragraph",
            title: input.title,
            dates: input.dates,
            language: LANGUAGES[input.locale],
            items: input.items,
          }),
        },
      ],
      output_config: { format: zodOutputFormat(Reply) },
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return { ok: false, status: 503, error: "The AI is busy. Try again in a minute.", tokens: none };
    }
    if (error instanceof Anthropic.APIError) {
      console.error("AI rewrite failed:", error.status, error.message);
      return { ok: false, status: 502, error: "The AI could not answer. Try again in a minute.", tokens: none };
    }
    throw error;
  }

  const tokens = { input: response.usage.input_tokens, output: response.usage.output_tokens };
  if (response.stop_reason === "refusal") {
    return { ok: false, status: 422, error: "The AI would not rewrite this block.", tokens };
  }
  if (response.stop_reason === "max_tokens" || !response.parsed_output) {
    return { ok: false, status: 502, error: "The AI's answer came back cut off. Try a shorter block.", tokens };
  }
  return { ok: true, ...clean(input, response.parsed_output), tokens };
}

/** Lines the reply up with what was sent, and cleans it like any rich text.
    A bullet the model left out or emptied keeps its original. */
export function clean(input: RewriteRequest, reply: { items: string[]; tips: string[] }) {
  const items =
    input.kind === "bullets"
      ? input.items.map((original, index) => sanitizeServer(reply.items[index] ?? "") || original)
      : [sanitizeServer(reply.items.join(" ")) || input.items[0]];
  const tips = reply.tips
    .map(tip => tip.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 200))
    .filter(Boolean)
    .slice(0, 3);
  return { items, tips };
}
