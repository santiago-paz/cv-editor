# CV Editor

Write a CV in the browser, see where each page breaks, and download it as a PDF.
There's no account and no database. Your CVs stay in your browser's localStorage.

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

The route has no rate limit. If you put it on the public internet, add one in
front of it, because each request opens a Chrome page.

## Tests

```bash
npm test
```

The tests cover the sanitizer (browser and server must agree), the templates'
escaping, the checks that repair an imported backup, storage, and the page math.
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
| `src/lib/storage.ts` | localStorage and backups |
| `src/lib/server/` | Chrome, the PDF and its metadata, the server's sanitizer |
| `src/app/api/pdf/route.ts` | The PDF route |
| `src/components/` | The editor |
| `public/fonts/` | PT Sans, PT Serif and Inter, copied from `@fontsource` by `npm run fonts` |

## Fonts

The CVs are set in PT Sans and PT Serif (Sidebar) and Inter (Classic), all under
the SIL Open Font License. The license files sit next to the fonts in
`public/fonts/`. They ship with the app because the server's Chromium has no
fonts of its own, and a different face would break lines in different places.
