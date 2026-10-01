import type { Metadata } from "next";
import { Doc } from "@/components/Doc";

/* The text lives in src/lib/i18n/legal, one file for each language. */

export const metadata: Metadata = {
  title: "Privacy · CV Editor",
  description: "What the CV Editor keeps, where, and for how long.",
};

export default function Privacy() {
  return <Doc page="privacy" />;
}
