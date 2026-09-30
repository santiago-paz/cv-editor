import type { Metadata, Viewport } from "next";
import { Crete_Round, DM_Mono, Inter_Tight } from "next/font/google";
import "./globals.css";

const sans = Inter_Tight({ subsets: ["latin", "latin-ext"], variable: "--font-sans" });
const mono = DM_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500"], variable: "--font-mono" });
const display = Crete_Round({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-display" });

export const metadata: Metadata = {
  title: "CV Editor",
  description:
    "Write your CV, see where each page breaks, and download it as a PDF. No account: your CVs stay in this browser.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FCFCFB" },
    { media: "(prefers-color-scheme: dark)", color: "#141D28" },
  ],
};

/* Sets the saved theme and the folded CV list before the first paint, so a
   dark choice does not flash light on load, and a folded list does not flash
   open. */
const PREFS = `try{var u=JSON.parse(localStorage.getItem("cv-editor.v1.ui")||"{}"),r=document.documentElement;if(u.theme==="light"||u.theme==="dark")r.dataset.theme=u.theme;if(u.library==="collapsed")r.dataset.library="collapsed"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
