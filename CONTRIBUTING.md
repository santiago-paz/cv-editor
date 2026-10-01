# Contributing

Issues and pull requests are welcome. One person runs this project, so open an
issue before you start a big change. That saves us both a rewrite.

## Set up

You need Node.js 20.9 or later.

```bash
npm install
npm run dev
```

Open http://localhost:3000. The editor works with no account and no keys. Sign-in
and the AI button need a database and API keys, so skip them unless you work on
those parts. `.env.example` lists every variable.

## Check your change

Run these three before you open a pull request:

```bash
npm run lint
npm run typecheck
npm test
```

Two of the tests start Chrome, and they skip themselves when Chrome is missing.
The text checks also need poppler for `pdftotext`. On a Mac, run
`brew install poppler`.

## Rules that keep the project in step

- One renderer. `renderCv` in `src/lib/cv/render.ts` feeds the preview and the PDF.
  Fix both together, never one.
- The page math in `src/lib/paginate.ts` follows the break rules of the templates.
  After a change to either, run `npm test`. It prints real PDFs and fails when the
  preview's cuts drift from Chrome's.
- Both templates take their top and bottom margins from the cells of a table and
  set `@page { margin: 0 }`. A browser prints its header and footer into any
  `@page` margin, so a margin there would put the date and the address on
  someone's CV.
- Rich text is cleaned twice: in the browser by `src/lib/sanitize.ts` and on the
  server by `src/lib/server/sanitize.ts`. The two must agree, and
  `tests/sanitize.test.ts` checks that.
- Every line the editor says lives in `src/lib/i18n/en.tsx` and is translated in
  `es.tsx`, `de.tsx` and `pt.tsx`. Components read `useT()` and hold no sentence
  of their own. The privacy page and the terms have one file per language in
  `src/lib/i18n/legal/`, so change the four together. If you do not speak a
  language, say so in the pull request.
- Colors, type and the marker come from the tokens at the top of
  `src/app/globals.css`. Use a token, not a new hex value.
- Typing a CV must never need the mouse. A box in the Enter flow carries
  `data-flow`. `npm run speedrun` types a whole CV with real key presses and
  times it.
- Suggestions come from the plain lists in `src/lib/suggest/data/`.
  `tests/suggest-data.test.ts` checks their format. A new job family needs its
  words, skills and bullets in English, Spanish and German.
- Prose, UI text and commit messages use the plain hyphen, never an em or en dash.

## Privacy

CVs never live on the server. The PDF route and the AI route read what they get
and keep nothing. If a change stores or sends personal data, add a line to the
privacy page and a row to `docs/compliance.md` before it ships.

Never put real personal data in the sample CV, in a test, in a screenshot or in an
issue. Use made-up people and `example.com` addresses.

Never commit a secret, an `.env` file, a database URL or a private address. Git
history stays public.

## Pull requests

- Keep each pull request to one change.
- Say what you saw before and what you see now. For a visual change, add a
  screenshot of the sample CV.
- Write the commit subject in English, in one short line.

## License

When you send a pull request, you agree that your work is under the MIT License,
the same as the rest of the project.

## Security

Report a vulnerability in private. See `SECURITY.md`.
