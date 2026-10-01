import type { Metadata } from "next";
import { Doc } from "@/components/Doc";
import { pageMetadata } from "@/lib/seo";

/* The text lives in src/lib/i18n/legal, one file for each language. */

export const metadata: Metadata = pageMetadata({
  path: "/privacy",
  title: "Privacy",
  description: "What the CV Editor keeps, where, and for how long.",
});

export default function Privacy() {
  return <Doc page="privacy" />;
}
