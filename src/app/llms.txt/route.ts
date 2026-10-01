import { REPO_URL, SITE_NAME, SITE_URL } from "@/lib/seo";

/* A plain-text summary for language models and the tools that fetch pages for
   them, in the llms.txt layout (llmstxt.org). No provider has said it reads
   this file, so it is a small bet, kept short and true. It repeats facts the
   README already states; change them together. */

export const dynamic = "force-static";

const TEXT = `# ${SITE_NAME}

> ${SITE_NAME} is a free online tool for writing a CV in your browser. Suggestions fill each box, a live preview shows where each page breaks, and the result is saved as a PDF. No account is needed, and CVs stay on the user's device.

${SITE_NAME} is open source and made by Santiago Paz. The editor speaks English, Spanish, German and Portuguese. A CV can be written in English, Spanish or German.

## Key facts

- Price: free, with no watermark and no paid plan.
- Account: not needed. An optional Google sign-in unlocks a button that rewrites a bullet or a summary with AI.
- Storage: CVs, photo and settings stay in the browser's local storage. They are not kept on the server.
- PDF: saved through the browser's print dialog, which sends nothing, or as a file that the server makes and does not keep.
- Templates: Sidebar (one page, with a colored rail) and Classic (one column, up to two pages).
- Speed: a test CV with two jobs, a degree, eight skills, three languages and a summary took a typist 42 to 58 seconds.

## Pages

- [Editor](${SITE_URL}): the app itself, where you write a CV
- [Privacy](${SITE_URL}/privacy): what is kept, where, and for how long
- [Terms](${SITE_URL}/terms): the rules for using the editor

## Source

- [GitHub repository](${REPO_URL}): the code, the README and how to run your own copy
`;

export function GET() {
  return new Response(TEXT, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
