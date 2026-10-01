import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/* Everything is open to every crawler, search engines and AI tools alike,
   except the API, which has nothing to read. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
