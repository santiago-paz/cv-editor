import type { Metadata } from "next";
import { Doc } from "@/components/Doc";
import { pageMetadata } from "@/lib/seo";

/* The text lives in src/lib/i18n/legal, one file for each language. */

export const metadata: Metadata = pageMetadata({
  path: "/terms",
  title: "Terms",
  description: "The few rules for using the CV Editor.",
});

export default function Terms() {
  return <Doc page="terms" />;
}
