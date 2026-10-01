# CV Editor

Write a CV in the browser, see where each page breaks, and download it as a PDF.
You don't need an account, and your CVs stay in your browser's localStorage. A
free Google account adds one thing: a button that rewrites a block with AI.

Live at https://cv-editor-ruby.vercel.app. Every push to `main` deploys there.

You type a few letters in a box and press Enter. The best match fills in and
the next box opens, so a whole CV takes about a minute. On a test CV (two jobs,
a degree, eight skills, three languages and a summary), a fast typist needs 42
seconds when they take the suggested bullets, and 58 when they type every
bullet. The typist here writes seven characters a second. `npm run speedrun`
repeats the measurement.

The preview uses the same HTML and fonts as the PDF, so its page count matches
the file you download. Dashed cut lines show where each new page starts, and a
pill at the foot of the preview says how full the last page is.

## What it does

- Suggestions in every box, in the language of the CV: job titles, companies,
  schools, degrees, cities, skills, languages, levels, dates, email domains,
  links and whole bullets for the job you named. The skills and bullets follow
  the kind of job. Text you wrote in your other CVs comes first.
- Six steps, one box at a time: About you, Experience, Education, Skills,
  Languages and Summary. A plus button adds sections such as Projects, Awards
  or a free paragraph.
- A highlighter on the preview marks the line of the box you are typing in, and
  the sheet scrolls to keep it in view. Click any line to jump to its box.
- Two templates. Sidebar fits one page, with a colored rail for contact
  details, skills and languages. Classic is one column, up to two pages, and
  suits job portals that copy a CV into their own form fields.
- A page pill with the page count, how full the last page is, and how much
  paper is left empty when an entry moves to the next page. The editor also
  flags a heading left alone at the foot of a page.
- Two ways to get the PDF. The main button, Save as PDF, opens your browser's
  print dialog, so the CV never leaves your device. The arrow beside it offers
  Download a PDF file, which has the server print the CV with Chrome. Its menu
  says what each way does and where your CV goes.
- A photo you can crop by dragging and zooming, with the print resolution shown
  as you go. Every CV uses the same photo, and each one can leave it out.
- The Style menu holds the layout, seven rail colors or any hex value (with a
  contrast check), and the CV's language: English, Spanish or German.
- As many CVs as you like, in the list behind the CV's name at the top:
  duplicate one for each job, and back them all up to a JSON file you can
  restore in any browser.
- Settings holds the theme, the zoom, backups, a switch that forgets your CVs
  when you close the tab, and the account. That switch is for a shared
  computer. The CVs and photo then live in the tab's sessionStorage.
- Bold, italics and links in the summary and bullets. Pasted text arrives as
  plain text.
- Light and dark themes, and a layout that works on a phone.

## Typing a CV

| Key | What it does |
| --- | --- |
| Enter | Takes the lit suggestion and moves to the next box. With nothing lit, it keeps what you typed. |
| Tab | Takes the lit suggestion and moves on the normal way. |
| Right arrow | Takes the lit suggestion and stays in the box, to keep typing. |
| Up, down | Move through the suggestions. |
| Esc | Puts the list away. |
| Cmd or Ctrl + Enter | Goes to the next step. |
| Alt + arrows | Moves a bullet up or down, or a skill along its row. |
| Cmd or Ctrl + B, I, K | Bold, italics, link. |

A blank CV opens with the caret in the name box on a desktop screen, so the
first key already types. Enter on an empty bullet leaves the list. Enter on the
last box of a step opens the next step. Dates take a short form: `3/22 -` becomes `Mar 2022 - Present`,
and `2019 2022` becomes `2019 - 2022`.

## Where the suggestions come from

The lists are plain text in `src/lib/suggest/data/`, one file per kind and
language. A line is `Display|alias|alias`: the first part goes into the CV, and
the aliases only help matching, so `ts` finds `TypeScript|TS`. A `*` after a job
title lets it take Senior, Junior or Lead. In Spanish and German a mark such as
`[o|a]` writes both forms of a title. The job families (`families.*.ts`) tie a
kind of job to the words that find it, the skills it lists and the bullets it
suggests.

Matching ignores case and accents, takes the letters in any order, and knows
initials. `tests/suggest-data.test.ts` checks every list, so a new entry that
breaks a rule fails the test. `src/lib/suggest/catalog.ts` builds the indexes the
first time a language is used.

## How the PDF is made

There are two ways. The main button takes one, and the arrow beside it offers
the other. The menu behind the arrow says what each does.

| | Save as PDF | Download a PDF file |
| --- | --- | --- |
| Who makes the file | Your browser | Our server, with headless Chrome |
| Where the CV goes | Nowhere. It stays on your device. | To the server for a moment. It keeps no copy. |
| Steps | Choose Save as PDF in the print dialog | One click |
| Author, keywords and language in the file | No | Yes |
| Page breaks | The browser's own. The tests check Chrome only. | The same as the preview |
| Main button | On a computer | On a phone or tablet |

**Save as PDF.** The editor builds the same HTML and fonts as the preview, loads
them in a hidden frame and opens the browser's print dialog. Chrome suggests the
page's title as the file name, so the page wears the file's name while the
dialog is open. Cmd or Ctrl + P opens the same dialog. Nothing is sent, and
nothing needs a server.

**Download a PDF file.** The browser sends the CV to `POST /api/pdf`. The server
builds the HTML from that data, prints it with headless Chrome, writes the
title, author and keywords into the PDF's metadata, and sends the file back. It
keeps no copy of the CV or the PDF. A phone or tablet gets this as the main
button because its browser tends to print the page around a hidden frame, not
the frame.

The page Chrome prints from is locked down. The server builds the markup from
checked data and never takes HTML from the request, and it cleans rich text
again. A Content Security Policy blocks scripts, and the page may load nothing
but its own fonts, which the server reads from disk.

Both templates keep their page margins out of `@page`. A browser prints its
header and footer (the date, the address, the page number) into any `@page`
margin, and the print dialog has them on by default. Each template takes its top
and bottom margins from the first and last rows of a table, which repeat on every
page, and sets `@page` to 0, so there is nowhere for that text to go.
`tests/pdf.test.ts` checks it.

If the server can't make the file, the editor offers Save as PDF instead. If the
print dialog can't open, it offers the file download.

## Run it

You need Node.js 20.9 or later. Save as PDF needs nothing more. Google Chrome is
for the PDF file download and for two of the tests.

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

The CV menu ends with a "Made by" line and a Donate link. The first PDF of
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
the summary, once there is text to improve. It sends that block's text, the
title above it, the job's dates and the CV's language to Claude Haiku 4.5, and
shows each rewrite under the line it would replace, with the new words marked.
Nothing changes until you use a suggestion, and each one can be put back.
The button is not part of the Enter flow, so typing stays as fast as before.

The button needs an account, and sign-in is Google only (Better Auth). Signed
out, the button explains that and offers the Google button. Settings shows who
is signed in and how many rewrites are left, with Sign out and Delete account.
The account code loads the first time Settings or the button needs it. Each
account gets 10 rewrites a day and 30 a month. The whole site stops for the
day once it has spent about 65 cents, which keeps a month under $20. Set
`AI_PAUSED=1` to turn the button off.

The database (Neon Postgres) holds the accounts and one row per rewrite: who,
when, how many tokens, and whether the suggestion was used. It never stores
the text. Sessions keep no IP address or browser string, and sign-in saves
neither Google's tokens nor the photo link (`src/lib/server/auth-hooks.ts`).

Old data goes on a schedule. A session lasts 7 days after its last use, a
rewrite row 12 months, and an account with no rewrite for 12 months is
deleted. The windows are in `src/lib/keep.ts`, and `src/lib/server/retention.ts`
runs the deletes, at most once an hour, after a sign-in or a rewrite.

| Variable | What it is |
| --- | --- |
| `DATABASE_URL` | The Neon database. Vercel's Neon integration sets it. |
| `OPERATOR_ADDRESS` | The postal address the privacy page prints. Ley 25.326 asks for it. Pages are built ahead of time, so deploy again after you set it. |
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

## Privacy, terms and headers

The privacy page and the terms are written for Argentina's data law (Ley 25.326)
and cover the EU basics too. `docs/compliance.md` lists which rules apply,
where each lives in the code, and what only the person who runs the site can
do, such as registering the database with the AAIP.

`next.config.ts` sends a Content Security Policy and four more security
headers on every response. The policy lets a page load only from the site
itself, so a new host, script or frame needs an entry there. Check it on a
production build (`npm run build`, then `npm start`), because dev mode
relaxes it.

## Tests

```bash
npm test
```

The tests cover the sanitizer (browser and server must agree), the templates'
escaping, the checks that repair an imported backup, storage, the page math,
what the AI button may send, how its reply gets cleaned and how its changes are
marked, what the editor says when the server won't make a PDF, how the print
dialog opens and cleans up, and the suggestions: every list, the matching, the
dates, the job families and the sources each box reads.
Two of them start Chrome: one prints CVs, reads the text back with `pdftotext`
and checks that no browser header or footer lands on the page, and one checks
that the preview's page breaks land where the PDF breaks. Both skip themselves
when Chrome is missing, and the text checks need poppler (`brew install poppler`).

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
| `src/lib/download.ts` | The two ways to get the PDF: the print dialog and the file from the server |
| `src/lib/suggest/` | The suggestion engine: ranking, dates, history, the catalogs and what each box reads |
| `src/lib/suggest/data/` | The lists: titles, skills, degrees, companies, schools, cities and the job families |
| `src/lib/ai.ts` | What the AI button sends and gets back, and its limits |
| `src/lib/ai-diff.ts` | Marks the words an AI suggestion changed |
| `src/lib/sign-in.ts` | The browser's side of Google sign-in |
| `src/lib/keep.ts` | How long the server keeps sessions, rewrite rows and idle accounts |
| `src/lib/operator.ts` | Who runs the site, for the privacy page and the terms |
| `src/lib/server/` | Chrome, the PDF and its metadata, the server's sanitizer, sign-in, the database, the model call and its usage counts |
| `src/app/api/pdf/route.ts` | The PDF route |
| `src/app/api/ai/` | The AI routes: rewrite, accept, usage |
| `src/app/api/auth/` | Sign-in, handled by Better Auth |
| `src/app/privacy/`, `src/app/terms/` | The privacy page and the terms |
| `src/components/` | The editor: top bar, panel, stage, menus |
| `src/components/DownloadMenu.tsx` | The PDF button and the menu that explains its two ways |
| `src/components/steps/` | One file per kind of step: About you, jobs, skills, languages, summary |
| `src/components/ui/` | The boxes that suggest, the suggestion list, chips, popovers and the Enter flow |
| `scripts/migrate.mjs` | Creates the database tables |
| `docs/compliance.md` | Which laws apply, where each duty lives in the code, and what is still open |
| `public/fonts/` | PT Sans, PT Serif and Inter, copied from `@fontsource` by `npm run fonts` |

## Fonts

The CVs are set in PT Sans and PT Serif (Sidebar) and Inter (Classic), all under
the SIL Open Font License. The license files sit next to the fonts in
`public/fonts/`. They ship with the app because the server's Chromium has no
fonts of its own, and a different face would break lines in different places.
