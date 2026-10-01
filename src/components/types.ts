import type { Cv } from "@/lib/cv/types";

/** Changes the open CV. The recipe edits a draft. */
export type Update = (recipe: (draft: Cv) => void) => void;

/** Says something for a moment, with an optional Undo. */
export type Say = (text: string, undo?: () => void) => void;
