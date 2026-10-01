"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useT } from "./i18n";

/* A link to the privacy page or the terms, which open in a tab of their own so
   the CV on the screen stays where it is. */
export function LegalLink({ page, children }: { page: "privacy" | "terms"; children: ReactNode }) {
  const t = useT();
  return (
    <Link href={`/${page}`} target="_blank" rel="noopener">
      {children}
      <span className="sr-only">{t.common.newTab}</span>
    </Link>
  );
}
