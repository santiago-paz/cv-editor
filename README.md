# CV Editor

Write a CV in the browser, see where each page breaks, and download it as a PDF.
You don't need an account, and your CVs stay in your browser's localStorage. A
free Google account adds one thing: a button that rewrites a block with AI.

Live at https://cv-editor-ruby.vercel.app. Every push to `main` deploys there.

The preview uses the same HTML and fonts as the PDF, so its page count matches
the file you download. Dashed cut lines show where each new page starts, and a
gauge at the foot of the screen says how full the last page is.

## What it does

- Two templates. Sidebar fits one page, with a colored rail for contact
  details, skills and languages. Classic is one column, up to two pages, and
  suits job portals that copy a CV into their own form fields.
- Page gauges: page count, how full the last page is, and how much paper is
  left empty when an entry moves to the next page. The editor also flags a
  heading left alone at the foot of a page.
- Click any line in the preview to jump to its field.
- A photo you can crop by dragging and zooming, with the print resolution shown
  as you go. Every CV uses the same photo, and each one can leave it out.
- Seven rail colors or any hex value, with a contrast check.
- Headings in English, Spanish or German.
- As many CVs as you like: duplicate one for each job, and back them all up to
  a JSON file you can restore in any browser.
- One Settings button holds the rest: the theme, the zoom, backups, and a
  switch that forgets your CVs when you close the tab. That switch is for a
  shared computer. The CVs and photo then live in the tab's sessionStorage.
- The button at the left of the header folds the CV list away, to give the
  preview more room. The editor remembers it for next time.
- Bold, italics and links in the summary and bullets. Pasted text arrives as
  plain text.

## How the PDF is made

The browser sends the CV to `POST /api/pdf`. The server builds the HTML from that
data, prints it with headless Chrome, writes the title, author and keywords into
the PDF's metadata, and sends the file back. It keeps no copy of the CV or the PDF.

The page Chrome prints from is locked down. The server builds the markup from
checked data and never takes HTML from the request, and it cleans rich text
again. A Content Security Policy blocks scripts, and the page may load nothing
but its own fonts, which the server reads from disk.

If the server can't make the PDF, the editor offers the browser's own print
dialog instead. Choose "Save as PDF" there.

## Run it

You need Node.js 20.9 or later and Google Chrome.

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:3000.

The PDF route looks for Chrome in the usual places on macOS, Linux and Windows.
If yours is somewhere else, point `CHROME_PATH` at it:

```bash
CHROME_PATH=/usr/bin/chromium npm run dev
```

## Deploy

On Vercel or AWS Lambda, the route runs the Chromium build from
`@sparticuz/chromium` instead, so there's nothing to install. `next.config.ts`
already ships its files and the fonts with the function. That package asks for
at least 1 GB of memory, and it unpacks Chromium on a cold start. On the live
site, the first PDF after a cold start took 3.6 seconds and the next one half a
second.

Anywhere else, run `npm run build` and `npm start` on a machine with Chrome or
Chromium, and set `CHROME_PATH` if it isn't in a standard place.

Each request opens a Chrome page, so the live site limits the route. A rule in
the project's Vercel Firewall lets each IP address make 20 PDFs a minute and
answers the rest with a 429. The editor then asks the person to wait a minute
and offers the browser's print dialog. The rule lives in Vercel's settings, not
in this repo, so another host needs its own limit.

## Donate link and credit

The CV list ends with a "Made by" line and a Donate link. The first PDF of
each visit also shows a short note with a Donate button. Donate goes to the
PayPal.me link in `src/lib/site.ts`. Two environment variables can change
where the links point:

| Variable | What it sets |
| --- | --- |
| `NEXT_PUBLIC_DONATE_URL` | Replaces the PayPal.me link. |
| `NEXT_PUBLIC_AUTHOR_URL` | Where the author's name links. Unset, the name shows as plain text. |

Only `https://` addresses count, and anything else hides its link. Next.js
writes both into the JavaScript at build time, so after you set them in
Vercel, deploy again.

## Accounts and AI

"Improve with AI" sits under each job, project, bullet list, paragraph and
the summary. It sends that block's text, the title above it, the job's dates
and the CV's language to Claude Haiku 4.5, and shows the rewrite next to the
original. Nothing changes until you use a suggestion, and each one can be put
back.

The button needs an account, and sign-in is Google only (Better Auth). Each
account gets 10 rewrites a day and 30 a month. The whole site stops for the
day once it has spent about 65 cents, which keeps a month under $20. Set
`AI_PAUSED=1` to turn the button off.

The database (Neon Postgres) holds the accounts and one row per rewrite: who,
when, how many tokens, and whether the suggestion was used. It never stores
the text.

| Variable | What it is |
| --- | --- |
| `DATABASE_URL` | The Neon database. Vercel's Neon integration sets it. |
| `BETTER_AUTH_SECRET` | A random secret that signs sessions: `openssl rand -base64 32`. |
| `BETTER_AUTH_URL` | The site's own address: `https://cv-editor-ruby.vercel.app`, or `http://localhost:3000` in development. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | A Google Cloud OAuth client of type "Web application". |
| `ANTHROPIC_API_KEY` | A key from the Claude Console, in a workspace with a spend limit. |

The Google client needs both redirect addresses:
`https://cv-editor-ruby.vercel.app/api/auth/callback/google` and
`http://localhost:3000/api/auth/callback/google`. Google sends people back only
to listed addresses, so sign-in doesn't work on preview deployments.

To work on it locally, pull the variables and create the tables once:

```bash
vercel env pull .env.local
```

```bash
npm run db:migrate
```

## Tests

```bash
npm test
```

The tests cover the sanitizer (browser and server must agree), the templates'
escaping, the checks that repair an imported backup, storage, the page math,
and what the AI button may send and how its reply gets cleaned.
Two of them start Chrome: one prints CVs and reads the text back with
`pdftotext`, and one checks that the preview's page breaks land where the PDF
breaks. Both skip themselves when Chrome is missing, and the text checks need
poppler (`brew install poppler`).

```bash
npm run lint
```

```bash
npm run typecheck
```

## Where things are

| Path | What it holds |
| --- | --- |
| `src/lib/cv/` | The CV model, the sample, the schema that reads and repairs a CV, and the renderer |
| `src/lib/cv/templates/` | The two templates: their print stylesheets and markup |
| `src/lib/paginate.ts` | Where Chrome will break the pages |
| `src/lib/measure.ts` | Reads the preview's layout for that math |
| `src/lib/storage.ts` | localStorage, the tab that forgets its CVs, and backups |
| `src/lib/site.ts` | The Donate and author links |
| `src/lib/ai.ts` | What the AI button sends and gets back, and its limits |
| `src/lib/server/` | Chrome, the PDF and its metadata, the server's sanitizer, sign-in, the database, the model call and its usage counts |
| `src/app/api/pdf/route.ts` | The PDF route |
| `src/app/api/ai/` | The AI routes: rewrite, accept, usage |
| `src/app/api/auth/` | Sign-in, handled by Better Auth |
| `src/app/privacy/`, `src/app/terms/` | The privacy page and the terms |
| `src/components/` | The editor |
| `scripts/migrate.mjs` | Creates the database tables |
| `public/fonts/` | PT Sans, PT Serif and Inter, copied from `@fontsource` by `npm run fonts` |

## Fonts

The CVs are set in PT Sans and PT Serif (Sidebar) and Inter (Classic), all under
the SIL Open Font License. The license files sit next to the fonts in
`public/fonts/`. They ship with the app because the server's Chromium has no
fonts of its own, and a different face would break lines in different places.
