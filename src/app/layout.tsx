import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { LANG_SCRIPT } from "@/lib/i18n/boot";
import "./globals.css";

const sans = Figtree({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });
const display = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  axes: ["opsz"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CV Editor",
  description:
    "Write your CV in about a minute. Type a few letters, press Enter, and the page fills in. See where each page breaks, then download the PDF. You do not need an account, and your CVs stay in this browser.",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
