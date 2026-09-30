import { DEFAULT_ACCENT, bullet, language, link, project, role, row, skill, uid } from "./defaults";
import type { Cv } from "./types";

/* The CV a first visit opens: a made-up person, so every part of the editor
   has something in it. The companies are invented and every address is on
   example.com, which is reserved for examples. */
export function sampleCv(): Cv {
  const now = Date.now();
  return {
    id: uid(),
    title: "Sample CV",
    createdAt: now,
    updatedAt: now,
    sample: true,
    template: "sidebar",
    locale: "en",
    accent: DEFAULT_ACCENT,
    showPhoto: true,
    person: {
      name: "Alex Moreno",
      role: "Senior Frontend Engineer",
      location: "Berlin, Germany",
      email: "alex.moreno@example.com",
      phone: "+49 30 1234 5678",
    },
    links: [
      link("alexmoreno.example.com", "https://alexmoreno.example.com"),
      link("github.example.com/alexmoreno", "https://github.example.com/alexmoreno"),
    ],
    summaryTitle: "Profile",
    summary:
      "Frontend engineer with <strong>9 years</strong> of building web products in " +
      "<strong>TypeScript and React</strong>. I work on fast pages, accessible forms and " +
      "design systems that other teams can pick up. Most recently I led the checkout " +
      "rebuild at Northwind Commerce, which halved its load time.",
    skills: [
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "GraphQL",
      "CSS and Tailwind",
      "Design Systems",
      "Accessibility (WCAG 2.2)",
      "Testing with Playwright",
    ].map(text => skill(text)),
    languages: [
      language("Spanish", "Native", 100),
      language("English", "Fluent", 88),
      language("German", "Intermediate", 50),
    ],
    hobbies: "Bouldering, film photography",
    sections: [
      {
        id: uid(),
        kind: "roles",
        preset: "experience",
        title: "Experience",
        items: [
          role({
            title: "Senior Frontend Engineer",
            org: "Northwind Commerce",
            url: "https://northwind.example.com",
            dates: "Mar 2022 - Present",
            bullets: [
              bullet(
                "Led the rebuild of the checkout in Next.js for 14 markets. Median load time " +
                  "fell from 3.1 s to 1.4 s, and completed orders rose by 6%.",
              ),
              bullet(
                "Built the design system: 60 React components with docs and visual tests, " +
                  "now used by five product teams.",
              ),
              bullet("Moved the web apps from a hand-rolled webpack setup to Turborepo, cutting CI time by half."),
              bullet("Mentor three engineers and run the monthly frontend review."),
            ],
          }),
          role({
            title: "Frontend Engineer",
            org: "Kestrel Health",
            url: "https://kestrel.example.com",
            dates: "Jan 2019 - Feb 2022",
            bullets: [
              bullet("Built the appointment booking flow in React and TypeScript, used by 400,000 patients a month."),
              bullet(
                "Brought the web app to <strong>WCAG 2.1 AA</strong> and kept it there with " +
                  "automated checks on every pull request.",
              ),
              bullet("Wrote the GraphQL layer between the booking flow and three clinic systems."),
            ],
          }),
          role({
            title: "Web Developer",
            org: "Tidewater Studio",
            url: "https://tidewater.example.com",
            dates: "Jun 2016 - Dec 2018",
            bullets: [
              bullet(
                "Built marketing sites and campaign pages for retail and travel clients, " +
                  "from design handoff to launch.",
              ),
            ],
          }),
        ],
      },
      {
        id: uid(),
        kind: "projects",
        preset: "projects",
        title: "Projects",
        items: [
          project({
            name: "Tempo",
            links: [link("tempo.example.com", "https://tempo.example.com")],
            bullets: [
              bullet(
                "A habit tracker that works offline, built with Next.js, IndexedDB and a " +
                  "service worker. About 3,000 people use it each week.",
              ),
            ],
          }),
        ],
      },
      {
        id: uid(),
        kind: "roles",
        preset: "education",
        title: "Education",
        items: [
          role({
            title: "B.Sc. Computer Science",
            org: "University of Valencia",
            dates: "2012 - 2016",
            bullets: [],
          }),
        ],
      },
      {
        id: uid(),
        kind: "rows",
        preset: "awards",
        title: "Awards",
        rows: [
          row("Certificate", "AWS Certified Developer - Associate, 2023"),
          row("Talk", "Design systems for small teams, Berlin Frontend Meetup, 2024"),
        ],
      },
    ],
  };
}
