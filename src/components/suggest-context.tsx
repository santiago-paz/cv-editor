"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Suggesters } from "@/lib/suggest/sources";

/* The suggestion sources for the open CV, handed down to every box that
   suggests, so no box has to know which language or which job it is for. */

const SuggestContext = createContext<Suggesters | null>(null);

export function SuggestProvider({ value, children }: { value: Suggesters; children: ReactNode }) {
  return <SuggestContext.Provider value={value}>{children}</SuggestContext.Provider>;
}

export function useSuggest(): Suggesters {
  const value = useContext(SuggestContext);
  if (!value) throw new Error("useSuggest needs a SuggestProvider");
  return value;
}
