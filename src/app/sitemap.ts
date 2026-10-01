import type { MetadataRoute } from "next";
import { LEGAL_UPDATED } from "@/lib/i18n/legal";
import { SITE_URL } from "@/lib/seo";

/* The editor, which is the home page, and the two legal pages. The editor has no
   date because it changes with every deploy. The legal pages carry the day their
   text last changed, in LEGAL_UPDATED. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL },
    { url: `${SITE_URL}/privacy`, lastModified: LEGAL_UPDATED },
    { url: `${SITE_URL}/terms`, lastModified: LEGAL_UPDATED },
  ];
}
