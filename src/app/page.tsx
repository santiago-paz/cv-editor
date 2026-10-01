import type { Metadata } from "next";
import EditorLoader from "@/components/EditorLoader";
import { HOME_METADATA, homeSchema, jsonLd } from "@/lib/seo";

/* The editor is the home page. Its title, description and structured data are in
   the server HTML, for the crawlers and link previews that read a page without
   drawing it. */
export const metadata: Metadata = HOME_METADATA;

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(homeSchema()) }} />
      <EditorLoader />
    </>
  );
}
