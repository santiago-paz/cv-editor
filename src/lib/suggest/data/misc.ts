import type { PresetId } from "@/lib/cv/types";
import type { ByLocale } from "../types";

/* The small lists: language levels, hobbies, extra sections and the words
   around an entry. The big lists live in their own files. Plain hyphens only,
   as everywhere else in the editor. */

/* ---------------------------------------------------------- language levels */

export interface Level {
  name: string;
  /** How full the sidebar's language bar is drawn, 0 to 100. */
  percent: number;
  aliases: string[];
}

export const LEVELS: ByLocale<Level[]> = {
  en: [
    { name: "Native", percent: 100, aliases: ["Mother tongue", "Bilingual", "First language"] },
    { name: "Fluent", percent: 88, aliases: ["Full professional", "Proficient"] },
    { name: "Advanced", percent: 75, aliases: ["Upper intermediate", "Very good"] },
    { name: "Intermediate", percent: 50, aliases: ["Conversational", "Good"] },
    { name: "Basic", percent: 25, aliases: ["Beginner", "Elementary", "Limited"] },
  ],
  es: [
    { name: "Nativo", percent: 100, aliases: ["Lengua materna", "Bilingüe", "Materno"] },
    { name: "Fluido", percent: 88, aliases: ["Profesional", "Competente", "Fluent"] },
    { name: "Avanzado", percent: 75, aliases: ["Alto", "Muy bueno"] },
    { name: "Intermedio", percent: 50, aliases: ["Conversacional", "Medio", "Bueno"] },
    { name: "Básico", percent: 25, aliases: ["Principiante", "Elemental", "Inicial"] },
  ],
  de: [
    { name: "Muttersprache", percent: 100, aliases: ["Muttersprachler", "Native", "Erstsprache"] },
    { name: "Fließend", percent: 88, aliases: ["Verhandlungssicher", "Fluent", "Sehr gut"] },
    { name: "Fortgeschritten", percent: 75, aliases: ["Gut", "Advanced"] },
    { name: "Mittelstufe", percent: 50, aliases: ["Gute Grundkenntnisse", "Intermediate"] },
    { name: "Grundkenntnisse", percent: 25, aliases: ["Basis", "Anfänger", "Basic"] },
  ],
};

/** The European scale, which many CVs use in every language. */
export const CEFR: Level[] = [
  { name: "C2", percent: 100, aliases: [] },
  { name: "C1", percent: 88, aliases: [] },
  { name: "B2", percent: 75, aliases: [] },
  { name: "B1", percent: 50, aliases: [] },
  { name: "A2", percent: 35, aliases: [] },
  { name: "A1", percent: 25, aliases: [] },
];

/* --------------------------------------------------- spoken language names */

/** ISO 639 codes of the languages offered, most spoken on CVs first. The names
    come from the browser in the CV's own language, so nothing here needs
    translating. */
export const LANGUAGE_CODES = [
  "en", "es", "de", "fr", "it", "pt", "zh", "ja", "ko", "ar", "ru", "hi", "nl", "sv", "da", "no", "fi", "pl", "cs",
  "sk", "hu", "ro", "bg", "el", "tr", "he", "uk", "ca", "gl", "eu", "hr", "sr", "sl", "lt", "lv", "et", "is", "ga",
  "cy", "sq", "mk", "bs", "bn", "ur", "fa", "id", "ms", "th", "vi", "tl", "sw", "af", "zu", "am", "ta", "te", "ml",
  "kn", "mr", "gu", "pa", "ne", "si", "km", "my", "lo", "mn", "kk", "uz", "az", "hy", "ka", "la", "eo", "yi", "ht",
  "qu", "gn", "lb", "mt", "yue",
];

/* ------------------------------------------------------------------ hobbies */

export const HOBBIES: ByLocale<string[]> = {
  en: [
    "Reading", "Traveling|Travelling|Travel", "Photography", "Hiking", "Cooking", "Running", "Cycling", "Swimming",
    "Yoga", "Music", "Playing guitar|Guitar", "Playing piano|Piano", "Drawing", "Painting", "Writing", "Chess",
    "Board games", "Video games|Gaming", "Football|Soccer", "Basketball", "Tennis", "Climbing", "Bouldering",
    "Skiing", "Snowboarding", "Surfing", "Sailing", "Fishing", "Camping", "Film|Movies|Cinema", "Theater",
    "Dancing", "Singing", "Volunteering", "Baking", "Gardening", "Woodworking", "DIY", "Knitting", "Sewing",
    "Podcasts", "Meditation", "Fitness|Gym", "Weightlifting", "Martial arts", "Boxing", "Golf", "Volleyball",
    "Rugby", "Cricket", "Astronomy", "Learning languages|Languages", "Coffee", "Wine tasting", "Blogging",
    "Coding|Programming", "Collecting", "Horse riding", "Skateboarding", "Table tennis", "Badminton",
  ],
  es: [
    "Lectura|Leer", "Viajar", "Fotografía", "Senderismo", "Cocina|Cocinar", "Correr|Running", "Ciclismo",
    "Natación", "Yoga", "Música", "Guitarra", "Piano", "Dibujo", "Pintura", "Escritura|Escribir", "Ajedrez",
    "Juegos de mesa", "Videojuegos", "Fútbol", "Baloncesto|Básquet", "Tenis", "Escalada", "Esquí", "Snowboard",
    "Surf", "Navegación|Vela", "Pesca", "Camping|Acampar", "Cine", "Teatro", "Baile|Bailar", "Canto|Cantar",
    "Voluntariado", "Repostería", "Jardinería", "Carpintería", "Bricolaje", "Tejer", "Costura", "Podcasts",
    "Meditación", "Fitness|Gimnasio", "Pesas", "Artes marciales", "Boxeo", "Golf", "Voleibol", "Rugby",
    "Astronomía", "Aprender idiomas|Idiomas", "Café", "Cata de vinos", "Blog", "Programación", "Coleccionismo",
    "Equitación", "Skateboard|Patinaje", "Ping pong|Tenis de mesa", "Bádminton",
  ],
  de: [
    "Lesen", "Reisen", "Fotografie|Fotografieren", "Wandern", "Kochen", "Laufen|Joggen", "Radfahren",
    "Schwimmen", "Yoga", "Musik", "Gitarre", "Klavier", "Zeichnen", "Malen", "Schreiben", "Schach",
    "Brettspiele", "Videospiele|Gaming", "Fußball", "Basketball", "Tennis", "Klettern", "Bouldern", "Skifahren",
    "Snowboarden", "Surfen", "Segeln", "Angeln", "Camping|Zelten", "Kino|Film", "Theater", "Tanzen", "Singen",
    "Ehrenamt", "Backen", "Gärtnern", "Holzarbeiten", "Heimwerken", "Stricken", "Nähen", "Podcasts",
    "Meditation", "Fitness|Fitnessstudio", "Krafttraining", "Kampfsport", "Boxen", "Golf", "Volleyball", "Rugby",
    "Astronomie", "Sprachen lernen|Sprachen", "Kaffee", "Weinverkostung", "Bloggen", "Programmieren", "Sammeln",
    "Reiten", "Skateboarden", "Tischtennis", "Badminton",
  ],
};

/* ----------------------------------------------------------- extra sections */

export interface SectionChoice {
  /** The heading the section starts with. */
  title: string;
  /** The kind of entries it holds, through the preset it is made from. */
  preset: PresetId;
  hint: string;
  aliases?: string[];
}

export const SECTION_CHOICES: ByLocale<SectionChoice[]> = {
  en: [
    { title: "Projects", preset: "projects", hint: "Things you built, with links" },
    { title: "Certifications", preset: "awards", hint: "One line each", aliases: ["Certificates", "Licenses"] },
    { title: "Volunteering", preset: "experience", hint: "Roles, with dates and bullets", aliases: ["Volunteer work"] },
    { title: "Internships", preset: "experience", hint: "Roles, with dates and bullets", aliases: ["Traineeships"] },
    { title: "Awards", preset: "awards", hint: "One line each", aliases: ["Honors", "Achievements"] },
    { title: "Courses", preset: "education", hint: "Courses and training", aliases: ["Training"] },
    { title: "Publications", preset: "highlights", hint: "A plain list", aliases: ["Papers", "Articles"] },
    { title: "Key Skills", preset: "keySkills", hint: "Lines like Frontend: React, CSS", aliases: ["Skills by group"] },
    { title: "Highlights", preset: "highlights", hint: "A plain list of points", aliases: ["Achievements"] },
    { title: "References", preset: "text", hint: "A short paragraph" },
    { title: "About", preset: "text", hint: "Free text under a heading", aliases: ["About me", "Paragraph"] },
    { title: "Experience", preset: "experience", hint: "Jobs, with dates and bullets", aliases: ["Work", "Employment"] },
    { title: "Education", preset: "education", hint: "Degrees and courses", aliases: ["School", "Studies"] },
  ],
  es: [
    { title: "Proyectos", preset: "projects", hint: "Lo que construiste, con enlaces" },
    { title: "Certificaciones", preset: "awards", hint: "Una línea cada una", aliases: ["Certificados", "Licencias"] },
    { title: "Voluntariado", preset: "experience", hint: "Puestos, con fechas y puntos" },
    { title: "Prácticas", preset: "experience", hint: "Puestos, con fechas y puntos", aliases: ["Pasantías", "Becas"] },
    { title: "Premios", preset: "awards", hint: "Una línea cada uno", aliases: ["Logros", "Reconocimientos"] },
    { title: "Cursos", preset: "education", hint: "Cursos y formación", aliases: ["Formación complementaria"] },
    { title: "Publicaciones", preset: "highlights", hint: "Una lista simple", aliases: ["Artículos"] },
    { title: "Habilidades clave", preset: "keySkills", hint: "Líneas como Frontend: React, CSS" },
    { title: "Logros", preset: "highlights", hint: "Una lista simple de puntos" },
    { title: "Referencias", preset: "text", hint: "Un párrafo corto" },
    { title: "Sobre mí", preset: "text", hint: "Texto libre bajo un título", aliases: ["Párrafo"] },
    { title: "Experiencia", preset: "experience", hint: "Empleos, con fechas y puntos", aliases: ["Trabajo"] },
    { title: "Formación", preset: "education", hint: "Títulos y cursos", aliases: ["Educación", "Estudios"] },
  ],
  de: [
    { title: "Projekte", preset: "projects", hint: "Was du gebaut hast, mit Links" },
    { title: "Zertifikate", preset: "awards", hint: "Eine Zeile je Eintrag", aliases: ["Zertifizierungen", "Lizenzen"] },
    { title: "Ehrenamt", preset: "experience", hint: "Stationen, mit Zeitraum und Punkten", aliases: ["Freiwilligenarbeit"] },
    { title: "Praktika", preset: "experience", hint: "Stationen, mit Zeitraum und Punkten" },
    { title: "Auszeichnungen", preset: "awards", hint: "Eine Zeile je Eintrag", aliases: ["Preise", "Erfolge"] },
    { title: "Weiterbildung", preset: "education", hint: "Kurse und Schulungen", aliases: ["Kurse", "Fortbildung"] },
    { title: "Veröffentlichungen", preset: "highlights", hint: "Eine einfache Liste", aliases: ["Publikationen", "Artikel"] },
    { title: "Kernkompetenzen", preset: "keySkills", hint: "Zeilen wie Frontend: React, CSS" },
    { title: "Highlights", preset: "highlights", hint: "Eine einfache Liste von Punkten" },
    { title: "Referenzen", preset: "text", hint: "Ein kurzer Absatz" },
    { title: "Über mich", preset: "text", hint: "Freier Text unter einer Überschrift", aliases: ["Absatz"] },
    { title: "Berufserfahrung", preset: "experience", hint: "Stationen, mit Zeitraum und Punkten", aliases: ["Erfahrung"] },
    { title: "Ausbildung", preset: "education", hint: "Abschlüsse und Kurse", aliases: ["Studium", "Bildung"] },
  ],
};

/** Headings for the summary. */
export const SUMMARY_HEADINGS: ByLocale<string[]> = {
  en: ["Profile", "Summary", "About me", "Professional summary"],
  es: ["Perfil", "Resumen", "Sobre mí", "Perfil profesional"],
  de: ["Profil", "Kurzprofil", "Über mich", "Zusammenfassung"],
};

/** Labels for the lines of a "by group" section and of an awards section. */
export const ROW_LABELS: ByLocale<{ keySkills: string[]; awards: string[] }> = {
  en: {
    keySkills: ["Languages", "Frontend", "Backend", "Databases", "Cloud", "DevOps", "Tools", "Testing", "Design", "Methods", "Soft skills", "Software"],
    awards: ["Certificate", "Award", "Talk", "Publication", "Scholarship", "Patent", "License", "Course", "Membership"],
  },
  es: {
    keySkills: ["Lenguajes", "Frontend", "Backend", "Bases de datos", "Nube", "DevOps", "Herramientas", "Pruebas", "Diseño", "Metodologías", "Habilidades blandas", "Software"],
    awards: ["Certificado", "Premio", "Charla", "Publicación", "Beca", "Patente", "Licencia", "Curso", "Membresía"],
  },
  de: {
    keySkills: ["Programmiersprachen", "Frontend", "Backend", "Datenbanken", "Cloud", "DevOps", "Werkzeuge", "Tests", "Design", "Methoden", "Soft Skills", "Software"],
    awards: ["Zertifikat", "Auszeichnung", "Vortrag", "Veröffentlichung", "Stipendium", "Patent", "Lizenz", "Kurs", "Mitgliedschaft"],
  },
};

/** The quiet word after a job or a degree, in gray: "(part-time)". */
export const NOTES: ByLocale<{ job: string[]; study: string[]; expected: (year: number) => string }> = {
  en: {
    job: ["(part-time)", "(full-time)", "(contract)", "(freelance)", "(internship)", "(remote)", "(temporary)", "(volunteer)"],
    study: ["(completed)", "(in progress)", "(incomplete)"],
    expected: year => `(expected ${year})`,
  },
  es: {
    job: ["(media jornada)", "(jornada completa)", "(contrato)", "(freelance)", "(prácticas)", "(remoto)", "(temporal)", "(voluntariado)"],
    study: ["(completado)", "(en curso)", "(incompleto)"],
    expected: year => `(previsto ${year})`,
  },
  de: {
    job: ["(Teilzeit)", "(Vollzeit)", "(befristet)", "(freiberuflich)", "(Praktikum)", "(remote)", "(Werkstudent)", "(ehrenamtlich)"],
    study: ["(abgeschlossen)", "(laufend)", "(abgebrochen)"],
    expected: year => `(voraussichtlich ${year})`,
  },
};

/* ------------------------------------------------------------ email domains */

export const EMAIL_DOMAINS: ByLocale<string[]> = {
  en: ["gmail.com", "outlook.com", "yahoo.com", "icloud.com", "hotmail.com", "proton.me", "live.com", "aol.com"],
  es: ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com", "outlook.es", "yahoo.es", "hotmail.es", "proton.me"],
  de: ["gmail.com", "web.de", "gmx.de", "outlook.de", "t-online.de", "yahoo.de", "icloud.com", "gmx.net", "proton.me"],
};

/* -------------------------------------------------------------- link sites */

export interface Site {
  name: string;
  /** What the address starts with, for the person to finish. */
  prefix: string;
  aliases: string[];
}

export const SITES: Site[] = [
  { name: "LinkedIn", prefix: "linkedin.com/in/", aliases: ["in", "linked"] },
  { name: "GitHub", prefix: "github.com/", aliases: ["git"] },
  { name: "Portfolio", prefix: "https://", aliases: ["website", "web", "site", "personal site", "blog"] },
  { name: "GitLab", prefix: "gitlab.com/", aliases: [] },
  { name: "X", prefix: "x.com/", aliases: ["twitter"] },
  { name: "Behance", prefix: "behance.net/", aliases: [] },
  { name: "Dribbble", prefix: "dribbble.com/", aliases: [] },
  { name: "Medium", prefix: "medium.com/@", aliases: [] },
  { name: "YouTube", prefix: "youtube.com/@", aliases: ["yt"] },
  { name: "Instagram", prefix: "instagram.com/", aliases: ["ig", "insta"] },
  { name: "Stack Overflow", prefix: "stackoverflow.com/users/", aliases: ["so"] },
  { name: "Kaggle", prefix: "kaggle.com/", aliases: [] },
  { name: "Xing", prefix: "xing.com/profile/", aliases: [] },
  { name: "ORCID", prefix: "orcid.org/", aliases: [] },
  { name: "Google Scholar", prefix: "scholar.google.com/citations?user=", aliases: ["scholar"] },
  { name: "ResearchGate", prefix: "researchgate.net/profile/", aliases: [] },
  { name: "Bluesky", prefix: "bsky.app/profile/", aliases: ["bsky"] },
  { name: "Substack", prefix: "https://", aliases: [] },
  { name: "CodePen", prefix: "codepen.io/", aliases: [] },
  { name: "Figma", prefix: "figma.com/@", aliases: [] },
  { name: "Calendly", prefix: "calendly.com/", aliases: [] },
];

/* --------------------------------------------- for a title nothing matches */

export const GENERIC: { skills: ByLocale<string[]>; bullets: ByLocale<string[]> } = {
  skills: {
    en: ["Teamwork", "Communication", "Time Management", "Problem Solving", "Customer Service", "Attention to Detail", "Adaptability", "Organization", "Microsoft Office", "Leadership", "Multitasking", "Reliability"],
    es: ["Trabajo en equipo", "Comunicación", "Gestión del tiempo", "Resolución de problemas", "Atención al cliente", "Atención al detalle", "Adaptabilidad", "Organización", "Microsoft Office", "Liderazgo", "Multitarea", "Responsabilidad"],
    de: ["Teamfähigkeit", "Kommunikation", "Zeitmanagement", "Problemlösung", "Kundenservice", "Sorgfalt", "Anpassungsfähigkeit", "Organisationstalent", "Microsoft Office", "Führungskompetenz", "Multitasking", "Zuverlässigkeit"],
  },
  bullets: {
    en: [
      "Worked with colleagues across the team to meet daily goals.",
      "Handled day-to-day tasks and kept records up to date.",
      "Helped customers and answered their questions.",
      "Trained and supported new team members.",
      "Followed safety and quality procedures.",
      "Planned and organized my own work to meet deadlines.",
      "Reported to the manager and shared updates with the team.",
      "Solved problems as they came up and suggested improvements.",
      "Looked after tools, materials and equipment.",
    ],
    es: [
      "Colaboré con mis compañeros para cumplir los objetivos diarios.",
      "Realicé las tareas del día a día y mantuve los registros al día.",
      "Atendí a clientes y respondí a sus consultas.",
      "Formé y apoyé a nuevos miembros del equipo.",
      "Seguí los procedimientos de seguridad y calidad.",
      "Planifiqué y organicé mi trabajo para cumplir los plazos.",
      "Informé a mi responsable y compartí novedades con el equipo.",
      "Resolví problemas a medida que surgían y propuse mejoras.",
      "Cuidé las herramientas, los materiales y los equipos.",
    ],
    de: [
      "Arbeitete mit Kollegen im Team, um die Tagesziele zu erreichen.",
      "Erledigte die täglichen Aufgaben und hielt Unterlagen aktuell.",
      "Betreute Kunden und beantwortete ihre Fragen.",
      "Schulte und unterstützte neue Teammitglieder.",
      "Hielt Sicherheits- und Qualitätsvorgaben ein.",
      "Plante und organisierte die eigene Arbeit, um Fristen einzuhalten.",
      "Berichtete an die Führungskraft und gab Neuigkeiten ans Team weiter.",
      "Löste Probleme, sobald sie auftraten, und schlug Verbesserungen vor.",
      "Kümmerte sich um Werkzeuge, Material und Geräte.",
    ],
  },
};
