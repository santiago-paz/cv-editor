/* Line icons on a 16px grid, one stroke weight. The mark is the exception:
   a sheet with one line lit by the marker, the same marker that follows you
   down the page as you type. */

interface Drawing {
  paths: string[];
  /** Filled dots, as [x, y, radius]. */
  dots?: [number, number, number][];
}

const ICONS = {
  check: { paths: ["M3.5 8.5 6.5 11.5 12.5 4.5"] },
  down: { paths: ["M4 6.5 8 10.5 12 6.5"] },
  right: { paths: ["M6.5 4 10.5 8 6.5 12"] },
  left: { paths: ["M9.5 4 5.5 8 9.5 12"] },
  plus: { paths: ["M8 3.5v9M3.5 8h9"] },
  minus: { paths: ["M3.5 8h9"] },
  close: { paths: ["M4 4l8 8M12 4l-8 8"] },
  more: {
    paths: [],
    dots: [
      [3.5, 8, 1.1],
      [8, 8, 1.1],
      [12.5, 8, 1.1],
    ],
  },
  trash: { paths: ["M3 4.5h10M6.25 4.5V3h3.5v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5"] },
  copy: { paths: ["M5.5 5.5h7v7h-7zM3.5 10.5v-7h7"] },
  download: { paths: ["M8 2.5v7M5 6.75l3 3 3-3M3 12.5h10"] },
  print: { paths: ["M4.5 6V2.5h7V6", "M4.5 11.5h-2v-5h11v5h-2", "M4.5 9.5h7v4h-7z"] },
  lock: { paths: ["M4.5 7.5h7V13h-7z", "M6 7.5V5.75a2 2 0 0 1 4 0V7.5"], dots: [[8, 10.2, 0.9]] },
  server: {
    paths: ["M3 3.5h10V7H3z", "M3 9h10v3.5H3z"],
    dots: [
      [5.2, 5.25, 0.8],
      [5.2, 10.75, 0.8],
    ],
  },
  up: { paths: ["M8 12.5v-9M4.5 7 8 3.5 11.5 7"] },
  arrowDown: { paths: ["M8 3.5v9M4.5 9 8 12.5 11.5 9"] },
  arrowRight: { paths: ["M3 8h10M9 4l4 4-4 4"] },
  arrowLeft: { paths: ["M13 8H3M7 4 3 8l4 4"] },
  enter: { paths: ["M12.5 3.5v5h-9M6.5 5.5l-3 3 3 3"] },
  palette: {
    paths: [
      "M8 2.5a5.5 5.5 0 1 0 0 11c.95 0 1.4-.65 1.4-1.3 0-.4-.2-.75-.45-1.05-.25-.3-.4-.6-.4-1 0-.75.6-1.35 1.35-1.35h1.4a2.2 2.2 0 0 0 2.2-2.2C13.5 4.4 11 2.5 8 2.5z",
    ],
    dots: [
      [5.2, 7.3, 0.9],
      [7.4, 4.8, 0.9],
      [10.3, 5.1, 0.9],
    ],
  },
  sliders: {
    paths: ["M2.5 5h6M12.5 5h1M2.5 11h1M7.5 11h6"],
    dots: [
      [10.5, 5, 1.9],
      [5.5, 11, 1.9],
    ],
  },
  user: {
    paths: ["M8 7.75a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2zM3.3 13.5c.6-2.5 2.4-3.9 4.7-3.9s4.1 1.4 4.7 3.9"],
  },
  globe: {
    paths: [
      "M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM2.5 8h11",
      "M8 2.5c1.7 1.5 2.6 3.4 2.6 5.5S9.7 12 8 13.5C6.3 12 5.4 10.1 5.4 8S6.3 4 8 2.5z",
    ],
  },
  link: {
    paths: ["M6.9 9.1 9.1 6.9M7.3 4.7l.8-.8a2.6 2.6 0 0 1 3.7 3.7l-.8.8M8.7 11.3l-.8.8a2.6 2.6 0 0 1-3.7-3.7l.8-.8"],
  },
  external: { paths: ["M6.5 3.5H3.5v9h9v-3M9 3.5h3.5V7M12.5 3.5 7.5 8.5"] },
  heart: { paths: ["M8 13.2S2.8 10 2.8 6.4A2.9 2.9 0 0 1 8 4.8a2.9 2.9 0 0 1 5.2 1.6C13.2 10 8 13.2 8 13.2z"] },
  alert: { paths: ["M8 2.8 14 13H2L8 2.8zM8 6.8v3M8 11.6h.01"] },
  image: { paths: ["M2.5 3.5h11v9h-11zM2.5 10.5l3-3 3 3 2-2 3 3"], dots: [[10.4, 6.1, 0.9]] },
  eye: { paths: ["M1.5 8S4 3.6 8 3.6 14.5 8 14.5 8 12 12.4 8 12.4 1.5 8 1.5 8z"], dots: [[8, 8, 1.7]] },
  pencil: { paths: ["M10.5 3.5l2 2M3 13l.6-2.6 7-7 2 2-7 7L3 13z"] },
  folder: { paths: ["M2.5 4.5h4l1.2 1.5h5.8v6.5h-11z"] },
  undo: { paths: ["M5.5 4 3 6.5 5.5 9M3.5 6.5h5.5a3.5 3.5 0 0 1 0 7H7"] },
  sparkle: {
    paths: ["M6.8 4.2 8.1 8l3.8 1.3L8.1 10.6 6.8 14.4 5.5 10.6 1.7 9.3 5.5 8z", "M12.6 1.8v3.2M11 3.4h3.2"],
  },
  bulb: {
    paths: ["M8 2.2a3.9 3.9 0 0 0-2.2 7.1c.5.4.8.9.8 1.5v.4h2.8v-.4c0-.6.3-1.1.8-1.5A3.9 3.9 0 0 0 8 2.2z", "M6.4 13.2h3.2"],
  },
} satisfies Record<string, Drawing>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  const drawing: Drawing = ICONS[name];
  return (
    <svg
      className="icon"
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {drawing.paths.map(d => (
        <path key={d} d={d} />
      ))}
      {drawing.dots?.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}

/** The mark: a sheet with three lines, the second lit by the marker. */
export function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg className="mark-icon" viewBox="0 0 22 22" width={size} height={size} aria-hidden="true" focusable="false">
      <rect x="3.5" y="1.5" width="15" height="19" rx="4" className="mark-sheet" />
      <path d="M7.5 6.2h7M7.5 15.6h4.5" className="mark-lines" />
      <rect x="6" y="9.1" width="10" height="3.6" rx="1.8" className="mark-lit" />
      <path d="M7.5 10.9h7" className="mark-lines-ink" />
    </svg>
  );
}

/** The Google "G", in Google's own four colors, for the sign-in button. */
export function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 18 18" width={size} height={size} aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573A8.9965 8.9965 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z"
      />
      <path
        fill="#EA4335"
        d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z"
      />
    </svg>
  );
}

/** A key cap, such as the Enter key beside the thing Enter will do. */
export function Key({ children, tone }: { children: React.ReactNode; tone?: "on" }) {
  return (
    <kbd className={"key" + (tone === "on" ? " on" : "")} aria-hidden="true">
      {children}
    </kbd>
  );
}
