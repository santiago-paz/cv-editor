import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { LANG_SCRIPT } from "@/lib/i18n/boot";
import { HOME, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const sans = Figtree({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });
const display = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  axes: ["opsz"],
  display: "swap",
});

/* What a page says when it says nothing of its own, and the address that every
   relative link in the metadata is read against. The pages set the rest in
   src/lib/seo.ts. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: HOME.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#14162A" },
  ],
};

/* Sets the saved theme before the first paint, so a dark choice does not flash
   light on load, and the language of the page, which the editor and the
   privacy page both read. */
const PREFS =
  `try{var u=JSON.parse(localStorage.getItem("cv-editor.v1.ui")||"{}"),r=document.documentElement;if(u.theme==="light"||u.theme==="dark")r.dataset.theme=u.theme}catch(e){}` +
  LANG_SCRIPT;

/* Counts visits with Vercel Web Analytics, on the production deploy only, so a
   preview or a local run counts nothing. It sets no cookie and keeps no IP
   address, and it loads from this site's own address, so the CSP needs no
   entry for it. The privacy page says all this, so change them together. */
const COUNT_VISITS = process.env.VERCEL_ENV === "production";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS }} />
      </head>
      <body>
        {children}
        {COUNT_VISITS && <Analytics />}
      </body>
    </html>
  );
}
