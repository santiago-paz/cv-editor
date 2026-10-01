@AGENTS.md

# CV Editor

A CV editor that keeps CVs in the browser's localStorage. The main button makes
the PDF in the browser, through the print dialog. A second way prints it with
headless Chrome in `src/app/api/pdf/route.ts`. `src/lib/download.ts` holds both,
and `src/components/DownloadMenu.tsx` explains them to the person. An optional
Google account adds AI rewrites (`src/app/api/ai/`). See README.md.

Rules that keep the preview and the PDF in step:

- One renderer. `renderCv` in `src/lib/cv/render.ts` feeds both the preview
  iframe and the PDF. Never style or fix one without the other.
- The page math in `src/lib/paginate.ts` follows the templates' break rules
  (`.entry` never splits, an `<h2>` travels with the block under it). After a
  change to either, run `npm test`: `tests/pagination.test.ts` prints real PDFs
  and fails when the preview's cuts drift from Chrome's.
- Both templates set `@page { margin: 0 }` and take their top and bottom
  margins from the spacer cells of a table (`flow` and `spacers` in
  `src/lib/cv/templates/index.ts`). A browser prints its header and footer into
  any `@page` margin, and the print dialog has them on, so a margin there puts
  the date and the address on someone's CV. `tests/pdf.test.ts` checks it.
- Rich text is cleaned twice, by `src/lib/sanitize.ts` in the browser and
  `src/lib/server/sanitize.ts` on the server. `tests/sanitize.test.ts` runs every
  case through both; they must agree.
- The CV fonts ship in `public/fonts` because the server's Chromium has none.
  Changing a face means changing `scripts/copy-fonts.mjs` and
  `src/lib/cv/fonts.ts` together.
- The sample CV is a made-up person on example.com addresses. Never put real
  personal data in it.

Rules that keep the editor fast and in one style:

- Typing a CV must never need the mouse. A box in the Enter flow carries
  `data-flow` (`Combo` and `RichField` add it), and a row that Enter adds is
  drawn first and then focused with `changeThenFocus`. Side buttons, such as
  the AI button, stay out of the flow. `npm run speedrun` types a whole CV with
  real key presses and times it, so run it after a change to the flow.
- Suggestions come from the plain lists in `src/lib/suggest/data/`.
  `tests/suggest-data.test.ts` checks their format. A new job family needs its
  words, skills and bullets in English, Spanish and German.
- Colors, type and the marker come from the tokens at the top of
  `src/app/globals.css`, defined once for light and dark with `light-dark()`.
  Use a token, not a new hex value.
- The editor speaks Spanish, English, German and Portuguese, apart from the
  CV's own language. Every word it says lives in `src/lib/i18n/en.tsx` and is
  translated in `es.tsx`, `de.tsx` and `pt.tsx`; components read `useT()` and
  hold no sentence of their own. The privacy and terms pages are one file per
  language in `src/lib/i18n/legal/`; change the four together.

Rules the privacy page promises, so the code must keep them:

- CVs never live on the server. The PDF route and the AI route read what they
  are sent and keep nothing.
- Save as PDF, the main button on a computer, sends nothing: the browser makes
  the file. The CV reaches the PDF route only when the person picks Download a
  PDF file, or on a phone or tablet, where that is the main button. The menu
  beside the button and the privacy page say so, so change all three together.
- The AI route sends the model only a block's text, its title, the job's
  dates and the CV's language. The `ai_log` table stores counts, never text.
  Nothing logs a request body.
- The model's reply is rich text from outside: `sanitizeServer` cleans it in
  the route, and `sanitize` cleans it again in the browser.
- Sign-in keeps no IP address, browser string, Google profile photo link or
  Google token. `makeHooks` in `src/lib/server/auth-hooks.ts` blanks them, and
  `tests/auth-hooks.test.ts` runs the real Better Auth to prove it.
- Visits are counted by Vercel Web Analytics and nothing else. `<Analytics />`
  in `src/app/layout.tsx` draws only on the production deploy. It sets no
  cookie and keeps no IP address, and it loads from the site's own address, so
  the Content Security Policy needs no entry for it. A custom event or another
  analytics tool needs a line on the privacy page and a row in
  `docs/compliance.md` first, and must never carry CV text or anything
  personal.
- How long the server keeps data lives in `src/lib/keep.ts`. `retention.ts`
  enforces it and the privacy page prints it, so change the numbers there and
  nowhere else.
- Anything new that stores or sends personal data needs a line on the privacy
  page and a row in `docs/compliance.md` before it ships.
- The security headers live in `next.config.ts`. A new host, script or frame
  needs an entry in its Content Security Policy first. Test it on a production
  build, because dev mode relaxes the policy.

This repo is public. Never commit a secret, an `.env` file, a database URL, the
operator's address, a registry or case number, or the ID of a Vercel, Neon,
Google Cloud or Claude project. They live in the host's settings. Check each new
file for them before the commit, because git history stays public too.

Prose, UI copy and commit messages use the plain hyphen, never an em or en dash.
