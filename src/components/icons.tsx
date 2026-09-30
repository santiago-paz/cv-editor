/* Small line icons, drawn on a 12px grid. */

const PATHS = {
  up: "M6 10V2M2.5 5.5 6 2l3.5 3.5",
  down: "M6 2v8M2.5 6.5 6 10l3.5-3.5",
  close: "M2.5 2.5l7 7M9.5 2.5l-7 7",
  copy: "M4 4h6v6H4zM2 8V2h6",
  download: "M6 1.5v6.5M3.25 5.5 6 8.25 8.75 5.5M2 10.5h8",
  plus: "M2 6h8M6 2v8",
  minus: "M2 6h8",
  open: "M4 2.5 7.5 6 4 9.5",
  shut: "M2.5 4 6 7.5 9.5 4",
  upload: "M6 8V1.5M3.25 4.25 6 1.5l2.75 2.75M2 10.5h8",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}

/** The mark: a sheet with a cut line across it. */
export function Mark() {
  return (
    <svg viewBox="0 0 16 20" aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="13" height="17" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 5h8M4 7.5h6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M-1 12h18" stroke="var(--rose)" strokeWidth="1.2" strokeDasharray="2 1.6" />
    </svg>
  );
}
