import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { PITCH } from "@/lib/pitch";
import { HOME } from "@/lib/seo";

/* The picture a shared link shows, 1200 by 630. Next draws it at build time and
   adds it to every page. Satori cannot read CSS variables, so the few colors it
   needs are copied here from globals.css: the desk, the marker, the ink and the
   ultramarine. It reads WOFF, not WOFF2, so the two faces it needs sit in ./_og,
   the same Bricolage Grotesque and Figtree the site sets its type in, with their
   licenses. */

export const alt = HOME.imageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const DESK = "#0C2140";
const MARKER = "#FFD23F";
const INK = "#14172B";
const KLEIN_LIGHT = "#9A9CFF";
const MIST = "#C9CEEA";
const ACCENT = "#10365C";

const font = (file: string) => readFile(join(process.cwd(), "src/app/_og", file));
const [display, sans] = await Promise.all([
  font("bricolage-grotesque-latin-700-normal.woff"),
  font("figtree-latin-600-normal.woff"),
]);

const bar = (width: number, height: number, background: string) => (
  <div style={{ display: "flex", width, height, background, borderRadius: height / 2, flex: "none" }} />
);
const gap = (height: number) => <div style={{ display: "flex", height }} />;

/** The tagline as separate words, so a line can break between any two, with the
    marked word on its own pill and the comma that follows it glued on. */
function Tagline({ size: fontSize }: { size: number }) {
  const { before, mark, after } = PITCH.tagline;
  const glue = after.trim().split(/\s+/)[0];
  const words = (text: string) => text.trim().split(/\s+/);
  const word = (text: string, key: string) => (
    <div key={key} style={{ display: "flex", marginRight: fontSize * 0.26 }}>
      {text}
    </div>
  );
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        fontFamily: "Bricolage",
        fontWeight: 700,
        fontSize,
        lineHeight: 1.08,
        letterSpacing: -fontSize * 0.03,
        color: "#FFFFFF",
      }}
    >
      {words(before).map((text, index) => word(text, `b${index}`))}
      <div style={{ display: "flex", marginRight: fontSize * 0.26 }}>
        <div style={{ display: "flex", padding: "0 14px", background: MARKER, color: INK, borderRadius: 12 }}>{mark}</div>
        <div style={{ display: "flex", marginLeft: 2 }}>{glue}</div>
      </div>
      {words(after).slice(1).map((text, index) => word(text, `a${index}`))}
    </div>
  );
}

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: 1200, height: 630, background: DESK, position: "relative", fontFamily: "Figtree" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 780,
            height: 630,
            padding: "60px 0 60px 72px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <svg width="52" height="52" viewBox="0 0 32 32">
              <rect width="32" height="32" rx="8" fill="#3B3DF5" />
              <rect x="9" y="6" width="14" height="20" rx="3" fill="#FFFFFF" />
              <rect x="11" y="13" width="10" height="5" rx="2.5" fill={MARKER} />
              <path d="M12.5 10h7M12.5 15.5h7M12.5 22h4.5" stroke={INK} strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </svg>
            <div
              style={{
                display: "flex",
                marginLeft: 16,
                fontFamily: "Bricolage",
                fontWeight: 700,
                fontSize: 38,
                letterSpacing: -1,
                color: "#FFFFFF",
              }}
            >
              <div style={{ display: "flex", padding: "0 6px", marginRight: 10, background: MARKER, color: INK, borderRadius: 6 }}>CV</div>
              Editor
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", marginBottom: 22, fontSize: 30, fontWeight: 600, color: KLEIN_LIGHT }}>{PITCH.heading}</div>
            <Tagline size={66} />
          </div>

          <div style={{ display: "flex", fontSize: 28, fontWeight: 600, color: MIST }}>{PITCH.facts.join("  ·  ")}</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            right: 72,
            top: 72,
            width: 292,
            height: 413,
            padding: "40px 32px",
            background: "#FFFFFF",
            borderRadius: 4,
            boxShadow: "0 40px 80px -20px rgba(0,0,0,.6)",
          }}
        >
          {bar(140, 20, ACCENT)}
          {gap(14)}
          {bar(100, 10, "#8497AE")}
          {gap(30)}
          {bar(76, 8, ACCENT)}
          {gap(16)}
          {bar(228, 8, "#DDE3EC")}
          {gap(12)}
          {bar(206, 8, "#DDE3EC")}
          {gap(12)}
          <div style={{ display: "flex", alignItems: "center", width: 252, height: 24, margin: "0 -10px", padding: "0 10px", background: MARKER, borderRadius: 4 }}>
            {bar(190, 8, "#7A6A22")}
          </div>
          {gap(12)}
          {bar(222, 8, "#DDE3EC")}
          {gap(12)}
          {bar(140, 8, "#DDE3EC")}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage", data: display, weight: 700, style: "normal" },
        { name: "Figtree", data: sans, weight: 600, style: "normal" },
      ],
    },
  );
}
