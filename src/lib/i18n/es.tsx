import type { ReactNode } from "react";
import type { Dict } from "./en";

/* The editor's words in Spanish: informal "tú", neutral for Spain and Latin America.
   "mejora" is the noun for one AI rewrite, to match the "Mejorar con IA" button.
   "título" is a section's heading and also a degree, and the context tells which. */

const es: Dict = {
  language: {
    label: "Idioma",
  },

  common: {
    undo: "Deshacer",
    cancel: "Cancelar",
    back: "Atrás",
    /** The name printed on the Control key, for the keycap under Next. */
    ctrl: "Ctrl",
    delete: "Eliminar",
    /** Read out after a link that opens another tab. */
    newTab: " (se abre en una pestaña nueva)",
  },

  bar: {
    saved: "Guardado",
    savedInTab: "Guardado en esta pestaña",
    notSavedFull: "Sin guardar: almacenamiento lleno",
    notSavedBlocked: "Sin guardar: el navegador lo bloquea",
  },

  /** The PDF button and the menu beside it. There are two ways to get the PDF:
      the browser's print dialog, which keeps the CV on the device, and a file
      that the server makes. */
  pdf: {
    making: "Creando el PDF…",
    /** The main button when it prints. On a narrow screen only the second part
        shows, so it must read well alone. */
    printLead: "Guardar como ",
    printWord: "PDF",
    printTitle: "Abre el cuadro de impresión de tu navegador. Tu CV se queda en este dispositivo.",
    /** The main button when it makes a file. " PDF" is added when the bar is wide. */
    fileWord: "Descargar",
    fileMore: " PDF",
    fileLabel: "Descargar PDF",
    fileTitle: "Descarga un archivo PDF creado en nuestro servidor.",
    menuLabel: "Formas de obtener el PDF",
    moreLabel: "Más formas de obtener el PDF",
    /** Marks the way the main button takes. */
    tagDefault: "Por defecto",
    print: {
      title: "Guardar como PDF",
      hint: "Abre el cuadro de impresión de tu navegador. Elige Guardar como PDF allí. El archivo no lleva autor ni palabras clave.",
      fact: "Tu CV nunca sale de este dispositivo.",
    },
    file: {
      title: "Descargar un archivo PDF",
      hint: "Recibes el archivo con un clic. Nuestro servidor imprime tu CV con Chrome y te devuelve el PDF. El archivo lleva tu nombre como autor y tus habilidades como palabras clave.",
      fact: "Tu CV va a nuestro servidor. No guarda ninguna copia.",
    },
    cautionPhone: "Los teléfonos y las tabletas pueden imprimir la página entera, no solo el CV.",
    cautionBrowser: "Los saltos de página se prueban en Chrome. Revísalos en la vista previa del cuadro de impresión.",
  },

  cvs: {
    label: "Tus CV",
    /** What a CV with no name is called in lists. */
    untitled: "CV sin título",
    /** The title the sample CV starts with. */
    sampleTitle: "CV de ejemplo",
    /** Goes in "CV de Ana (copia)" and "CV de Ana (copia 2)". */
    copyWord: "copia",
    nameLabel: "Nombre de este CV",
    nameNote: "Solo tú ves este nombre. Nunca se imprime. Déjalo vacío para usar tu propio nombre.",
    sample: "Ejemplo",
    justNow: "ahora mismo",
    minutesAgo: (n: number) => `hace ${n} min`,
    hoursAgo: (n: number) => `hace ${n} h`,
    daysAgo: (n: number) => `hace ${n} d`,
    copyOf: (name: string) => `Hacer una copia de ${name}`,
    deleteOf: (name: string) => `Eliminar ${name}`,
    new: "Nuevo CV",
    trySample: "Probar el ejemplo",
    madeBy: "Hecho por",
    donate: "Donar",
    /** Read out after "Donar". */
    donateVia: " con PayPal (se abre en una pestaña nueva)",
  },

  style: {
    label: "Estilo del CV",
    button: "Estilo",
    layout: "Diseño",
    onePage: "1 página",
    upToPages: (n: number) => `Hasta ${n} ${n === 1 ? "página" : "páginas"}`,
    sidebarColor: "Color de la barra lateral",
    hardToRead: "Texto difícil de leer",
    easyToRead: "Texto fácil de leer",
    pickAny: "Elige cualquier color",
    customColor: "Color personalizado de la barra lateral",
    hex: "Hex",
    badHex: "Escribe 6 dígitos hex, como #1E4A35.",
    thisCvOnly: "Solo se aplica a este CV.",
    cvLanguage: "Idioma del CV",
    cvLanguageNote:
      "Cambia los títulos que el diseño imprime por su cuenta, como Habilidades e Idiomas. También cambia las sugerencias. Los títulos que renombraste se quedan como están.",
    /** Keyed by the English names in src/lib/color.ts. */
    colors: {
      Navy: "Azul marino",
      Cobalt: "Cobalto",
      Petrol: "Petróleo",
      Forest: "Verde bosque",
      Burgundy: "Burdeos",
      Plum: "Ciruela",
      Charcoal: "Carbón",
    },
  },

  templates: {
    sidebar: {
      name: "Barra lateral",
      note: "Una página, con una columna de color para tus datos de contacto, habilidades e idiomas.",
    },
    classic: {
      name: "Clásico",
      note: "Una columna, hasta dos páginas. Los portales de empleo que copian tu CV en sus formularios lo leen mejor.",
    },
  },

  /** The words of the links to the terms and the privacy page, inside a sentence.
      The sentences put "los" before the first and "la" before the second. */
  legal: {
    termsLink: "términos",
    privacyLink: "página de privacidad",
  },

  settings: {
    label: "Ajustes",
    look: "Aspecto",
    theme: "Tema",
    auto: "Auto",
    light: "Claro",
    dark: "Oscuro",
    zoom: "Zoom",
    fit: "Ajustar",
    actualSize: "100%",
    cvs: "Tus CV",
    tabNote:
      "Tus CV y tu foto se quedan solo en esta pestaña. Si la cierras, se eliminan, así que guarda una copia de los que quieras conservar.",
    browserNote:
      "Tus CV se guardan solo en este navegador. Si borras los datos de sitios del navegador, se eliminan, así que guarda una copia de seguridad.",
    forget: "Olvidar mis CV al cerrar esta pestaña",
    backUp: "Guardar copia",
    restore: "Restaurar",
    account: "Cuenta",
    privacy: "Privacidad",
    terms: "Términos",
  },

  account: {
    checking: "Comprobando tu cuenta…",
    checkFailed: "No se pudo comprobar tu cuenta. Inténtalo de nuevo en un minuto.",
    only: "La cuenta solo sirve para las mejoras con IA. Tus CV se quedan en este navegador con o sin cuenta.",
    opening: "Abriendo Google…",
    continue: "Continuar con Google",
    startFailed: "No se pudo iniciar sesión. Inténtalo de nuevo en un minuto.",
    /** Under the Google button: where the data goes, and what continuing accepts. */
    consent: (terms: ReactNode, privacy: ReactNode) => (
      <>
        Tus datos se procesan en Estados Unidos. Al continuar, aceptas los {terms} y la {privacy}.
      </>
    ),
    leftLabel: "Mejoras con IA que te quedan",
    today: "Hoy",
    month: "Este mes",
    left: (n: number) => `${n} ${n === 1 ? "restante" : "restantes"}`,
    confirm: "¿Eliminar tu cuenta y tu historial de IA? Tus CV se quedan en este navegador.",
    delete: "Eliminar cuenta",
    needsRecent:
      "Eliminar la cuenta requiere un inicio de sesión reciente. Cierra sesión, inicia sesión de nuevo y luego elimínala.",
    signOut: "Cerrar sesión",
  },

  editor: {
    skip: "Saltar a la vista previa",
    writeLabel: "Escribe tu CV",
    emptyTitle: "Todavía no tienes CV",
    emptyText: "Empieza uno nuevo o abre el ejemplo para ver cómo funciona el editor.",
    openSample: "Abrir el ejemplo",
    dockLabel: "Mostrar",
    edit: "Editar",
    preview: "Vista previa",
    signedIn: (email: string) => `Sesión iniciada como ${email}. Presiona Mejorar con IA para probarlo.`,
    copyMade: (title: string) => `Se creó una copia llamada “${title}”. El original sigue igual.`,
    deleted: (name: string) => `Se eliminó “${name}”.`,
    backedUp: (n: number) =>
      `Se guardó una copia de seguridad de ${n} CV. Ábrela con Restaurar, en este navegador o en otro.`,
    restored: (added: number, replaced: number, kept: number, photo: boolean) => {
      const changed = [
        added && `${added} CV ${added === 1 ? "agregado" : "agregados"}`,
        replaced && `${replaced} CV ${replaced === 1 ? "actualizado" : "actualizados"}`,
      ].filter(Boolean);
      const stayed = kept
        ? ` ${kept} CV ${kept === 1 ? "no cambió, porque la versión" : "no cambiaron, porque las versiones"} de este navegador ${kept === 1 ? "es más reciente" : "son más recientes"}.`
        : "";
      return `Copia de seguridad restaurada${changed.length ? `: ${changed.join(", ")}` : ""}.${stayed}${photo ? " También se recuperó la foto." : ""}`;
    },
    photoFull:
      "El almacenamiento de este navegador está lleno, así que la foto no se guarda. Elimina algunos CV o usa una foto más pequeña.",
    photoBlocked:
      "Este navegador no permite que el editor guarde datos, así que la foto dura hasta que cierres la pestaña.",
    photoDropped:
      "Se guardó la foto. La foto original no cabía en el almacenamiento, así que un ajuste posterior parte del recorte.",
    photoSaved: "Se guardó la foto.",
    photoRemoved: "Se quitó la foto de todos los CV.",
    tabFull: "Esta pestaña no tiene espacio para tus CV, así que se quedan guardados en este navegador.",
    tabBlocked:
      "Este navegador no permite que una pestaña tenga su propia copia, así que tus CV se quedan guardados en el navegador.",
    tabOn: "Ahora esta pestaña olvida tus CV cuando la cierras. Guarda una copia de los que quieras conservar.",
    tabOnAction: "Guardar copia",
    browserFull:
      "El almacenamiento de este navegador está lleno, así que tus CV se quedan solo en esta pestaña. Elimina algunos CV o guarda una copia de seguridad.",
    browserBlocked:
      "Este navegador no permite que el editor guarde datos, así que tus CV se quedan solo en esta pestaña.",
    browserOn: "Tus CV vuelven a guardarse en este navegador.",
    emptyCv: "El CV está vacío. Primero agrega tu nombre y tu puesto.",
    downloaded: (name: string) => `Se descargó ${name}`,
    /** Follows "Se descargó {name}." in the thank-you after the first PDF. */
    donateAsk: "Si el editor te resulta útil, puedes apoyarlo con una donación.",
    donate: "Donar",
    printHint: " Puedes guardarlo desde el cuadro de impresión de tu navegador.",
    printFailed: "El cuadro de impresión no se abrió. Puedes descargar un archivo PDF en su lugar.",
    downloadFile: "Descargar archivo",
    savedKeyTab: "Guardado en esta pestaña. Todo se guarda mientras escribes.",
    savedKeyBrowser: "Guardado en este navegador. Todo se guarda mientras escribes.",
  },

  panel: {
    /** The names of the steps. A section's own heading names its step. */
    you: "Tú",
    untitled: "Sin título",
    skills: "Habilidades",
    languages: "Idiomas",
    summary: "Resumen",
    filledIn: " (con contenido)",
    sampleNote: (start: ReactNode) => (
      <>
        Esto es un ejemplo. Escribe encima o {start}.
      </>
    ),
    startOwn: "empieza tu propio CV",
    parts: "Partes del CV",
    addSection: "Agregar una sección",
    allSections: "Todos los tipos de sección ya están en el CV.",
    next: (label: string) => (
      <>
        Siguiente: <b>{label}</b>
      </>
    ),
    /** Under the Next button. The two links are the privacy page and the terms. */
    serversNote: (privacy: ReactNode, terms: ReactNode) => (
      <>
        Guardar como PDF se queda en tu dispositivo. La descarga del archivo PDF y las mejoras con IA se procesan en servidores de EE.&nbsp;UU. {privacy}
        <span aria-hidden="true"> · </span>
        {terms}
      </>
    ),
    /** The label of the cross that closes that note. */
    closeNote: "Cerrar esta nota",
    /** What each kind of section is for, shown in the "Agregar una sección" menu. */
    hints: {
      experience: "Trabajos, con fechas y puntos",
      education: "Títulos y cursos",
      projects: "Lo que creaste, con enlaces",
      keySkills: "Líneas como “Frontend: React, CSS”",
      awards: "Una línea con etiqueta por cada uno",
      highlights: "Una lista sencilla de puntos",
      text: "Texto libre bajo un título",
    },
  },

  you: {
    title: "Sobre ti",
    help: (enter: ReactNode) => (
      <>
        Escribe unas pocas letras y presiona {enter}. Se completa y pasa al siguiente campo.
      </>
    ),
    name: "Nombre",
    role: "Puesto",
    location: "Ubicación",
    email: "Correo",
    phone: "Teléfono",
    badEmail: "Esto no parece una dirección de correo.",
    links: "Enlaces",
  },

  roles: {
    addLatest: "Agregar tu último trabajo",
    addJob: "Agregar otro trabajo",
    addDegree: "Agregar un título o curso",
    addAnotherDegree: "Agregar otro título o curso",
    newEntry: "Nueva formación",
    newJob: "Nuevo trabajo",
    degree: "Título o curso",
    jobTitle: "Puesto",
    school: "Institución",
    company: "Empresa",
    when: "Cuándo",
    datesLabel: "Fechas",
    datesHint: (typed1: string, result1: string, typed2: string, result2: string) => (
      <>
        Escribe <b>{typed1}</b> para <b>{result1}</b>, o <b>{typed2}</b> para <b>{result2}</b>.
      </>
    ),
    note: "Nota tras el título",
    website: "Sitio web",
    websiteLabel: "Sitio web de la empresa o de la institución",
    noteOrWebsite: "Nota o sitio web",
    addDetails: "Agregar detalles",
    firstDetail: "Distinciones, tesis, lo que merezca una línea",
  },

  bullets: {
    first: "Qué hiciste",
    more: "Algo más que hiciste",
    add: "Agregar un punto",
    addAnother: "Agregar otro punto",
    label: (n: number) => `Punto ${n}`,
    delete: (n: number) => `Eliminar punto ${n}`,
    deleted: "Se eliminó un punto.",
  },

  sections: {
    /** What the pane says under a section's heading. */
    help: {
      experience: "Empieza por tu trabajo más reciente. Escribe unas letras y presiona Enter.",
      education: "Escribe tu título o curso. Las instituciones y las materias se completan mientras escribes.",
      projects: "Lo que creaste o dirigiste. Agrega un enlace para que otros lo vean.",
      keySkills: "Una línea por grupo, como Frontend: React, CSS.",
      awards: "Una línea por cada uno: qué es y luego el detalle.",
      highlights: "Una lista sencilla de puntos.",
      text: "Un párrafo corto bajo este título.",
    },
    untitled: "Sin título",
    deleted: (name: string) => `Se eliminó la sección “${name}”.`,
    optionsFor: (name: string) => `Opciones de ${name}`,
    optionsForSection: (name: string) => `Opciones de la sección ${name}`,
    rename: "Renombrar",
    moveEarlier: "Mover antes en el CV",
    moveLater: "Mover después en el CV",
    delete: "Eliminar sección",
    headingLabel: "Título de la sección",
    paragraph: "Párrafo",
    paragraphPlaceholder: "Escribe un párrafo corto",
    addProject: "Agregar un proyecto",
    addAnotherProject: "Agregar otro proyecto",
    newProject: "Nuevo proyecto",
    projectName: "Nombre del proyecto",
    projectLinks: "Enlaces",
    addLink: "Agregar un enlace",
    projectFirst: "Qué hace y qué usaste",
    label: "Etiqueta",
    text: "Texto",
    lineDeleted: "Se eliminó la línea.",
    lineLabel: (n: number) => `Línea ${n}, etiqueta`,
    line: (n: number) => `Línea ${n}`,
    deleteLine: (n: number) => `Eliminar línea ${n}`,
    addLine: "Agregar una línea",
    addAnotherLine: "Agregar otra línea",
  },

  card: {
    options: (name: string) => `Opciones de ${name}`,
    moveUp: "Subir",
    moveDown: "Bajar",
  },

  skills: {
    removed: (text: string) => `Se quitó “${text}”.`,
    cut: (n: number) => (n === 1 ? "Se quitó 1 habilidad del final." : `Se quitaron ${n} habilidades del final.`),
    title: "Tus habilidades",
    helpSidebar: (cap: number) =>
      `En la barra lateral ${cap === 1 ? "cabe 1" : `caben ${cap}`}. Pon primero las que pide el puesto.`,
    helpClassic: "El diseño Clásico las imprime en una sola línea bajo tu resumen.",
    label: "Habilidades",
    placeholder: "Escribe una habilidad, luego Enter",
    count: (n: number, cap: number) => `${n} de ${cap} en la barra lateral`,
    keepFirst: (cap: number) => (cap === 1 ? "Conservar la primera" : `Conservar las ${cap} primeras`),
    suggested: "Habilidades sugeridas",
    oftenListedBy: (job: string) => `Suelen aparecer en CV de ${job}`,
    popular: "Habilidades populares",
  },

  spoken: {
    deleted: (name: string) => `Se eliminó el idioma “${name}”.`,
    title: "Idiomas",
    help: "Elige el idioma y después tu nivel.",
    language: (n: number) => `Idioma ${n}`,
    level: (n: number) => `Idioma ${n}, nivel`,
    delete: (n: number) => `Eliminar idioma ${n}`,
    add: "Agregar un idioma",
    addAnother: "Agregar otro idioma",
    interests: "Intereses",
    interestsPlaceholder: "Escalada, fotografía analógica",
  },

  links: {
    deleted: "Se eliminó el enlace.",
    label: (n: number) => `Enlace ${n}`,
    textLabel: (n: number) => `Enlace ${n}, texto que se imprime`,
    textPlaceholder: "Texto que se imprime",
    prints: (printed: string) => (
      <>
        Se imprime como <b>{printed}</b>. Cambiar
      </>
    ),
    delete: (n: number) => `Eliminar enlace ${n}`,
    add: "Agregar un enlace",
  },

  summary: {
    title: "Resumen",
    help: (drafts: boolean) =>
      `Unas líneas sobre quién eres. ${drafts ? "Elige un borrador o escribe el tuyo." : "Agrega primero tu puesto y tus habilidades para ver borradores."}`,
    headingField: "Título en el CV",
    field: "Resumen",
    lines: (n: number) => `${n} ${n === 1 ? "línea" : "líneas"}`,
    hint: "Quien recluta lee por encima, así que 3 o 4 líneas funcionan mejor. Selecciona palabras para ponerlas en negrita.",
    placeholder: "A qué te dedicas y en qué destacas",
  },

  photo: {
    label: "Foto",
    adjustLabel: "Ajustar tu foto",
    addLabel: "Agregar una foto",
    optional: "Opcional",
    /* The three shapes are all masculine: "prints" and "size" put "un" and "de"
       around them, so a new shape must be masculine too. */
    circle: "círculo",
    square: "cuadrado",
    rounded: "cuadrado redondeado",
    prints: (mm: number, shape: string, template: string) =>
      `Se imprime como un ${shape} de ${mm}\u00a0mm en el diseño ${template}.`,
    drop: "Arrastra una imagen aquí o elige una. Se queda en este navegador.",
    reachAll: (n: number) => (n === 1 ? "El CV imprime esta foto." : `Los ${n} CV imprimen esta foto.`),
    reachSome: (users: number, total: number) =>
      `${users} de ${total} CV ${users === 1 ? "imprime" : "imprimen"} esta foto.`,
    adjust: "Ajustar",
    uploadNew: "Subir otra",
    remove: "Quitar",
    upload: "Subir una foto",
    printHere: "Imprimir la foto en este CV",
    dialogTitle: "Coloca tu foto",
    position: "Posición de la foto",
    zoomOut: "Alejar",
    zoom: "Nivel de zoom",
    zoomIn: "Acercar",
    size: (mm: number, shape: string) => `${shape} de ${mm}\u00a0mm`,
    dpi: (n: number) => `${n}\u00a0dpi`,
    mayPrintSoft: ", puede salir borrosa",
    willPrintSoft: ", saldrá borrosa",
    reset: "Restablecer",
    hint: "Arrastra la foto para moverla, o haz doble clic en un punto para centrarla ahí. Usa la rueda o pellizca para hacer zoom. Con el teclado, las flechas la mueven y las teclas + y - cambian el zoom.",
    save: "Guardar foto",
    thatFile: "ese archivo",
    readFail: (name: string) => `No se pudo leer ${name}. Usa una foto JPEG, PNG o WebP.`,
    openFail: "No se pudo abrir la foto guardada. Súbela de nuevo.",
  },

  ai: {
    button: "Mejorar con IA",
    busy: "Mejorando…",
    readyMany: "Las sugerencias están listas, abajo.",
    readyOne: "La sugerencia está lista, abajo.",
    signInTitle: (kind: "bullets" | "text") =>
      `Inicia sesión para mejorar ${kind === "bullets" ? "tus puntos" : "tu texto"}`,
    signInSay: (perDay: number) =>
      `Las mejoras con IA necesitan una cuenta de Google. Son gratis mientras las probamos, hasta ${perDay} al día. Tus CV se quedan en este navegador.`,
    busyTitle: (kind: "bullets" | "text") => `Mejorando ${kind === "bullets" ? "tus puntos" : "tu texto"}…`,
    /** Under the sign-in card's text: where the text goes, and what continuing accepts. */
    consent: (terms: ReactNode, privacy: ReactNode) => (
      <>
        El texto que envías va a Claude, de Anthropic, en Estados Unidos, para que escriba la sugerencia. Al continuar,
        aceptas los {terms} y la {privacy}.
      </>
    ),
    notNow: "Ahora no",
    tryAgain: "Intentar de nuevo",
    close: "Cerrar",
    suggestions: "Sugerencias",
    suggestion: "Sugerencia",
    leftToday: (n: number) => (n === 1 ? "Hoy te queda 1" : `Hoy te quedan ${n}`),
    lastToday: "Hoy ya no te quedan más",
    useAll: "Usar todas",
    undoAll: "Deshacer todas",
    closeSuggestions: "Cerrar sugerencias",
    before: "Antes",
    after: "Después",
    alreadyGood: "Ya se lee bien",
    use: "Usar",
    undo: "Deshacer",
    useLabel: (n: number) => `Usar la sugerencia ${n}`,
    undoLabel: (n: number) => `Deshacer la sugerencia ${n}`,
    noRewrite: "Sin mejora esta vez",
    checkTitle: "Falló la comprobación de la sesión",
    startTitle: "El inicio de sesión no comenzó",
    unreachable: "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
    failedStatus: (status: number) => `La mejora falló (error ${status}).`,
  },

  meter: {
    example: "Ejemplo. Tu CV aparece aquí mientras escribes.",
    measuring: "Midiendo…",
    over: (pages: number, over: number) => `${pages} ${pages === 1 ? "página" : "páginas"}, ${over} de más`,
    one: (fill: number) => `1 página, ${fill}% llena`,
    many: (pages: number, fill: number) => `${pages} páginas, la última ${fill}% llena`,
    spokenOne: "1 página",
    spokenMany: (pages: number) => `${pages} páginas`,
    label: "Detalles de las páginas",
    pages: "Páginas",
    overBy: (pages: number, over: number) => `${pages}, con ${over} de más`,
    meantForOne: (template: string) => `El diseño ${template} está pensado para una sola página.`,
    meantForUpTo: (template: string, n: number) =>
      `El diseño ${template} está pensado para ${n === 1 ? "una sola página" : `un máximo de ${n} páginas`}.`,
    page: (n: number) => `Página ${n}`,
    lastPage: "Última página",
    full: (fill: number) => `${fill}% llena`,
    emptyAtCut: "Vacío al final de página",
    none: "ninguno",
    mm: (n: number) => `${n}\u00a0mm`,
    emptyNote: "Espacio en blanco al pie de una página porque la siguiente entrada no cabía.",
    stranded: "Un título termina una página sin nada debajo. Busca la marca ámbar en la hoja.",
  },

  stage: {
    previewLabel: "Vista previa de tu CV",
    frameTitle: "Vista previa del CV",
    pageStarts: (n: number) => `Aquí empieza la página ${n}`,
    stranded: (text: string, page: number) => `“${text}” termina la página ${page} sin nada debajo`,
  },

  toolbar: {
    label: "Estilo del texto",
    bold: "Negrita",
    boldTitle: "Negrita (Ctrl o ⌘\u00a0B)",
    italic: "Cursiva",
    italicTitle: "Cursiva (Ctrl o ⌘\u00a0I)",
    link: "Enlace",
    addLinkTitle: "Agregar un enlace (Ctrl o ⌘\u00a0K)",
    unlink: "Quitar enlace",
    removeLinkTitle: "Quitar el enlace",
    address: "Dirección del enlace",
    addressPlaceholder: "example.com o nombre@example.com",
    cancel: "Cancelar",
  },

  suggest: {
    label: "Sugerencias",
    one: "1 sugerencia",
    many: (n: number) => `${n} sugerencias`,
  },

  tokens: {
    remove: (text: string) => `Quitar ${text}`,
    addAnother: "Agregar más",
  },

  /** What the server says when it says no, by the codes in src/lib/errors.ts.
      The server's own English text is the fallback for a code not listed. */
  errors: {
    pdf: {
      unreachable: "No se pudo conectar con el servidor para crear el PDF.",
      rateLimit: "Esta red pidió demasiados PDF en el último minuto. Espera un minuto y vuelve a intentarlo.",
      status: (status: number) => `El servidor no pudo crear el PDF (error ${status}).`,
      foreign: "Este servidor solo imprime CV para su propio editor.",
      tooLarge: "Ese CV es demasiado grande para imprimirlo. Prueba con una foto más pequeña.",
      badJson: "La solicitud no era un JSON válido.",
      noCv: "La solicitud no incluye ningún CV.",
      badPhoto: "La foto debe ser una imagen JPEG, PNG o WebP de menos de 1 MB.",
      noChrome:
        "No se encontró Chrome para imprimir. Instala Google Chrome o apunta CHROME_PATH a un ejecutable de Chrome o Chromium.",
      failed: "No se pudo crear el PDF. Inténtalo de nuevo o imprime la vista previa.",
      generic: "No se pudo crear el PDF.",
    },
    ai: {
      foreign: "Este servidor solo mejora textos para su propio editor.",
      paused: "Las mejoras con IA están en pausa por ahora. Inténtalo más tarde.",
      signIn: "Inicia sesión para usar las mejoras con IA.",
      tooLong: "Ese bloque es demasiado largo para mejorarlo. Prueba con uno más corto.",
      badJson: "La solicitud no era un JSON válido.",
      empty: "Ese bloque está vacío o es demasiado largo para mejorarlo.",
      limitDay: (n: number) =>
        n === 1
          ? "Se acabó tu mejora de hoy. Mañana tendrás más."
          : `Se acabaron tus ${n} mejoras de hoy. Mañana tendrás más.`,
      limitMonth: (n: number) =>
        n === 1 ? "Se acabó tu mejora de este mes." : `Se acabaron tus ${n} mejoras de este mes.`,
      budget: "Las mejoras con IA descansan hasta mañana. La prueba gratuita tiene un presupuesto diario.",
      failed: "La mejora falló. Inténtalo de nuevo en un minuto.",
      busy: "La IA está ocupada. Inténtalo de nuevo en un minuto.",
      unavailable: "La IA no pudo responder. Inténtalo de nuevo en un minuto.",
      refused: "La IA no quiso mejorar este bloque.",
      cutOff: "La respuesta de la IA llegó cortada. Prueba con un bloque más corto.",
    },
    backup: {
      notJson: "Ese archivo no es una copia de seguridad de este editor. Las copias de seguridad son archivos .json.",
      noCvs: "Ese archivo no contiene ningún CV. Elige una copia de seguridad que haya guardado este editor.",
      unreadable: "El editor no pudo leer ningún CV de ese archivo.",
      fallback: "No se pudo leer esa copia de seguridad.",
    },
  },
};

export default es;
