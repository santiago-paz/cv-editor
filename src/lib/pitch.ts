/* What CV Editor is, in a few English words. The editor draws in the browser
   only, so its server HTML is nearly empty. These words are in it anyway: on
   the loading sheet, in the structured data, and in the social card. A crawler
   that runs no script, a screen reader before the editor loads and a person on
   a slow phone all read them. The server cannot know a visitor's language, so
   they are English, and the editor replaces them once it is in the person's
   language. Every claim comes from the README and the code: the timing is the
   one `npm run speedrun` measures, and the two PDF ways are the two in the PDF
   menu. Change a fact there and here together. */

export const PITCH = {
  heading: "Free online CV editor",
  tagline: { before: "Type a few letters, press ", mark: "Enter", after: ", and your CV fills in." },
  lead: "CV Editor is a free tool for writing a CV in your browser. Suggestions fill each box, a live preview shows where each page breaks, and you save the result as a PDF. You do not need an account, and your CVs stay on your device.",
  facts: ["Free", "No account", "Stays in your browser"],
  features: [
    "Suggestions in every box",
    "A preview that matches the PDF",
    "Two templates",
    "A photo, if you want one",
    "As many CVs as you need",
    "An editor in four languages",
  ],
} as const;
