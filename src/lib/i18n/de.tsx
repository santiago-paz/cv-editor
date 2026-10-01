import type { ReactNode } from "react";
import type { Dict } from "./en";

/* The editor in German. It speaks to the reader as "du". The keys are the ones
   in en.tsx, in the same order. A few lines are built to join with others, so
   read the notes before changing one: bar.download + bar.downloadMore,
   cvs.donate + cvs.donateVia, and the shape words in photo, which sit after
   "als" and after a number. */

const de: Dict = {
  language: {
    label: "Sprache",
  },

  common: {
    undo: "Rückgängig",
    cancel: "Abbrechen",
    back: "Zurück",
    /** The name printed on the Control key on a German keyboard. */
    ctrl: "Strg",
    delete: "Löschen",
    /** Read out after a link that opens another tab. */
    newTab: " (öffnet in einem neuen Tab)",
  },

  bar: {
    saved: "Gespeichert",
    savedInTab: "In diesem Tab gespeichert",
    notSavedFull: "Nicht gespeichert: Speicher voll",
    notSavedBlocked: "Nicht gespeichert: Speicher blockiert",
  },

  /** The PDF button and the menu beside it. There are two ways to get the PDF:
      the browser's print dialog, which keeps the CV on the device, and a file
      that the server makes. */
  pdf: {
    making: "PDF wird erstellt…",
    /** The main button when it prints. On a narrow screen only the second part
        shows, so it must read well alone: "PDF speichern". */
    printLead: "Als ",
    printWord: "PDF speichern",
    printTitle: "Öffnet den Druckdialog deines Browsers. Dein Lebenslauf bleibt auf diesem Gerät.",
    /** The main button when it makes a file. " PDF" is added when the bar is wide. */
    fileWord: "Download",
    fileMore: " PDF",
    fileLabel: "Download PDF",
    fileTitle: "Lädt eine PDF-Datei herunter, die auf unserem Server erstellt wird.",
    menuLabel: "Möglichkeiten für das PDF",
    moreLabel: "Weitere Möglichkeiten für das PDF",
    /** Marks the way the main button takes. */
    tagDefault: "Standard",
    print: {
      title: "Als PDF speichern",
      hint: "Öffnet den Druckdialog deines Browsers. Wähle dort „Als PDF speichern“. Die Datei hat weder Autor noch Schlüsselwörter.",
      fact: "Dein Lebenslauf verlässt dieses Gerät nie.",
    },
    file: {
      title: "PDF-Datei herunterladen",
      hint: "Du bekommst die Datei mit einem Klick. Unser Server druckt deinen Lebenslauf mit Chrome und schickt das PDF zurück. Die Datei trägt deinen Namen als Autor und deine Kenntnisse als Schlüsselwörter.",
      fact: "Dein Lebenslauf geht an unseren Server. Er behält keine Kopie.",
    },
    cautionPhone: "Handys und Tablets drucken unter Umständen die ganze Seite, nicht nur den Lebenslauf.",
    cautionBrowser: "Die Seitenumbrüche sind in Chrome getestet. Prüfe sie in der Vorschau des Dialogs.",
  },

  cvs: {
    label: "Deine Lebensläufe",
    /** What a CV with no name is called in lists. */
    untitled: "Lebenslauf ohne Titel",
    /** The title the sample CV starts with. */
    sampleTitle: "Beispiel-Lebenslauf",
    /** Goes in "Lebenslauf Anna (Kopie)" and "Lebenslauf Anna (Kopie 2)". One word. */
    copyWord: "Kopie",
    nameLabel: "Name dieses Lebenslaufs",
    nameNote: "Nur du siehst diesen Namen. Er wird nie gedruckt. Lass das Feld leer, um deinen eigenen Namen zu verwenden.",
    sample: "Beispiel",
    justNow: "gerade eben",
    minutesAgo: (n: number) => `vor ${n} Min.`,
    hoursAgo: (n: number) => `vor ${n} Std.`,
    daysAgo: (n: number) => (n === 1 ? "vor 1 Tag" : `vor ${n} Tagen`),
    copyOf: (name: string) => `Kopie von ${name} erstellen`,
    deleteOf: (name: string) => `${name} löschen`,
    new: "Neuer Lebenslauf",
    trySample: "Beispiel ausprobieren",
    madeBy: "Gemacht von",
    donate: "Spenden",
    /** Read out after "Spenden". */
    donateVia: " mit PayPal (öffnet in einem neuen Tab)",
  },

  style: {
    label: "Stil des Lebenslaufs",
    button: "Stil",
    layout: "Layout",
    onePage: "1 Seite",
    upToPages: (n: number) => `Bis zu ${n} ${n === 1 ? "Seite" : "Seiten"}`,
    sidebarColor: "Farbe der Seitenleiste",
    hardToRead: "Text schwer lesbar",
    easyToRead: "Text gut lesbar",
    pickAny: "Beliebige Farbe wählen",
    customColor: "Eigene Farbe für die Seitenleiste",
    hex: "Hex",
    badHex: "Gib 6 Hex-Ziffern ein, zum Beispiel #1E4A35.",
    thisCvOnly: "Gilt nur für diesen Lebenslauf.",
    cvLanguage: "Sprache des Lebenslaufs",
    cvLanguageNote:
      "Ändert die Überschriften, die das Layout selbst druckt, etwa Kenntnisse und Sprachen. Auch die Vorschläge ändern sich. Überschriften, die du umbenannt hast, bleiben, wie sie sind.",
    /** Keyed by the English names in src/lib/color.ts. */
    colors: {
      Navy: "Marineblau",
      Cobalt: "Kobaltblau",
      Petrol: "Petrol",
      Forest: "Waldgrün",
      Burgundy: "Burgunderrot",
      Plum: "Pflaume",
      Charcoal: "Anthrazit",
    },
  },

  templates: {
    sidebar: {
      name: "Seitenleiste",
      note: "Eine Seite, mit farbiger Leiste für deine Kontaktdaten, Kenntnisse und Sprachen.",
    },
    classic: {
      name: "Klassisch",
      note: "Eine Spalte, bis zu zwei Seiten. Jobportale, die deinen Lebenslauf in ihre Formulare übernehmen, lesen ihn am besten aus.",
    },
  },

  /** The words of the links to the terms and the privacy page, inside a sentence.
      Both sit after "die" and take the accusative: "die Nutzungsbedingungen und die Datenschutzseite". */
  legal: {
    termsLink: "Nutzungsbedingungen",
    privacyLink: "Datenschutzseite",
  },

  settings: {
    label: "Einstellungen",
    look: "Darstellung",
    theme: "Design",
    auto: "Auto",
    light: "Hell",
    dark: "Dunkel",
    zoom: "Zoom",
    fit: "Anpassen",
    actualSize: "100\u00a0%",
    cvs: "Deine Lebensläufe",
    tabNote:
      "Deine Lebensläufe und dein Foto bleiben nur in diesem Tab. Wenn du ihn schließt, werden sie gelöscht. Sichere darum, was du behalten willst.",
    browserNote:
      "Deine Lebensläufe werden nur in diesem Browser gespeichert. Löschst du seine Websitedaten, sind sie weg. Lege darum eine Sicherung an.",
    forget: "Lebensläufe vergessen, wenn ich den Tab schließe",
    backUp: "Sichern",
    restore: "Wiederherstellen",
    account: "Konto",
    privacy: "Datenschutz",
    terms: "Nutzungsbedingungen",
  },

  account: {
    checking: "Dein Konto wird geprüft…",
    checkFailed: "Dein Konto konnte nicht geprüft werden. Versuche es in einer Minute noch einmal.",
    only: "Ein Konto brauchst du nur für KI-Überarbeitungen. Deine Lebensläufe bleiben so oder so in diesem Browser.",
    opening: "Google wird geöffnet…",
    continue: "Weiter mit Google",
    startFailed: "Die Anmeldung ließ sich nicht starten. Versuche es in einer Minute noch einmal.",
    /** Under the Google button: where the data goes, and what continuing accepts. */
    consent: (terms: ReactNode, privacy: ReactNode) => (
      <>
        Deine Daten werden in den USA verarbeitet. Wenn du fortfährst, akzeptierst du die {terms} und die {privacy}.
      </>
    ),
    leftLabel: "Verbleibende KI-Überarbeitungen",
    today: "Heute",
    month: "Im Monat",
    left: (n: number) => `noch ${n}`,
    confirm: "Dein Konto und deinen KI-Verlauf löschen? Deine Lebensläufe bleiben in diesem Browser.",
    delete: "Konto löschen",
    needsRecent: "Zum Löschen brauchst du eine frische Anmeldung. Melde dich ab, melde dich wieder an und lösche das Konto dann.",
    signOut: "Abmelden",
  },

  editor: {
    skip: "Zur Vorschau springen",
    writeLabel: "Lebenslauf schreiben",
    emptyTitle: "Noch keine Lebensläufe",
    emptyText: "Starte einen neuen oder öffne das Beispiel, um zu sehen, wie der Editor funktioniert.",
    openSample: "Beispiel öffnen",
    dockLabel: "Anzeigen",
    edit: "Bearbeiten",
    preview: "Vorschau",
    signedIn: (email: string) => `Angemeldet als ${email}. Drücke „Mit KI verbessern“, um es auszuprobieren.`,
    copyMade: (title: string) => `Kopie „${title}“ erstellt. Das Original bleibt unverändert.`,
    deleted: (name: string) => `„${name}“ gelöscht.`,
    backedUp: (n: number) =>
      `Sicherung von ${n} ${n === 1 ? "Lebenslauf" : "Lebensläufen"} gespeichert. Öffne sie mit „Wiederherstellen“, in diesem Browser oder einem anderen.`,
    restored: (added: number, replaced: number, kept: number, photo: boolean) => {
      const changed = [added > 0 && `${added} hinzugefügt`, replaced > 0 && `${replaced} aktualisiert`].filter(Boolean);
      const stayed = kept
        ? kept === 1
          ? " 1 Lebenslauf blieb unverändert, weil die Version hier neuer ist."
          : ` ${kept} Lebensläufe blieben unverändert, weil die Versionen hier neuer sind.`
        : "";
      return `Sicherung wiederhergestellt${changed.length ? `: ${changed.join(", ")}` : ""}.${stayed}${photo ? " Das Foto ist auch wieder da." : ""}`;
    },
    photoFull:
      "Der Speicher dieses Browsers ist voll, darum wird das Foto nicht gespeichert. Lösche ein paar Lebensläufe oder nimm ein kleineres Foto.",
    photoBlocked:
      "Dieser Browser lässt den Editor nicht speichern, darum bleibt das Foto nur, bis du den Tab schließt.",
    photoDropped:
      "Foto gespeichert. Das Original passte nicht in den Speicher, darum beginnt eine spätere Anpassung beim Ausschnitt.",
    photoSaved: "Foto gespeichert.",
    photoRemoved: "Foto aus allen Lebensläufen entfernt.",
    tabFull: "In diesem Tab ist kein Platz für deine Lebensläufe, darum bleiben sie im Browser gespeichert.",
    tabBlocked:
      "Dieser Browser erlaubt keine eigene Kopie pro Tab, darum bleiben deine Lebensläufe im Browser gespeichert.",
    tabOn: "Dieser Tab vergisst deine Lebensläufe jetzt, sobald du ihn schließt. Sichere die, die du behalten willst.",
    tabOnAction: "Sichern",
    browserFull:
      "Der Speicher dieses Browsers ist voll, darum bleiben deine Lebensläufe nur in diesem Tab. Lösche ein paar Lebensläufe oder sichere sie.",
    browserBlocked:
      "Dieser Browser lässt den Editor nicht speichern, darum bleiben deine Lebensläufe nur in diesem Tab.",
    browserOn: "Deine Lebensläufe werden wieder in diesem Browser gespeichert.",
    emptyCv: "Der Lebenslauf ist leer. Gib zuerst deinen Namen und deinen Jobtitel ein.",
    downloaded: (name: string) => `${name} heruntergeladen`,
    /** Follows "{name} heruntergeladen." in the thank-you after the first PDF. */
    donateAsk: "Wenn dir der Editor geholfen hat, kannst du ihn mit einer Spende unterstützen.",
    donate: "Spenden",
    printHint: " Du kannst das PDF stattdessen über den Druckdialog deines Browsers speichern.",
    printFailed: "Der Druckdialog hat sich nicht geöffnet. Du kannst stattdessen eine PDF-Datei herunterladen.",
    downloadFile: "Datei herunterladen",
    savedKeyTab: "In diesem Tab gespeichert. Alles wird beim Tippen gespeichert.",
    savedKeyBrowser: "In diesem Browser gespeichert. Alles wird beim Tippen gespeichert.",
  },

  panel: {
    /** The names of the steps. A section's own heading names its step. */
    you: "Du",
    untitled: "Ohne Titel",
    skills: "Kenntnisse",
    languages: "Sprachen",
    summary: "Zusammenfassung",
    filledIn: " (ausgefüllt)",
    sampleNote: (start: ReactNode) => (
      <>
        Das ist ein Beispiel. Überschreibe es oder {start}.
      </>
    ),
    startOwn: "starte deinen eigenen Lebenslauf",
    parts: "Teile des Lebenslaufs",
    addSection: "Abschnitt hinzufügen",
    allSections: "Alle Arten von Abschnitten sind schon im Lebenslauf.",
    next: (label: string) => (
      <>
        Weiter: <b>{label}</b>
      </>
    ),
    /** Under the Next button. The two links are the privacy page and the terms. */
    serversNote: (privacy: ReactNode, terms: ReactNode) => (
      <>
        „Als PDF speichern“ bleibt auf deinem Gerät. Der Download der PDF-Datei und KI-Überarbeitungen laufen auf Servern in den USA. {privacy}
        <span aria-hidden="true"> · </span>
        {terms}
      </>
    ),
    /** The label of the cross that closes that note. */
    closeNote: "Hinweis schließen",
    /** What each kind of section is for, shown in the "Abschnitt hinzufügen" menu. */
    hints: {
      experience: "Jobs mit Zeitraum und Punkten",
      education: "Abschlüsse und Kurse",
      projects: "Was du gebaut hast, mit Links",
      keySkills: "Zeilen wie „Frontend: React, CSS“",
      awards: "Je eine Zeile mit Bezeichnung",
      highlights: "Eine einfache Liste mit Punkten",
      text: "Freier Text unter einer Überschrift",
    },
  },

  you: {
    title: "Über dich",
    help: (enter: ReactNode) => (
      <>
        Tippe ein paar Buchstaben und drücke {enter}. Das Feld füllt sich, und es geht weiter.
      </>
    ),
    name: "Name",
    role: "Jobtitel",
    location: "Wohnort",
    email: "E-Mail",
    phone: "Telefon",
    badEmail: "Das sieht nicht nach einer E-Mail-Adresse aus.",
    links: "Links",
  },

  roles: {
    addLatest: "Deinen letzten Job hinzufügen",
    addJob: "Weiteren Job hinzufügen",
    addDegree: "Abschluss oder Kurs hinzufügen",
    addAnotherDegree: "Weiteren Abschluss oder Kurs hinzufügen",
    newEntry: "Neuer Eintrag",
    newJob: "Neuer Job",
    degree: "Abschluss oder Kurs",
    jobTitle: "Jobtitel",
    school: "Schule oder Uni",
    company: "Unternehmen",
    when: "Wann",
    datesLabel: "Zeitraum",
    datesHint: (typed1: string, result1: string, typed2: string, result2: string) => (
      <>
        Tippe <b>{typed1}</b> für <b>{result1}</b> oder <b>{typed2}</b> für <b>{result2}</b>.
      </>
    ),
    note: "Zusatz nach dem Titel",
    website: "Website",
    websiteLabel: "Website von Unternehmen oder Schule",
    noteOrWebsite: "Zusatz oder Website",
    addDetails: "Details hinzufügen",
    firstDetail: "Auszeichnungen, Abschlussarbeit, alles, was eine Zeile wert ist",
  },

  bullets: {
    first: "Was du gemacht hast",
    more: "Noch etwas, das du gemacht hast",
    add: "Punkt hinzufügen",
    addAnother: "Weiteren Punkt hinzufügen",
    label: (n: number) => `Punkt ${n}`,
    delete: (n: number) => `Punkt ${n} löschen`,
    deleted: "Punkt gelöscht.",
  },

  sections: {
    /** What the pane says under a section's heading. */
    help: {
      experience: "Beginne mit deinem letzten Job. Tippe ein paar Buchstaben und drücke dann Enter.",
      education: "Tippe deinen Abschluss oder Kurs. Schulen und Fächer werden beim Tippen ergänzt.",
      projects: "Was du gebaut oder geleitet hast. Mit einem Link kann man es ansehen.",
      keySkills: "Eine Zeile pro Gruppe, zum Beispiel Frontend: React, CSS.",
      awards: "Je eine Zeile: erst, was es ist, dann das Detail.",
      highlights: "Eine einfache Liste mit Punkten.",
      text: "Ein kurzer Absatz unter dieser Überschrift.",
    },
    untitled: "Ohne Titel",
    deleted: (name: string) => `Abschnitt „${name}“ gelöscht.`,
    optionsFor: (name: string) => `Optionen für ${name}`,
    optionsForSection: (name: string) => `Optionen für den Abschnitt ${name}`,
    rename: "Umbenennen",
    moveEarlier: "Nach vorn",
    moveLater: "Nach hinten",
    delete: "Abschnitt löschen",
    headingLabel: "Überschrift des Abschnitts",
    paragraph: "Absatz",
    paragraphPlaceholder: "Schreibe einen kurzen Absatz",
    addProject: "Projekt hinzufügen",
    addAnotherProject: "Weiteres Projekt hinzufügen",
    newProject: "Neues Projekt",
    projectName: "Projektname",
    projectLinks: "Links",
    addLink: "Link hinzufügen",
    projectFirst: "Was es macht und was du genutzt hast",
    label: "Bezeichnung",
    text: "Text",
    lineDeleted: "Zeile gelöscht.",
    lineLabel: (n: number) => `Zeile ${n}, Bezeichnung`,
    line: (n: number) => `Zeile ${n}`,
    deleteLine: (n: number) => `Zeile ${n} löschen`,
    addLine: "Zeile hinzufügen",
    addAnotherLine: "Weitere Zeile hinzufügen",
  },

  card: {
    options: (name: string) => `Optionen für ${name}`,
    moveUp: "Nach oben",
    moveDown: "Nach unten",
  },

  skills: {
    removed: (text: string) => `„${text}“ entfernt.`,
    cut: (n: number) => `${n} ${n === 1 ? "Kenntnis" : "Kenntnisse"} am Ende entfernt.`,
    title: "Deine Kenntnisse",
    helpSidebar: (cap: number) => `Die Seitenleiste hat Platz für ${cap}. Was die Stelle verlangt, gehört nach vorn.`,
    helpClassic: "Im Layout Klassisch stehen sie als eine Zeile unter deiner Zusammenfassung.",
    label: "Kenntnisse",
    placeholder: "Kenntnis eingeben, dann Enter",
    count: (n: number, cap: number) =>
      n > cap
        ? `${n} Kenntnisse, aber die Seitenleiste hat nur Platz für ${cap}`
        : `Seitenleiste: ${n} von ${cap} belegt`,
    keepFirst: (cap: number) => (cap === 1 ? "Nur die erste behalten" : `Nur die ersten ${cap} behalten`),
    suggested: "Vorgeschlagene Kenntnisse",
    oftenListedBy: (job: string) => `Typische Kenntnisse für ${job}`,
    popular: "Beliebte Kenntnisse",
  },

  spoken: {
    deleted: (name: string) => `${name} gelöscht.`,
    title: "Sprachen",
    help: "Wähle die Sprache und dann, wie gut du sie sprichst.",
    language: (n: number) => `Sprache ${n}`,
    level: (n: number) => `Sprache ${n}, Niveau`,
    delete: (n: number) => `Sprache ${n} löschen`,
    add: "Sprache hinzufügen",
    addAnother: "Weitere Sprache hinzufügen",
    interests: "Interessen",
    interestsPlaceholder: "Klettern, analoge Fotografie",
  },

  links: {
    deleted: "Link gelöscht.",
    label: (n: number) => `Link ${n}`,
    textLabel: (n: number) => `Link ${n}, Text für den Druck`,
    textPlaceholder: "Text für den Druck",
    prints: (printed: string) => (
      <>
        Wird als <b>{printed}</b> gedruckt. Ändern
      </>
    ),
    delete: (n: number) => `Link ${n} löschen`,
    add: "Link hinzufügen",
  },

  summary: {
    title: "Zusammenfassung",
    help: (drafts: boolean) =>
      `Ein paar Zeilen darüber, wer du bist. ${drafts ? "Wähle einen Entwurf oder schreibe selbst." : "Gib zuerst Jobtitel und Kenntnisse ein, dann bekommst du Entwürfe."}`,
    headingField: "Überschrift im Lebenslauf",
    field: "Zusammenfassung",
    lines: (n: number) => `${n} ${n === 1 ? "Zeile" : "Zeilen"}`,
    hint: "Lebensläufe werden meist nur überflogen, darum lesen sich 3 oder 4 Zeilen am besten. Markiere Wörter, um sie fett zu machen.",
    placeholder: "Was du machst und worin du gut bist",
  },

  photo: {
    label: "Foto",
    adjustLabel: "Dein Foto anpassen",
    addLabel: "Foto hinzufügen",
    optional: "Optional",
    /** The three shapes read after "als" and after a number, so none takes an article. */
    circle: "Kreis",
    square: "Quadrat",
    rounded: "abgerundetes Quadrat",
    prints: (mm: number, shape: string, template: string) =>
      `Wird als ${shape} (${mm}\u00a0mm) im Layout ${template} gedruckt.`,
    drop: "Zieh ein Bild hierher oder wähle eins aus. Es bleibt in diesem Browser.",
    reachAll: (n: number) =>
      n === 1 ? "Das Foto wird auf dem Lebenslauf gedruckt." : `Das Foto wird auf allen ${n} Lebensläufen gedruckt.`,
    reachSome: (users: number, total: number) => `Das Foto wird auf ${users} von ${total} Lebensläufen gedruckt.`,
    adjust: "Anpassen",
    uploadNew: "Neues hochladen",
    remove: "Entfernen",
    upload: "Foto hochladen",
    printHere: "Auf diesem Lebenslauf drucken",
    dialogTitle: "Foto platzieren",
    position: "Fotoposition",
    zoomOut: "Verkleinern",
    zoom: "Zoom",
    zoomIn: "Vergrößern",
    size: (mm: number, shape: string) => `${shape}, ${mm}\u00a0mm`,
    dpi: (n: number) => `${n}\u00a0dpi`,
    mayPrintSoft: ", im Druck eventuell unscharf",
    willPrintSoft: ", im Druck unscharf",
    reset: "Zurücksetzen",
    hint: "Zieh das Foto, um es zu verschieben, oder doppelklicke auf eine Stelle, um das Foto dort zu zentrieren. Zoome per Scrollen oder mit zwei Fingern. Mit der Tastatur verschieben die Pfeiltasten das Foto, + und - zoomen.",
    save: "Foto speichern",
    /** Fills the place of a file name at the start of a sentence, so it is capitalized. */
    thatFile: "Diese Datei",
    readFail: (name: string) => `${name} konnte nicht gelesen werden. Nimm ein Foto im Format JPEG, PNG oder WebP.`,
    openFail: "Das gespeicherte Foto ließ sich nicht öffnen. Lade es noch einmal hoch.",
  },

  ai: {
    button: "Mit KI verbessern",
    busy: "Wird verbessert…",
    readyMany: "Die Vorschläge stehen unten bereit.",
    readyOne: "Der Vorschlag steht unten bereit.",
    signInTitle: (kind: "bullets" | "text") =>
      kind === "bullets" ? "Melde dich an, um deine Punkte zu verbessern" : "Melde dich an, um deinen Text zu verbessern",
    signInSay: (perDay: number) =>
      `KI-Überarbeitungen brauchen ein Google-Konto. Sie sind kostenlos, solange wir sie testen: bis zu ${perDay} pro Tag. Deine Lebensläufe bleiben in diesem Browser.`,
    busyTitle: (kind: "bullets" | "text") =>
      kind === "bullets" ? "Deine Punkte werden verbessert…" : "Dein Text wird verbessert…",
    /** Under the sign-in card's text: where the text goes, and what continuing accepts. */
    consent: (terms: ReactNode, privacy: ReactNode) => (
      <>
        Der Text, den du sendest, geht zum Schreiben des Vorschlags an Claude von Anthropic in den USA. Wenn du
        fortfährst, akzeptierst du die {terms} und die {privacy}.
      </>
    ),
    notNow: "Nicht jetzt",
    tryAgain: "Noch einmal versuchen",
    close: "Schließen",
    suggestions: "Vorschläge",
    suggestion: "Vorschlag",
    leftToday: (n: number) => `Noch ${n} für heute`,
    lastToday: "Das war deine letzte für heute",
    useAll: "Alle übernehmen",
    undoAll: "Alle rückgängig",
    closeSuggestions: "Vorschläge schließen",
    before: "Vorher",
    after: "Nachher",
    alreadyGood: "Liest sich schon gut",
    use: "Übernehmen",
    undo: "Rückgängig",
    useLabel: (n: number) => `Vorschlag ${n} übernehmen`,
    undoLabel: (n: number) => `Vorschlag ${n} rückgängig machen`,
    noRewrite: "Diesmal keine Überarbeitung",
    checkTitle: "Anmeldung konnte nicht geprüft werden",
    startTitle: "Anmeldung nicht gestartet",
    unreachable: "Der Server ist nicht erreichbar. Prüfe deine Verbindung und versuche es noch einmal.",
    failedStatus: (status: number) => `Die Überarbeitung ist fehlgeschlagen (Fehler ${status}).`,
  },

  meter: {
    example: "Beispiel. Hier erscheint dein Lebenslauf, während du tippst.",
    measuring: "Wird gemessen…",
    over: (pages: number, over: number) => `${pages} ${pages === 1 ? "Seite" : "Seiten"}, ${over} zu viel`,
    one: (fill: number) => `1 Seite, ${fill}\u00a0% voll`,
    many: (pages: number, fill: number) => `${pages} Seiten, letzte ${fill}\u00a0% voll`,
    spokenOne: "1 Seite",
    spokenMany: (pages: number) => `${pages} Seiten`,
    label: "Seitendetails",
    pages: "Seiten",
    overBy: (pages: number, over: number) => `${pages}, ${over} zu viel`,
    meantForOne: (template: string) => `Das Layout ${template} ist für eine Seite gedacht.`,
    meantForUpTo: (template: string, n: number) =>
      `Das Layout ${template} ist für bis zu ${n} ${n === 1 ? "Seite" : "Seiten"} gedacht.`,
    page: (n: number) => `Seite ${n}`,
    lastPage: "Letzte Seite",
    full: (fill: number) => `${fill}\u00a0% voll`,
    emptyAtCut: "Leerraum am Seitenende",
    none: "keiner",
    mm: (n: number) => `${n}\u00a0mm`,
    emptyNote: "Leerer Platz am Seitenende, weil der nächste Eintrag nicht mehr auf die Seite passte.",
    stranded:
      "Eine Überschrift steht allein am Ende einer Seite, ohne Inhalt darunter. Suche auf dem Blatt nach der orangefarbenen Markierung.",
  },

  stage: {
    previewLabel: "Vorschau deines Lebenslaufs",
    frameTitle: "Lebenslauf-Vorschau",
    pageStarts: (n: number) => `Seite ${n} beginnt hier`,
    stranded: (text: string, page: number) => `„${text}“ steht am Ende von Seite ${page}, ohne Inhalt darunter`,
  },

  toolbar: {
    label: "Textformat",
    bold: "Fett",
    boldTitle: "Fett (Strg oder ⌘\u00a0B)",
    italic: "Kursiv",
    italicTitle: "Kursiv (Strg oder ⌘\u00a0I)",
    link: "Link",
    addLinkTitle: "Link hinzufügen (Strg oder ⌘\u00a0K)",
    unlink: "Entfernen",
    removeLinkTitle: "Link entfernen",
    address: "Link-Adresse",
    addressPlaceholder: "example.com oder name@example.com",
    cancel: "Abbrechen",
  },

  suggest: {
    label: "Vorschläge",
    one: "1 Vorschlag",
    many: (n: number) => `${n} Vorschläge`,
  },

  tokens: {
    remove: (text: string) => `${text} entfernen`,
    addAnother: "Weitere hinzufügen",
  },

  /** What the server says when it says no, by the codes in src/lib/errors.ts.
      The server's own English text is the fallback for a code not listed. */
  errors: {
    pdf: {
      unreachable: "Der Server für das PDF ist nicht erreichbar.",
      rateLimit:
        "Aus diesem Netzwerk wurden in der letzten Minute zu viele PDFs angefordert. Warte eine Minute und versuche es dann noch einmal.",
      status: (status: number) => `Der Server konnte das PDF nicht erstellen (Fehler ${status}).`,
      foreign: "Dieser Server druckt Lebensläufe nur für seinen eigenen Editor.",
      tooLarge: "Dieser Lebenslauf ist zu groß zum Drucken. Versuche es mit einem kleineren Foto.",
      badJson: "Die Anfrage war kein gültiges JSON.",
      noCv: "Die Anfrage enthält keinen Lebenslauf.",
      badPhoto: "Das Foto muss ein JPEG-, PNG- oder WebP-Bild unter 1 MB sein.",
      noChrome:
        "Kein Chrome zum Drucken gefunden. Installiere Google Chrome oder setze CHROME_PATH auf eine Chrome- oder Chromium-Programmdatei.",
      failed: "Das PDF konnte nicht erstellt werden. Versuche es noch einmal oder drucke stattdessen die Vorschau.",
      generic: "Das PDF konnte nicht erstellt werden.",
    },
    ai: {
      foreign: "Dieser Server überarbeitet Text nur für seinen eigenen Editor.",
      paused: "KI-Überarbeitungen sind vorerst pausiert. Versuche es später noch einmal.",
      signIn: "Melde dich an, um KI-Überarbeitungen zu nutzen.",
      tooLong: "Dieser Textblock ist zu lang zum Überarbeiten. Versuche es mit einem kürzeren.",
      badJson: "Die Anfrage war kein gültiges JSON.",
      empty: "Dieser Textblock ist leer oder zu lang zum Überarbeiten.",
      limitDay: (n: number) => `Dein Tageslimit für KI-Überarbeitungen (${n}) ist erreicht. Morgen bekommst du neue.`,
      limitMonth: (n: number) => `Dein Monatslimit für KI-Überarbeitungen (${n}) ist erreicht.`,
      budget: "KI-Überarbeitungen machen bis morgen Pause. Der kostenlose Test hat ein Tagesbudget.",
      failed: "Die Überarbeitung ist fehlgeschlagen. Versuche es in einer Minute noch einmal.",
      busy: "Die KI ist gerade ausgelastet. Versuche es in einer Minute noch einmal.",
      unavailable: "Die KI konnte nicht antworten. Versuche es in einer Minute noch einmal.",
      refused: "Die KI wollte diesen Textblock nicht überarbeiten.",
      cutOff: "Die Antwort der KI kam abgeschnitten an. Versuche es mit einem kürzeren Textblock.",
    },
    backup: {
      notJson: "Diese Datei ist keine Sicherung aus diesem Editor. Sicherungen sind .json-Dateien.",
      noCvs: "Diese Datei enthält keine Lebensläufe. Wähle eine Sicherung, die dieser Editor gespeichert hat.",
      unreadable: "Der Editor konnte keinen Lebenslauf in dieser Datei lesen.",
      fallback: "Diese Sicherung konnte nicht gelesen werden.",
    },
  },
};

export default de;
