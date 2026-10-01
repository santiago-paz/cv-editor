import type { ReactNode } from "react";
import type { Dict } from "./en";

/* The editor's words in Brazilian Portuguese, written against `Dict` in en.tsx.
   "Currículo" is masculine, so any count of CVs that stays unnamed takes the
   masculine form. Exactly 1 takes the singular. */

const pt: Dict = {
  language: {
    label: "Idioma",
  },

  common: {
    undo: "Desfazer",
    cancel: "Cancelar",
    back: "Voltar",
    /** The name printed on the Control key, for the keycap under Next. */
    ctrl: "Ctrl",
    delete: "Excluir",
    /** Read out after a link that opens another tab. */
    newTab: " (abre em uma nova aba)",
  },

  bar: {
    saved: "Salvo",
    savedInTab: "Salvo nesta aba",
    notSavedFull: "Não salvo: armazenamento cheio",
    notSavedBlocked: "Não salvo: o navegador bloqueia o armazenamento",
  },

  /** The PDF button and the menu beside it. There are two ways to get the PDF:
      the browser's print dialog, which keeps the CV on the device, and a file
      that the server makes. */
  pdf: {
    making: "Gerando o PDF…",
    /** The main button when it prints. On a narrow screen only the second part
        shows, so it must read well alone. */
    printLead: "Salvar como ",
    printWord: "PDF",
    printTitle: "Abre a caixa de impressão do navegador. Seu currículo fica neste dispositivo.",
    /** The main button when it makes a file. " PDF" is added when the bar is wide. */
    fileWord: "Baixar",
    fileMore: " PDF",
    fileLabel: "Baixar PDF",
    fileTitle: "Baixa um arquivo PDF criado no nosso servidor.",
    menuLabel: "Formas de obter o PDF",
    moreLabel: "Mais formas de obter o PDF",
    /** Marks the way the main button takes. */
    tagDefault: "Padrão",
    print: {
      title: "Salvar como PDF",
      hint: "Abre a caixa de impressão do navegador. Escolha Salvar como PDF ali. O arquivo não tem autor nem palavras-chave.",
      fact: "Seu currículo nunca sai deste dispositivo.",
    },
    file: {
      title: "Baixar um arquivo PDF",
      hint: "Você recebe o arquivo com um clique. Nosso servidor imprime seu currículo com o Chrome e devolve o PDF. O arquivo traz seu nome como autor e suas habilidades como palavras-chave.",
      fact: "Seu currículo vai para o nosso servidor. Ele não guarda cópia.",
    },
    cautionPhone: "Celulares e tablets podem imprimir a página inteira, e não só o currículo.",
    cautionBrowser: "As quebras de página são testadas no Chrome. Confira na prévia da caixa de impressão.",
  },

  cvs: {
    label: "Seus currículos",
    /** What a CV with no name is called in lists. */
    untitled: "Currículo sem título",
    /** The title the sample CV starts with. */
    sampleTitle: "Currículo de exemplo",
    /** Goes in "Frontend (cópia)" and "Frontend (cópia 2)". */
    copyWord: "cópia",
    nameLabel: "Nome deste currículo",
    nameNote: "Só você vê este nome. Ele nunca é impresso. Deixe em branco para usar seu próprio nome.",
    sample: "Exemplo",
    justNow: "agora mesmo",
    minutesAgo: (n: number) => `há ${n} min`,
    hoursAgo: (n: number) => `há ${n} h`,
    daysAgo: (n: number) => `há ${n} d`,
    copyOf: (name: string) => `Fazer uma cópia de ${name}`,
    deleteOf: (name: string) => `Excluir ${name}`,
    new: "Novo currículo",
    trySample: "Testar o exemplo",
    madeBy: "Feito por",
    donate: "Doar",
    /** Read out after "Doar". */
    donateVia: " com o PayPal (abre em uma nova aba)",
  },

  style: {
    label: "Estilo do currículo",
    button: "Estilo",
    layout: "Layout",
    onePage: "1 página",
    upToPages: (n: number) => `Até ${n} ${n === 1 ? "página" : "páginas"}`,
    sidebarColor: "Cor da barra lateral",
    hardToRead: "Texto difícil de ler",
    easyToRead: "Texto fácil de ler",
    pickAny: "Escolha qualquer cor",
    customColor: "Cor personalizada da barra lateral",
    hex: "Hex",
    badHex: "Digite 6 dígitos hex, como #1E4A35.",
    thisCvOnly: "Vale só para este currículo.",
    cvLanguage: "Idioma do currículo",
    cvLanguageNote:
      "Muda os títulos que o layout imprime sozinho, como Habilidades e Idiomas. Também muda as sugestões. Os títulos que você renomeou não mudam.",
    /** Keyed by the English names in src/lib/color.ts. */
    colors: {
      Navy: "Marinho",
      Cobalt: "Cobalto",
      Petrol: "Petróleo",
      Forest: "Floresta",
      Burgundy: "Bordô",
      Plum: "Ameixa",
      Charcoal: "Grafite",
    },
  },

  templates: {
    sidebar: {
      name: "Barra lateral",
      note: "Uma página, com uma barra colorida para seus dados de contato, habilidades e idiomas.",
    },
    classic: {
      name: "Clássico",
      note: "Uma coluna, até duas páginas. Funciona melhor em portais de vagas que copiam seu currículo para os formulários deles.",
    },
  },

  /** The words of the links to the terms and the privacy page, inside a sentence
      that reads "aceita os {termsLink} e a {privacyLink}". */
  legal: {
    termsLink: "Termos",
    privacyLink: "Política de privacidade",
  },

  settings: {
    label: "Configurações",
    look: "Aparência",
    theme: "Tema",
    auto: "Auto",
    light: "Claro",
    dark: "Escuro",
    zoom: "Zoom",
    fit: "Ajustar",
    actualSize: "100%",
    cvs: "Seus currículos",
    tabNote: "Seus currículos e sua foto ficam só nesta aba. Fechar a aba exclui tudo, então faça backup do que quiser guardar.",
    browserNote:
      "Seus currículos ficam salvos só neste navegador. Limpar os dados de sites dele exclui os currículos, então guarde um backup.",
    forget: "Esquecer meus currículos ao fechar esta aba",
    backUp: "Fazer backup",
    restore: "Restaurar",
    account: "Conta",
    privacy: "Privacidade",
    terms: "Termos",
  },

  account: {
    checking: "Verificando sua conta…",
    checkFailed: "Não foi possível verificar sua conta. Tente de novo em um minuto.",
    only: "A conta serve só para as reescritas com IA. Seus currículos ficam neste navegador, com ou sem conta.",
    opening: "Abrindo o Google…",
    continue: "Continuar com o Google",
    startFailed: "Não foi possível iniciar o login. Tente de novo em um minuto.",
    /** Under the Google button: where the data goes, and what continuing accepts. */
    consent: (terms: ReactNode, privacy: ReactNode) => (
      <>
        Seus dados são processados nos Estados Unidos. Ao continuar, você aceita os {terms} e a {privacy}.
      </>
    ),
    leftLabel: "Reescritas com IA restantes",
    today: "Hoje",
    month: "Este mês",
    left: (n: number) => `${n === 1 ? "resta" : "restam"} ${n}`,
    confirm: "Excluir sua conta e seu histórico de IA? Seus currículos continuam neste navegador.",
    delete: "Excluir conta",
    needsRecent: "Para excluir, é preciso um login recente. Saia, entre de novo e exclua.",
    signOut: "Sair",
  },

  editor: {
    skip: "Pular para a prévia",
    writeLabel: "Escreva seu currículo",
    emptyTitle: "Nenhum currículo ainda",
    emptyText: "Comece um novo ou abra o exemplo para ver como o editor funciona.",
    openSample: "Abrir o exemplo",
    dockLabel: "Mostrar",
    edit: "Editar",
    preview: "Prévia",
    signedIn: (email: string) => `Você entrou como ${email}. Pressione Melhorar com IA para testar.`,
    copyMade: (title: string) => `Cópia criada: “${title}”. O original continua como estava.`,
    deleted: (name: string) => `Você excluiu “${name}”.`,
    backedUp: (n: number) =>
      `Backup salvo: ${n} ${n === 1 ? "currículo" : "currículos"}. Use Restaurar para abri-lo, neste navegador ou em outro.`,
    restored: (added: number, replaced: number, kept: number, photo: boolean) => {
      const changed = [
        added && `${added} ${added === 1 ? "adicionado" : "adicionados"}`,
        replaced && `${replaced} ${replaced === 1 ? "atualizado" : "atualizados"}`,
      ].filter(Boolean);
      const stayed = kept
        ? kept === 1
          ? " 1 ficou como estava, porque a cópia daqui é mais recente."
          : ` ${kept} ficaram como estavam, porque as cópias daqui são mais recentes.`
        : "";
      return `Backup restaurado${changed.length ? `: ${changed.join(", ")}` : ""}.${stayed}${photo ? " A foto voltou também." : ""}`;
    },
    photoFull:
      "O armazenamento deste navegador está cheio, então a foto não foi salva. Exclua alguns currículos ou use uma foto menor.",
    photoBlocked: "Este navegador não deixa o editor salvar, então a foto dura só até você fechar a aba.",
    photoDropped:
      "Foto salva. A foto original não coube no armazenamento, então um ajuste posterior parte do recorte.",
    photoSaved: "Foto salva.",
    photoRemoved: "Foto removida de todos os currículos.",
    tabFull: "Esta aba não tem espaço para seus currículos, então eles continuam salvos neste navegador.",
    tabBlocked:
      "Este navegador não deixa uma aba guardar uma cópia própria, então seus currículos continuam salvos no navegador.",
    tabOn: "Esta aba agora esquece seus currículos ao ser fechada. Faça backup dos que quiser guardar.",
    tabOnAction: "Fazer backup",
    browserFull:
      "O armazenamento deste navegador está cheio, então seus currículos ficam só nesta aba. Exclua alguns currículos ou faça backup deles.",
    browserBlocked: "Este navegador não deixa o editor salvar, então seus currículos ficam só nesta aba.",
    browserOn: "Seus currículos voltaram a ser salvos neste navegador.",
    emptyCv: "O currículo está vazio. Adicione primeiro seu nome e seu cargo.",
    downloaded: (name: string) => `Arquivo baixado: ${name}`,
    /** Follows "Arquivo baixado: {name}." in the thank-you after the first PDF. */
    donateAsk: "Se o editor ajudou, você pode apoiá-lo com uma doação.",
    donate: "Doar",
    printHint: " Você pode salvar o PDF pela caixa de impressão do navegador.",
    printFailed: "A caixa de impressão não abriu. Você pode baixar um arquivo PDF.",
    downloadFile: "Baixar arquivo",
    savedKeyTab: "Salvo nesta aba. Tudo é salvo enquanto você digita.",
    savedKeyBrowser: "Salvo neste navegador. Tudo é salvo enquanto você digita.",
  },

  panel: {
    /** The names of the steps. A section's own heading names its step. */
    you: "Você",
    untitled: "Sem título",
    skills: "Habilidades",
    languages: "Idiomas",
    summary: "Resumo",
    filledIn: " (com conteúdo)",
    sampleNote: (start: ReactNode) => (
      <>
        Este é um exemplo. Digite por cima dele ou {start}.
      </>
    ),
    startOwn: "comece seu próprio currículo",
    parts: "Partes do currículo",
    addSection: "Adicionar uma seção",
    allSections: "Todos os tipos de seção já estão no currículo.",
    next: (label: string) => (
      <>
        Próximo: <b>{label}</b>
      </>
    ),
    /** Under the Next button. The two links are the privacy page and the terms. */
    serversNote: (privacy: ReactNode, terms: ReactNode) => (
      <>
        Salvar como PDF fica no seu dispositivo. O download do arquivo PDF e as reescritas com IA são processados em servidores nos EUA. {privacy}
        <span aria-hidden="true"> · </span>
        {terms}
      </>
    ),
    /** The label of the cross that closes that note. */
    closeNote: "Fechar esta nota",
    /** What each kind of section is for, shown in the "Adicionar uma seção" menu. */
    hints: {
      experience: "Empregos, com datas e tópicos",
      education: "Formação e cursos",
      projects: "O que você criou, com links",
      keySkills: "Linhas como “Frontend: React, CSS”",
      awards: "Uma linha com rótulo para cada item",
      highlights: "Uma lista simples de tópicos",
      text: "Texto livre sob um título",
    },
  },

  you: {
    title: "Sobre você",
    help: (enter: ReactNode) => (
      <>
        Digite algumas letras e pressione {enter}. O campo é preenchido e o cursor avança.
      </>
    ),
    name: "Nome",
    role: "Cargo",
    location: "Localização",
    email: "E-mail",
    phone: "Telefone",
    badEmail: "Isso não parece um endereço de e-mail.",
    links: "Links",
  },

  roles: {
    addLatest: "Adicionar seu último emprego",
    addJob: "Adicionar outro emprego",
    addDegree: "Adicionar um curso ou formação",
    addAnotherDegree: "Adicionar outro curso ou formação",
    newEntry: "Nova formação",
    newJob: "Novo emprego",
    degree: "Curso ou formação",
    jobTitle: "Cargo",
    school: "Instituição",
    company: "Empresa",
    when: "Quando",
    datesLabel: "Datas",
    datesHint: (typed1: string, result1: string, typed2: string, result2: string) => (
      <>
        Digite <b>{typed1}</b> para obter <b>{result1}</b>, ou <b>{typed2}</b> para obter <b>{result2}</b>.
      </>
    ),
    note: "Nota após o título",
    website: "Site",
    websiteLabel: "Site da empresa ou da instituição",
    noteOrWebsite: "Nota ou site",
    addDetails: "Adicionar detalhes",
    firstDetail: "Menção honrosa, TCC, algo que mereça uma linha",
  },

  bullets: {
    first: "O que você fez",
    more: "Outra coisa que você fez",
    add: "Adicionar um tópico",
    addAnother: "Adicionar outro tópico",
    label: (n: number) => `Tópico ${n}`,
    delete: (n: number) => `Excluir tópico ${n}`,
    deleted: "Tópico excluído.",
  },

  sections: {
    /** What the pane says under a section's heading. */
    help: {
      experience: "Comece pelo seu último emprego. Digite algumas letras e pressione Enter.",
      education: "Digite seu curso ou formação. Instituições e áreas são sugeridas enquanto você digita.",
      projects: "O que você criou ou liderou. Adicione um link para as pessoas poderem ver.",
      keySkills: "Uma linha por grupo, como Frontend: React, CSS.",
      awards: "Uma linha para cada item: o que é e depois o detalhe.",
      highlights: "Uma lista simples de tópicos.",
      text: "Um parágrafo curto sob este título.",
    },
    untitled: "Sem título",
    deleted: (name: string) => `Seção “${name}” excluída.`,
    optionsFor: (name: string) => `Opções de ${name}`,
    optionsForSection: (name: string) => `Opções da seção ${name}`,
    rename: "Renomear",
    moveEarlier: "Mover para antes",
    moveLater: "Mover para depois",
    delete: "Excluir seção",
    headingLabel: "Título da seção",
    paragraph: "Parágrafo",
    paragraphPlaceholder: "Escreva um parágrafo curto",
    addProject: "Adicionar um projeto",
    addAnotherProject: "Adicionar outro projeto",
    newProject: "Novo projeto",
    projectName: "Nome do projeto",
    projectLinks: "Links",
    addLink: "Adicionar um link",
    projectFirst: "O que ele faz e o que você usou",
    label: "Rótulo",
    text: "Texto",
    lineDeleted: "Linha excluída.",
    lineLabel: (n: number) => `Linha ${n}, rótulo`,
    line: (n: number) => `Linha ${n}`,
    deleteLine: (n: number) => `Excluir linha ${n}`,
    addLine: "Adicionar uma linha",
    addAnotherLine: "Adicionar outra linha",
  },

  card: {
    options: (name: string) => `Opções de ${name}`,
    moveUp: "Mover para cima",
    moveDown: "Mover para baixo",
  },

  skills: {
    removed: (text: string) => `Você removeu “${text}”.`,
    cut: (n: number) => (n === 1 ? "Removida a última habilidade." : `Removidas as últimas ${n} habilidades.`),
    title: "Suas habilidades",
    helpSidebar: (cap: number) =>
      `Na barra lateral ${cap === 1 ? "cabe 1 habilidade" : `cabem ${cap} habilidades`}. Coloque primeiro as que a vaga pede.`,
    helpClassic: "O layout Clássico imprime as habilidades em uma linha, abaixo do seu resumo.",
    label: "Habilidades",
    placeholder: "Digite uma habilidade e pressione Enter",
    count: (n: number, cap: number) => `${n} de ${cap} ${n === 1 ? "cabe" : "cabem"} na barra lateral`,
    keepFirst: (cap: number) => (cap === 1 ? "Manter só a primeira" : `Manter as ${cap} primeiras`),
    suggested: "Habilidades sugeridas",
    oftenListedBy: (job: string) => `Comuns em currículos de ${job}`,
    popular: "Habilidades populares",
  },

  spoken: {
    deleted: (name: string) => `Idioma excluído: ${name}.`,
    title: "Idiomas",
    help: "Escolha o idioma e depois o seu nível de fluência.",
    language: (n: number) => `Idioma ${n}`,
    level: (n: number) => `Idioma ${n}, nível`,
    delete: (n: number) => `Excluir idioma ${n}`,
    add: "Adicionar um idioma",
    addAnother: "Adicionar outro idioma",
    interests: "Interesses",
    interestsPlaceholder: "Corrida, fotografia analógica",
  },

  links: {
    deleted: "Link excluído.",
    label: (n: number) => `Link ${n}`,
    textLabel: (n: number) => `Link ${n}, texto a imprimir`,
    textPlaceholder: "Texto a imprimir",
    prints: (printed: string) => (
      <>
        Impresso como <b>{printed}</b>. Alterar
      </>
    ),
    delete: (n: number) => `Excluir link ${n}`,
    add: "Adicionar um link",
  },

  summary: {
    title: "Resumo",
    help: (drafts: boolean) =>
      `Algumas linhas sobre quem você é. ${drafts ? "Escolha um rascunho ou escreva o seu." : "Adicione antes seu cargo e suas habilidades para ver rascunhos."}`,
    headingField: "Título no currículo",
    field: "Resumo",
    lines: (n: number) => `${n} ${n === 1 ? "linha" : "linhas"}`,
    hint: "Quem recruta lê rápido, então 3 ou 4 linhas funcionam melhor. Selecione palavras para colocá-las em negrito.",
    placeholder: "O que você faz e no que se destaca",
  },

  photo: {
    label: "Foto",
    adjustLabel: "Ajustar sua foto",
    addLabel: "Adicionar uma foto",
    optional: "Opcional",
    circle: "círculo",
    square: "quadrado",
    rounded: "quadrado arredondado",
    prints: (mm: number, shape: string, template: string) =>
      `A foto sai como um ${shape} de ${mm}\u00a0mm no layout ${template}.`,
    drop: "Arraste uma imagem para cá ou escolha uma. Ela fica neste navegador.",
    reachAll: (n: number) =>
      n === 1 ? "Esta foto é impressa no seu currículo." : `Esta foto é impressa em todos os ${n} currículos.`,
    reachSome: (users: number, total: number) =>
      `Esta foto é impressa em ${users} de ${total} ${total === 1 ? "currículo" : "currículos"}.`,
    adjust: "Ajustar",
    uploadNew: "Enviar outra",
    remove: "Remover",
    upload: "Enviar uma foto",
    printHere: "Imprimir neste currículo",
    dialogTitle: "Posicione sua foto",
    position: "Posição da foto",
    zoomOut: "Diminuir o zoom",
    zoom: "Zoom",
    zoomIn: "Aumentar o zoom",
    size: (mm: number, shape: string) => `${shape} de ${mm}\u00a0mm`,
    dpi: (n: number) => `${n}\u00a0dpi`,
    mayPrintSoft: ", pode sair meio borrada",
    willPrintSoft: ", vai sair borrada",
    reset: "Redefinir",
    hint: "Arraste para mover a foto ou dê dois cliques em um ponto para centralizá-lo. Use a roda do mouse ou o gesto de pinça para dar zoom. No teclado, as setas movem a foto e + e - dão zoom.",
    save: "Salvar foto",
    thatFile: "esse arquivo",
    readFail: (name: string) => `Não foi possível ler ${name}. Use uma foto JPEG, PNG ou WebP.`,
    openFail: "Não foi possível abrir a foto salva. Envie a foto de novo.",
  },

  ai: {
    button: "Melhorar com IA",
    busy: "Melhorando…",
    readyMany: "As sugestões estão prontas, logo abaixo.",
    readyOne: "A sugestão está pronta, logo abaixo.",
    signInTitle: (kind: "bullets" | "text") => `Entre para melhorar ${kind === "bullets" ? "seus tópicos" : "seu texto"}`,
    signInSay: (perDay: number) =>
      `As reescritas com IA exigem uma conta do Google. São gratuitas durante o teste, até ${perDay} por dia. Seus currículos continuam neste navegador.`,
    busyTitle: (kind: "bullets" | "text") => `Melhorando ${kind === "bullets" ? "seus tópicos" : "seu texto"}…`,
    /** Under the sign-in card's text: where the text goes, and what continuing accepts. */
    consent: (terms: ReactNode, privacy: ReactNode) => (
      <>
        O texto que você envia vai para o Claude, da Anthropic, nos Estados Unidos, para escrever a sugestão. Ao
        continuar, você aceita os {terms} e a {privacy}.
      </>
    ),
    notNow: "Agora não",
    tryAgain: "Tentar de novo",
    close: "Fechar",
    suggestions: "Sugestões",
    suggestion: "Sugestão",
    leftToday: (n: number) => `${n === 1 ? "Resta" : "Restam"} ${n} para hoje`,
    lastToday: "Essa foi a última de hoje",
    useAll: "Usar todas",
    undoAll: "Desfazer todas",
    closeSuggestions: "Fechar sugestões",
    before: "Antes",
    after: "Depois",
    alreadyGood: "Já está bom assim",
    use: "Usar",
    undo: "Desfazer",
    useLabel: (n: number) => `Usar sugestão ${n}`,
    undoLabel: (n: number) => `Desfazer sugestão ${n}`,
    noRewrite: "Sem reescrita desta vez",
    checkTitle: "Falha ao verificar o login",
    startTitle: "O login não começou",
    unreachable: "Não foi possível acessar o servidor. Verifique sua conexão e tente de novo.",
    failedStatus: (status: number) => `A reescrita falhou (erro ${status}).`,
  },

  meter: {
    example: "Exemplo. Seu currículo aparece aqui conforme você digita.",
    measuring: "Medindo…",
    over: (pages: number, over: number) => `${pages} ${pages === 1 ? "página" : "páginas"}, ${over} a mais`,
    one: (fill: number) => `1 página, ${fill}% cheia`,
    many: (pages: number, fill: number) =>
      `${pages} ${pages === 1 ? "página" : "páginas"}, a última ${fill}% cheia`,
    spokenOne: "1 página",
    spokenMany: (pages: number) => `${pages} ${pages === 1 ? "página" : "páginas"}`,
    label: "Detalhes da página",
    pages: "Páginas",
    overBy: (pages: number, over: number) => `${pages} (${over} a mais)`,
    meantForOne: (template: string) => `O layout ${template} foi pensado para uma página.`,
    meantForUpTo: (template: string, n: number) =>
      `O layout ${template} foi pensado para até ${n} ${n === 1 ? "página" : "páginas"}.`,
    page: (n: number) => `Página ${n}`,
    lastPage: "Última página",
    full: (fill: number) => `${fill}% cheia`,
    emptyAtCut: "Vazio na quebra de página",
    none: "nenhum",
    mm: (n: number) => `${n}\u00a0mm`,
    emptyNote: "Espaço em branco no fim de uma página porque o próximo item não coube.",
    stranded: "Um título fica no fim da página, sem nada abaixo dele. Procure a marca âmbar na folha.",
  },

  stage: {
    previewLabel: "Prévia do seu currículo",
    frameTitle: "Prévia do currículo",
    pageStarts: (n: number) => `A página ${n} começa aqui`,
    stranded: (text: string, page: number) => `“${text}” fica no fim da página ${page}, sem nada abaixo`,
  },

  toolbar: {
    label: "Estilo do texto",
    bold: "Negrito",
    boldTitle: "Negrito (Ctrl ou ⌘\u00a0B)",
    italic: "Itálico",
    italicTitle: "Itálico (Ctrl ou ⌘\u00a0I)",
    link: "Link",
    addLinkTitle: "Adicionar um link (Ctrl ou ⌘\u00a0K)",
    unlink: "Remover link",
    removeLinkTitle: "Remover o link",
    address: "Endereço do link",
    addressPlaceholder: "example.com ou nome@example.com",
    cancel: "Cancelar",
  },

  suggest: {
    label: "Sugestões",
    one: "1 sugestão",
    many: (n: number) => `${n} ${n === 1 ? "sugestão" : "sugestões"}`,
  },

  tokens: {
    remove: (text: string) => `Remover ${text}`,
    addAnother: "Adicionar mais",
  },

  /** What the server says when it says no, by the codes in src/lib/errors.ts.
      The server's own English text is the fallback for a code not listed. */
  errors: {
    pdf: {
      unreachable: "Não foi possível acessar o servidor para gerar o PDF.",
      rateLimit: "Esta rede pediu PDFs demais no último minuto. Espere um minuto e tente de novo.",
      status: (status: number) => `O servidor não conseguiu gerar o PDF (erro ${status}).`,
      foreign: "Este servidor só imprime currículos para o próprio editor.",
      tooLarge: "Esse currículo é grande demais para imprimir. Tente uma foto menor.",
      badJson: "A solicitação não era um JSON válido.",
      noCv: "A solicitação não contém nenhum currículo.",
      badPhoto: "A foto deve ser uma imagem JPEG, PNG ou WebP com menos de 1 MB.",
      noChrome:
        "Nenhum Chrome encontrado para imprimir. Instale o Google Chrome ou defina CHROME_PATH com o caminho de um executável do Chrome ou do Chromium.",
      failed: "Não foi possível gerar o PDF. Tente de novo ou imprima a prévia.",
      generic: "Não foi possível gerar o PDF.",
    },
    ai: {
      foreign: "Este servidor só reescreve textos para o próprio editor.",
      paused: "As reescritas com IA estão pausadas por enquanto. Tente de novo mais tarde.",
      signIn: "Entre para usar as reescritas com IA.",
      tooLong: "Esse texto é longo demais para reescrever. Tente um mais curto.",
      badJson: "A solicitação não era um JSON válido.",
      empty: "Esse texto está vazio ou é longo demais para reescrever.",
      limitDay: (n: number) =>
        n === 1
          ? "Você já usou a reescrita de hoje. Amanhã tem mais."
          : `Você já usou as ${n} reescritas de hoje. Amanhã tem mais.`,
      limitMonth: (n: number) =>
        n === 1 ? "Você já usou a reescrita deste mês." : `Você já usou as ${n} reescritas deste mês.`,
      budget: "As reescritas com IA estão descansando até amanhã. O teste gratuito tem um orçamento diário.",
      failed: "A reescrita falhou. Tente de novo em um minuto.",
      busy: "A IA está ocupada. Tente de novo em um minuto.",
      unavailable: "A IA não conseguiu responder. Tente de novo em um minuto.",
      refused: "A IA se recusou a reescrever este texto.",
      cutOff: "A resposta da IA veio cortada. Tente um texto mais curto.",
    },
    backup: {
      notJson: "Esse arquivo não é um backup deste editor. Os backups são arquivos .json.",
      noCvs: "Esse arquivo não tem nenhum currículo. Escolha um backup que este editor salvou.",
      unreadable: "O editor não conseguiu ler nenhum currículo nesse arquivo.",
      fallback: "Não foi possível ler esse backup.",
    },
  },
};

export default pt;
