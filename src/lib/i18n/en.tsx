import type { ReactNode } from "react";

/* Every word the editor says, in English. The other languages are written
   against this file: `Dict` is its shape, so a language that misses a line does
   not compile, and tests/i18n.test.ts checks what the compiler cannot.

   A line is a plain string, or a function when it takes a name, a number or a
   piece of markup. Each language writes its own plurals and word order inside
   the function. Plain hyphens only, as everywhere else in the editor.

   These are the editor's words, not the CV's. What a CV prints on its own and
   what the boxes suggest follow the CV's language (src/lib/cv/labels.ts and
   src/lib/suggest). */

const en = {
  language: {
    label: "Language",
  },

  common: {
    undo: "Undo",
    cancel: "Cancel",
    back: "Back",
    /** The name printed on the Control key, for the keycap under Next. */
    ctrl: "Ctrl",
    delete: "Delete",
    /** Read out after a link that opens another tab. */
    newTab: " (opens in a new tab)",
  },

  bar: {
    saved: "Saved",
    savedInTab: "Saved in this tab",
    notSavedFull: "Not saved: storage is full",
    notSavedBlocked: "Not saved: this browser blocks storage",
  },

  /** The PDF button and the menu beside it. There are two ways to get the PDF:
      the browser's print dialog, which keeps the CV on the device, and a file
      that the server makes. */
  pdf: {
    making: "Making the PDF…",
    /** The main button when it prints. On a narrow screen only the second part
        shows, so it must read well alone. */
    printLead: "Save as ",
    printWord: "PDF",
    printTitle: "Opens your browser's print dialog. Your CV stays on this device.",
    /** The main button when it makes a file. " PDF" is added when the bar is wide. */
    fileWord: "Download",
    fileMore: " PDF",
    fileLabel: "Download PDF",
    fileTitle: "Downloads a PDF file made on our server.",
    menuLabel: "Ways to get the PDF",
    moreLabel: "More ways to get the PDF",
    /** Marks the way the main button takes. */
    tagDefault: "Default",
    print: {
      title: "Save as PDF",
      hint: "Opens your browser's print dialog. Choose Save as PDF there. The file has no author or keywords.",
      fact: "Your CV never leaves this device.",
    },
    file: {
      title: "Download a PDF file",
      hint: "You get the file in one click. Our server prints your CV with Chrome and sends the PDF back. The file has your name as author and your skills as keywords.",
      fact: "Your CV goes to our server. It keeps no copy.",
    },
    cautionPhone: "Phones and tablets may print the whole page, not just the CV.",
    cautionBrowser: "Page breaks are tested in Chrome. Check them in the dialog's preview.",
  },

  cvs: {
    label: "Your CVs",
    /** What a CV with no name is called in lists. */
    untitled: "Untitled CV",
    /** The title the sample CV starts with. */
    sampleTitle: "Sample CV",
    /** Goes in "Frontend CV (copy)" and "Frontend CV (copy 2)". */
    copyWord: "copy",
    nameLabel: "Name of this CV",
    nameNote: "Only you see this name. It is never printed. Leave it empty to use your own name.",
    sample: "Sample",
    justNow: "just now",
    minutesAgo: (n: number) => `${n} min ago`,
    hoursAgo: (n: number) => `${n} h ago`,
    daysAgo: (n: number) => `${n} d ago`,
    copyOf: (name: string) => `Make a copy of ${name}`,
    deleteOf: (name: string) => `Delete ${name}`,
    new: "New CV",
    trySample: "Try the sample",
    madeBy: "Made by",
    donate: "Donate",
    /** Read out after "Donate". */
    donateVia: " with PayPal (opens in a new tab)",
  },

  style: {
    label: "Style of the CV",
    button: "Style",
    layout: "Layout",
    onePage: "1 page",
    upToPages: (n: number) => `Up to ${n} pages`,
    sidebarColor: "Sidebar color",
    hardToRead: "Text is hard to read",
    easyToRead: "Text is easy to read",
    pickAny: "Pick any color",
    customColor: "Custom sidebar color",
    hex: "Hex",
    badHex: "Type 6 hex digits, like #1E4A35.",
    thisCvOnly: "Applies to this CV only.",
    cvLanguage: "CV language",
    cvLanguageNote:
      "Changes the headings the layout prints itself, like Skills and Languages. It also changes the suggestions. Headings you renamed stay as they are.",
    /** Keyed by the English names in src/lib/color.ts. */
    colors: {
      Navy: "Navy",
      Cobalt: "Cobalt",
      Petrol: "Petrol",
      Forest: "Forest",
      Burgundy: "Burgundy",
      Plum: "Plum",
      Charcoal: "Charcoal",
    },
  },

  templates: {
    sidebar: {
      name: "Sidebar",
      note: "One page, with a colored rail for your contact details, skills and languages.",
    },
    classic: {
      name: "Classic",
      note: "One column, up to two pages. Job portals that copy your CV into their forms read it best.",
    },
  },

  /** The words of the links to the terms and the privacy page, inside a sentence. */
  legal: {
    termsLink: "Terms",
    privacyLink: "Privacy page",
  },

  settings: {
    label: "Settings",
    look: "Look",
    theme: "Theme",
    auto: "Auto",
    light: "Light",
    dark: "Dark",
    zoom: "Zoom",
    fit: "Fit",
    actualSize: "100%",
    cvs: "Your CVs",
    tabNote: "Your CVs and photo stay in this tab only. Closing it deletes them, so back up any you want to keep.",
    browserNote: "Your CVs are saved in this browser only. Clearing its site data deletes them, so keep a backup.",
    forget: "Forget my CVs when I close this tab",
    backUp: "Back up",
    restore: "Restore",
    account: "Account",
    privacy: "Privacy",
    terms: "Terms",
  },

  account: {
    checking: "Checking your account…",
    checkFailed: "Could not check your account. Try again in a minute.",
    only: "An account is only for AI rewrites. Your CVs stay in this browser either way.",
    opening: "Opening Google…",
    continue: "Continue with Google",
    startFailed: "Could not start the sign-in. Try again in a minute.",
    /** Under the Google button: where the data goes, and what continuing accepts. */
    consent: (terms: ReactNode, privacy: ReactNode) => (
      <>
        Your data is processed in the United States. By continuing you accept the {terms} and the {privacy}.
      </>
    ),
    leftLabel: "AI rewrites left",
    today: "Today",
    month: "This month",
    left: (n: number) => `${n} left`,
    confirm: "Delete your account and your AI history? Your CVs stay in this browser.",
    delete: "Delete account",
    needsRecent: "Deleting needs a recent sign-in. Sign out, sign in again, then delete.",
    signOut: "Sign out",
  },

  editor: {
    skip: "Skip to the preview",
    writeLabel: "Write your CV",
    emptyTitle: "No CVs yet",
    emptyText: "Start a new one, or open the sample to see how the editor works.",
    openSample: "Open the sample",
    dockLabel: "Show",
    edit: "Edit",
    preview: "Preview",
    signedIn: (email: string) => `Signed in as ${email}. Press Improve with AI to try it.`,
    copyMade: (title: string) => `Made a copy called “${title}”. The original stays as it was.`,
    deleted: (name: string) => `Deleted “${name}”.`,
    backedUp: (n: number) =>
      `Saved a backup of ${n} ${n === 1 ? "CV" : "CVs"}. Open it with Restore, in this browser or another.`,
    restored: (added: number, replaced: number, kept: number, photo: boolean) => {
      const changed = [added && `${added} added`, replaced && `${replaced} updated`].filter(Boolean);
      const stayed = kept
        ? ` ${kept} stayed as ${kept === 1 ? "it was, because the copy" : "they were, because the copies"} here ${kept === 1 ? "is" : "are"} newer.`
        : "";
      return `Restored the backup${changed.length ? `: ${changed.join(", ")}` : ""}.${stayed}${photo ? " The photo came back too." : ""}`;
    },
    photoFull: "This browser's storage is full, so the photo is not saved. Delete some CVs, or use a smaller photo.",
    photoBlocked: "This browser does not let the editor save, so the photo lasts until you close the tab.",
    photoDropped: "Saved the photo. The original did not fit in storage, so a later adjustment starts from the crop.",
    photoSaved: "Saved the photo.",
    photoRemoved: "Removed the photo from every CV.",
    tabFull: "This tab has no room for your CVs, so they stay saved in this browser.",
    tabBlocked: "This browser does not let a tab keep its own copy, so your CVs stay saved in the browser.",
    tabOn: "This tab now forgets your CVs when you close it. Back up any you want to keep.",
    tabOnAction: "Back up",
    browserFull: "This browser's storage is full, so your CVs stay in this tab only. Delete some CVs, or back them up.",
    browserBlocked: "This browser does not let the editor save, so your CVs stay in this tab only.",
    browserOn: "Your CVs are saved in this browser again.",
    emptyCv: "The CV is empty. Add your name and job title first.",
    downloaded: (name: string) => `Downloaded ${name}`,
    /** Follows "Downloaded {name}." in the thank-you after the first PDF. */
    donateAsk: "If the editor helped, you can support it with a donation.",
    donate: "Donate",
    printHint: " You can save it from your browser's print dialog instead.",
    printFailed: "The print dialog did not open. You can download a PDF file instead.",
    downloadFile: "Download file",
    savedKeyTab: "Saved in this tab. Everything saves as you type.",
    savedKeyBrowser: "Saved in this browser. Everything saves as you type.",
  },

  panel: {
    /** The names of the steps. A section's own heading names its step. */
    you: "You",
    untitled: "Untitled",
    skills: "Skills",
    languages: "Languages",
    summary: "Summary",
    filledIn: " (filled in)",
    sampleNote: (start: ReactNode) => (
      <>
        This is a sample. Type over it, or {start}.
      </>
    ),
    startOwn: "start your own CV",
    parts: "Parts of the CV",
    addSection: "Add a section",
    allSections: "Every kind of section is already on the CV.",
    next: (label: string) => (
      <>
        Next: <b>{label}</b>
      </>
    ),
    /** Under the Next button. The two links are the privacy page and the terms. */
    serversNote: (privacy: ReactNode, terms: ReactNode) => (
      <>
        Save as PDF stays on your device. The PDF file download and AI rewrites run on servers in the US. {privacy}
        <span aria-hidden="true"> · </span>
        {terms}
      </>
    ),
    /** What each kind of section is for, shown in the "Add a section" menu. */
    hints: {
      experience: "Jobs, with dates and bullets",
      education: "Degrees and courses",
      projects: "Things you built, with links",
      keySkills: "Lines like “Frontend: React, CSS”",
      awards: "One labeled line each",
      highlights: "A plain list of points",
      text: "Free text under a heading",
    },
  },

  you: {
    title: "About you",
    help: (enter: ReactNode) => (
      <>
        Type a few letters, then press {enter}. It fills in and moves on.
      </>
    ),
    name: "Name",
    role: "Job title",
    location: "Location",
    email: "Email",
    phone: "Phone",
    badEmail: "This does not look like an email address.",
    links: "Links",
  },

  roles: {
    addLatest: "Add your latest job",
    addJob: "Add another job",
    addDegree: "Add a degree or course",
    addAnotherDegree: "Add another degree or course",
    newEntry: "New entry",
    newJob: "New job",
    degree: "Degree or course",
    jobTitle: "Job title",
    school: "School",
    company: "Company",
    when: "When",
    datesLabel: "Dates",
    datesHint: (typed1: string, result1: string, typed2: string, result2: string) => (
      <>
        Type <b>{typed1}</b> for <b>{result1}</b>, or <b>{typed2}</b> for <b>{result2}</b>.
      </>
    ),
    note: "Note after the title",
    website: "Website",
    websiteLabel: "Website of the company or school",
    noteOrWebsite: "Note or website",
    addDetails: "Add details",
    firstDetail: "Honors, thesis, anything worth a line",
  },

  bullets: {
    first: "What you did",
    more: "Something else you did",
    add: "Add a bullet",
    addAnother: "Add another bullet",
    label: (n: number) => `Bullet ${n}`,
    delete: (n: number) => `Delete bullet ${n}`,
    deleted: "Deleted a bullet.",
  },

  sections: {
    /** What the pane says under a section's heading. */
    help: {
      experience: "Start with your latest job. Type a few letters, then press Enter.",
      education: "Type your degree or course. Schools and subjects fill in as you type.",
      projects: "Things you built or ran. Add a link so people can see them.",
      keySkills: "One line per group, such as Frontend: React, CSS.",
      awards: "One line each: what it is, then the detail.",
      highlights: "A plain list of points.",
      text: "A short paragraph under this heading.",
    },
    untitled: "Untitled",
    deleted: (name: string) => `Deleted the “${name}” section.`,
    optionsFor: (name: string) => `Options for ${name}`,
    optionsForSection: (name: string) => `Options for the ${name} section`,
    rename: "Rename",
    moveEarlier: "Move earlier on the CV",
    moveLater: "Move later on the CV",
    delete: "Delete section",
    headingLabel: "Section heading",
    paragraph: "Paragraph",
    paragraphPlaceholder: "Write a short paragraph",
    addProject: "Add a project",
    addAnotherProject: "Add another project",
    newProject: "New project",
    projectName: "Project name",
    projectLinks: "Links",
    addLink: "Add a link",
    projectFirst: "What it does, and what you used",
    label: "Label",
    text: "Text",
    lineDeleted: "Deleted the line.",
    lineLabel: (n: number) => `Line ${n}, label`,
    line: (n: number) => `Line ${n}`,
    deleteLine: (n: number) => `Delete line ${n}`,
    addLine: "Add a line",
    addAnotherLine: "Add another line",
  },

  card: {
    options: (name: string) => `Options for ${name}`,
    moveUp: "Move up",
    moveDown: "Move down",
  },

  skills: {
    removed: (text: string) => `Removed “${text}”.`,
    cut: (n: number) => `Took ${n} ${n === 1 ? "skill" : "skills"} off the end.`,
    title: "Your skills",
    helpSidebar: (cap: number) => `The sidebar fits ${cap}. Put the ones the job asks for first.`,
    helpClassic: "Classic prints them as one line under your summary.",
    label: "Skills",
    placeholder: "Type a skill, then Enter",
    count: (n: number, cap: number) => `${n} of ${cap} fit on the sidebar`,
    keepFirst: (cap: number) => `Keep the first ${cap}`,
    suggested: "Suggested skills",
    oftenListedBy: (job: string) => `Often listed by ${job}`,
    popular: "Popular skills",
  },

  spoken: {
    deleted: (name: string) => `Deleted ${name}.`,
    title: "Languages",
    help: "Pick the language, then how well you speak it.",
    language: (n: number) => `Language ${n}`,
    level: (n: number) => `Language ${n}, level`,
    delete: (n: number) => `Delete language ${n}`,
    add: "Add a language",
    addAnother: "Add another language",
    interests: "Interests",
    interestsPlaceholder: "Climbing, film photography",
  },

  links: {
    deleted: "Deleted the link.",
    label: (n: number) => `Link ${n}`,
    textLabel: (n: number) => `Link ${n}, text to print`,
    textPlaceholder: "Text to print",
    prints: (printed: string) => (
      <>
        Prints as <b>{printed}</b>. Change
      </>
    ),
    delete: (n: number) => `Delete link ${n}`,
    add: "Add a link",
  },

  summary: {
    title: "Summary",
    help: (drafts: boolean) =>
      `A few lines on who you are. ${drafts ? "Pick a draft, or write your own." : "Add your job title and skills first to get drafts."}`,
    headingField: "Heading on the CV",
    field: "Summary",
    lines: (n: number) => `${n} ${n === 1 ? "line" : "lines"}`,
    hint: "Recruiters skim, so 3 or 4 lines read best. Select words to make them bold.",
    placeholder: "What you do and what you are good at",
  },

  photo: {
    label: "Photo",
    adjustLabel: "Adjust your photo",
    addLabel: "Add a photo",
    optional: "Optional",
    circle: "circle",
    square: "square",
    rounded: "rounded square",
    prints: (mm: number, shape: string, template: string) => `Prints as a ${mm}\u00a0mm ${shape} on ${template}.`,
    drop: "Drop an image here, or pick one. It stays in this browser.",
    reachAll: (n: number) => `All ${n} CVs print this photo.`,
    reachSome: (users: number, total: number) => `${users} of ${total} CVs print this photo.`,
    adjust: "Adjust",
    uploadNew: "Upload new",
    remove: "Remove",
    upload: "Upload a photo",
    printHere: "Print it on this CV",
    dialogTitle: "Place your photo",
    position: "Photo position",
    zoomOut: "Zoom out",
    zoom: "Zoom",
    zoomIn: "Zoom in",
    size: (mm: number, shape: string) => `${mm}\u00a0mm ${shape}`,
    dpi: (n: number) => `${n}\u00a0dpi`,
    mayPrintSoft: ", may print soft",
    willPrintSoft: ", will print soft",
    reset: "Reset",
    hint: "Drag to move the photo, or double-click a spot to center it. Scroll or pinch to zoom. On the keyboard, the arrow keys move it and + and - zoom.",
    save: "Save photo",
    thatFile: "that file",
    readFail: (name: string) => `Could not read ${name}. Use a JPEG, PNG or WebP photo.`,
    openFail: "Could not open the saved photo. Upload it again.",
  },

  ai: {
    button: "Improve with AI",
    busy: "Improving…",
    readyMany: "Suggestions are ready, below.",
    readyOne: "The suggestion is ready, below.",
    signInTitle: (kind: "bullets" | "text") => `Sign in to improve your ${kind === "bullets" ? "bullets" : "text"}`,
    signInSay: (perDay: number) =>
      `AI rewrites need a Google account. They are free while we test them, up to ${perDay} a day. Your CVs stay in this browser.`,
    busyTitle: (kind: "bullets" | "text") => `Improving your ${kind === "bullets" ? "bullets" : "text"}…`,
    /** Under the sign-in card's text: where the text goes, and what continuing accepts. */
    consent: (terms: ReactNode, privacy: ReactNode) => (
      <>
        The text you send goes to Anthropic&apos;s Claude, in the United States, to write the suggestion. By continuing
        you accept the {terms} and the {privacy}.
      </>
    ),
    notNow: "Not now",
    tryAgain: "Try again",
    close: "Close",
    suggestions: "Suggestions",
    suggestion: "Suggestion",
    leftToday: (n: number) => `${n} left today`,
    lastToday: "That was your last one today",
    useAll: "Use all",
    undoAll: "Undo all",
    closeSuggestions: "Close suggestions",
    before: "Before",
    after: "After",
    alreadyGood: "Already reads well",
    use: "Use",
    undo: "Undo",
    useLabel: (n: number) => `Use suggestion ${n}`,
    undoLabel: (n: number) => `Undo suggestion ${n}`,
    noRewrite: "No rewrite this time",
    checkTitle: "Sign-in check failed",
    startTitle: "Sign-in did not start",
    unreachable: "Could not reach the server. Check your connection and try again.",
    failedStatus: (status: number) => `The rewrite failed (error ${status}).`,
  },

  meter: {
    example: "Example. Your CV appears here as you type.",
    measuring: "Measuring…",
    over: (pages: number, over: number) => `${pages} pages, ${over} over`,
    one: (fill: number) => `1 page, ${fill}% full`,
    many: (pages: number, fill: number) => `${pages} pages, last ${fill}% full`,
    spokenOne: "1 page",
    spokenMany: (pages: number) => `${pages} pages`,
    label: "Page details",
    pages: "Pages",
    overBy: (pages: number, over: number) => `${pages}, over by ${over}`,
    meantForOne: (template: string) => `${template} is meant for one page.`,
    meantForUpTo: (template: string, n: number) => `${template} is meant for up to ${n} pages.`,
    page: (n: number) => `Page ${n}`,
    lastPage: "Last page",
    full: (fill: number) => `${fill}% full`,
    emptyAtCut: "Empty at a cut",
    none: "none",
    mm: (n: number) => `${n}\u00a0mm`,
    emptyNote: "Paper left empty at the foot of a page because the next entry did not fit.",
    stranded: "A heading ends a page with nothing under it. Look for the amber mark on the sheet.",
  },

  stage: {
    previewLabel: "Preview of your CV",
    frameTitle: "CV preview",
    pageStarts: (n: number) => `Page ${n} starts here`,
    stranded: (text: string, page: number) => `“${text}” ends page ${page} with nothing under it`,
  },

  toolbar: {
    label: "Text style",
    bold: "Bold",
    boldTitle: "Bold (Ctrl or ⌘\u00a0B)",
    italic: "Italic",
    italicTitle: "Italic (Ctrl or ⌘\u00a0I)",
    link: "Link",
    addLinkTitle: "Add a link (Ctrl or ⌘\u00a0K)",
    unlink: "Unlink",
    removeLinkTitle: "Remove the link",
    address: "Link address",
    addressPlaceholder: "example.com or name@example.com",
    cancel: "Cancel",
  },

  suggest: {
    label: "Suggestions",
    one: "1 suggestion",
    many: (n: number) => `${n} suggestions`,
  },

  tokens: {
    remove: (text: string) => `Remove ${text}`,
    addAnother: "Add another",
  },

  /** What the server says when it says no, by the codes in src/lib/errors.ts.
      The server's own English text is the fallback for a code not listed. */
  errors: {
    pdf: {
      unreachable: "Could not reach the server to make the PDF.",
      rateLimit: "Too many PDFs came from this network in the last minute. Wait a minute, then try again.",
      status: (status: number) => `The server could not make the PDF (error ${status}).`,
      foreign: "This server only prints CVs for its own editor.",
      tooLarge: "That CV is too large to print. Try a smaller photo.",
      badJson: "The request was not valid JSON.",
      noCv: "The request holds no CV.",
      badPhoto: "The photo must be a JPEG, PNG or WebP image under 1 MB.",
      noChrome: "No Chrome to print with. Install Google Chrome, or set CHROME_PATH to a Chrome or Chromium binary.",
      failed: "The PDF could not be made. Try again, or print the preview instead.",
      generic: "The PDF could not be made.",
    },
    ai: {
      foreign: "This server only rewrites text for its own editor.",
      paused: "AI rewrites are paused for now. Try again later.",
      signIn: "Sign in to use AI rewrites.",
      tooLong: "That block is too long to rewrite. Try a shorter one.",
      badJson: "The request was not valid JSON.",
      empty: "That block is empty or too long to rewrite.",
      limitDay: (n: number) => `You've used today's ${n} rewrites. You get more tomorrow.`,
      limitMonth: (n: number) => `You've used this month's ${n} rewrites.`,
      budget: "AI rewrites are resting until tomorrow. The free test has a daily budget.",
      failed: "The rewrite failed. Try again in a minute.",
      busy: "The AI is busy. Try again in a minute.",
      unavailable: "The AI could not answer. Try again in a minute.",
      refused: "The AI would not rewrite this block.",
      cutOff: "The AI's answer came back cut off. Try a shorter block.",
    },
    backup: {
      notJson: "That file is not a backup from this editor. Backups are .json files.",
      noCvs: "That file holds no CVs. Pick a backup this editor saved.",
      unreadable: "The editor could not read any CV in that file.",
      fallback: "Could not read that backup.",
    },
  },
};

export type Dict = typeof en;
export default en;
