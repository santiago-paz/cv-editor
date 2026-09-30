@AGENTS.md

# CV Editor

A CV editor that keeps CVs in the browser's localStorage and prints them to PDF
with headless Chrome in `src/app/api/pdf/route.ts`. An optional Google account
adds AI rewrites (`src/app/api/ai/`). See README.md.

Rules that keep the preview and the PDF in step:

- One renderer. `renderCv` in `src/lib/cv/render.ts` feeds both the preview
  iframe and the PDF. Never style or fix one without the other.
- The page math in `src/lib/paginate.ts` follows the templates' break rules
  (`.entry` never splits, an `<h2>` travels with the block under it). After a
  change to either, run `npm test`: `tests/pagination.test.ts` prints real PDFs
  and fails when the preview's cuts drift from Chrome's.
- Rich text is cleaned twice, by `src/lib/sanitize.ts` in the browser and
  `src/lib/server/sanitize.ts` on the server. `tests/sanitize.test.ts` runs every
  case through both; they must agree.
- The CV fonts ship in `public/fonts` because the server's Chromium has none.
  Changing a face means changing `scripts/copy-fonts.mjs` and
  `src/lib/cv/fonts.ts` together.
- The sample CV is a made-up person on example.com addresses. Never put real
  personal data in it.

Rules the privacy page promises, so the code must keep them:

- CVs never live on the server. The PDF route and the AI route read what they
  are sent and keep nothing.
- The AI route sends the model only a block's text, its title, the job's
  dates and the CV's language. The `ai_log` table stores counts, never text.
  Nothing logs a request body.
- The model's reply is rich text from outside: `sanitizeServer` cleans it in
  the route, and `sanitize` cleans it again in the browser.

Prose, UI copy and commit messages use the plain hyphen, never an em or en dash.
