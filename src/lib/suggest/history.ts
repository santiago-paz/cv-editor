import type { Cv } from "@/lib/cv/types";
import { buildIndex, type Index } from "./rank";
import { fold } from "./text";

/* What the person wrote in their other CVs, offered first when they type the
   same kind of thing again: a second CV for another job reuses the titles,
   employers, schools and skills of the first.

   The open CV is left out on purpose. Its own half-typed words would come back
   as suggestions for themselves. The sample is left out too, because its
   people and companies are made up. */

export interface History {
  titles: Index;
  companies: Index;
  schools: Index;
  degrees: Index;
  skills: Index;
  cities: Index;
  languages: Index;
  hobbies: Index;
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const text = value.trim();
    const key = fold(text);
    if (text && !seen.has(key)) {
      seen.add(key);
      out.push(text);
    }
  }
  return out;
}

/* Built again only when another CV changes, not on every keystroke in the
   open one. */
let last: { key: string; history: History } | null = null;

export function historyOf(cvs: Cv[], exceptId: string | null): History {
  const others = cvs.filter(cv => cv.id !== exceptId && !cv.sample).sort((a, b) => b.updatedAt - a.updatedAt);
  const key = others.map(cv => `${cv.id}:${cv.updatedAt}`).join("|");
  if (last?.key === key) return last.history;

  const titles: string[] = [];
  const companies: string[] = [];
  const schools: string[] = [];
  const degrees: string[] = [];
  const skills: string[] = [];
  const cities: string[] = [];
  const languages: string[] = [];
  const hobbies: string[] = [];

  for (const cv of others) {
    titles.push(cv.person.role);
    cities.push(cv.person.location);
    skills.push(...cv.skills.map(item => item.text));
    languages.push(...cv.languages.map(item => item.name));
    hobbies.push(...cv.hobbies.split(","));
    for (const section of cv.sections) {
      if (section.kind !== "roles") continue;
      const study = section.preset === "education";
      for (const item of section.items) {
        (study ? degrees : titles).push(item.title);
        (study ? schools : companies).push(item.org);
      }
    }
  }

  const index = (list: string[]) => buildIndex(unique(list), { pop: false });
  const history: History = {
    titles: index(titles),
    companies: index(companies),
    schools: index(schools),
    degrees: index(degrees),
    skills: index(skills),
    cities: index(cities),
    languages: index(languages),
    hobbies: index(hobbies),
  };
  last = { key, history };
  return history;
}
