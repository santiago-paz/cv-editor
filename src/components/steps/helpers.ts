import type { Cv, Section } from "@/lib/cv/types";

/** Finds a section in a draft by id, since its position can move under a recipe. */
export function inDraft(draft: Cv, id: string): Section | undefined {
  return draft.sections.find(item => item.id === id);
}
