import { describe, expect, it } from "vitest";
import { dateSuggestions } from "@/lib/suggest/dates";
import { buildIndex, firstOf, search, searchMany, STRONG } from "@/lib/suggest/rank";
import { expandGender, fold, splitEntry, tokens } from "@/lib/suggest/text";

const texts = (list: { text: string }[]) => list.map(hit => hit.text);

describe("fold and tokens", () => {
  it("drops case and accents and keeps the length", () => {
    expect(fold("München")).toBe("munchen");
    expect(fold("Ingeniería")).toBe("ingenieria");
    expect(fold("Straße")).toBe("strase");
    expect(fold("Ñandú").length).toBe("Ñandú".length);
  });

  it("joins dotted words and keeps symbols that name a skill", () => {
    expect(tokens("B.Sc. Computer Science").map(tok => tok.n)).toEqual(["bsc", "computer", "science"]);
    expect(tokens("Node.js").map(tok => tok.n)).toEqual(["nodejs"]);
    expect(tokens("C++ / C#").map(tok => tok.n)).toEqual(["c++", "c#"]);
    expect(tokens("Bachelor's in").map(tok => tok.n)).toEqual(["bachelors", "in"]);
  });

  it("splits an entry on bars outside gender marks", () => {
    expect(splitEntry("TypeScript|TS")).toEqual(["TypeScript", "TS"]);
    expect(splitEntry("Conductor[|a]|Chofer")).toEqual(["Conductor[|a]", "Chofer"]);
  });

  it("writes both forms of a gender mark", () => {
    expect(expandGender("Enfermer[o|a] Jef[e|a]")).toEqual(["Enfermero Jefe", "Enfermera Jefa"]);
    expect(expandGender("Desarrollador[|a] Frontend")).toEqual(["Desarrollador Frontend", "Desarrolladora Frontend"]);
    expect(expandGender("Analista")).toEqual(["Analista"]);
  });
});

describe("search", () => {
  const titles = buildIndex([
    "Software Engineer",
    "Senior Frontend Engineer",
    "Frontend Developer",
    "Sales Manager",
    "Registered Nurse|RN",
    "Project Manager|PM",
    "Product Manager",
  ]);

  it("takes the start of each word, in order", () => {
    expect(texts(search(titles, "sen fr"))[0]).toBe("Senior Frontend Engineer");
    expect(texts(search(titles, "front"))).toEqual(["Frontend Developer", "Senior Frontend Engineer"]);
  });

  it("finds a title from its initials", () => {
    const hits = search(titles, "sfe");
    expect(hits[0].text).toBe("Senior Frontend Engineer");
    expect(hits[0].strong).toBe(true);
    expect(search(titles, "rn")[0].text).toBe("Registered Nurse");
  });

  it("finds an entry from an alias but writes the real name", () => {
    const hits = search(titles, "pm");
    expect(hits[0].text).toBe("Project Manager");
    expect(hits[0].ranges).toEqual([]);
  });

  it("puts an exact match first", () => {
    expect(search(titles, "sales manager")[0].text).toBe("Sales Manager");
  });

  it("does not care about accents or case", () => {
    const places = buildIndex(["München, Germany", "Zürich, Switzerland"]);
    expect(texts(search(places, "MUNCH"))).toEqual(["München, Germany"]);
    expect(texts(search(places, "zurich"))).toEqual(["Zürich, Switzerland"]);
  });

  it("marks where the typed letters fall", () => {
    const [hit] = search(titles, "sen fr");
    expect(hit.ranges).toEqual([
      [0, 3],
      [7, 9],
    ]);
  });

  it("finds words in any order, and letters inside a word, more weakly", () => {
    const skills = buildIndex(["TypeScript|TS", "JavaScript|JS", "Script Writing"]);
    const hits = search(skills, "script");
    expect(hits[0].text).toBe("Script Writing");
    expect(texts(hits)).toContain("TypeScript");
    expect(hits.find(hit => hit.text === "TypeScript")!.strong).toBe(false);
    expect(search(titles, "manager sales")[0].text).toBe("Sales Manager");
  });

  it("finds nothing for what is not there", () => {
    expect(search(titles, "zzz")).toEqual([]);
    expect(search(titles, "")).toEqual([]);
    expect(search(titles, "  ")).toEqual([]);
  });

  it("leaves out what the caller skips and boosts what it likes", () => {
    expect(texts(search(titles, "manager", { skip: text => text === "Sales Manager" }))).not.toContain("Sales Manager");
    const boosted = search(titles, "manager", { bonus: text => (text === "Product Manager" ? 30 : 0) });
    expect(boosted[0].text).toBe("Product Manager");
  });

  it("ranks the earlier entry first when matches tie", () => {
    const list = buildIndex(["Alpha Tester", "Alpha Builder"]);
    expect(texts(search(list, "alpha"))).toEqual(["Alpha Tester", "Alpha Builder"]);
  });

  it("limits the list", () => {
    const many = buildIndex(Array.from({ length: 30 }, (_, at) => `Item ${at}`));
    expect(search(many, "item", { limit: 5 })).toHaveLength(5);
    expect(search(many, "item")).toHaveLength(8);
  });

  it("calls a tight match strong and a loose one not", () => {
    expect(search(titles, "front")[0].score).toBeGreaterThan(STRONG);
    expect(search(buildIndex(["TypeScript"]), "script")[0].strong).toBe(false);
  });

  it("merges lists, shows a repeated text once and lets the lead decide", () => {
    const recent = buildIndex(["Product Manager", "Platform Engineer"], { pop: false });
    const builtIn = buildIndex(["Product Manager", "Product Designer"]);
    const hits = searchMany(
      [
        { index: builtIn },
        { index: recent, lead: 10 },
      ],
      "prod",
    );
    expect(texts(hits).filter(text => text === "Product Manager")).toHaveLength(1);
    expect(hits[0].text).toBe("Product Manager");
  });

  it("offers the first few entries on their own", () => {
    expect(texts(firstOf(titles, 2))).toEqual(["Software Engineer", "Senior Frontend Engineer"]);
    expect(texts(firstOf(titles, 2, text => text === "Software Engineer"))).toEqual([
      "Senior Frontend Engineer",
      "Frontend Developer",
    ]);
  });
});

describe("dates", () => {
  const now = new Date(2026, 8, 30);
  const en = (text: string) => dateSuggestions(text, "en", now);

  it("reads a month and a year written quickly", () => {
    expect(en("mar 2022")).toEqual(["Mar 2022", "Mar 2022 - Present"]);
    expect(en("mar22")).toEqual(["Mar 2022", "Mar 2022 - Present"]);
    expect(en("March 2022")).toEqual(["Mar 2022", "Mar 2022 - Present"]);
    expect(en("3/22")).toEqual(["Mar 2022", "Mar 2022 - Present"]);
    expect(en("03.2022")).toEqual(["Mar 2022", "Mar 2022 - Present"]);
    expect(en("3 22")).toEqual(["Mar 2022", "Mar 2022 - Present"]);
  });

  it("takes a dash with nothing after it as 'until today'", () => {
    expect(en("mar 2022 -")).toEqual(["Mar 2022 - Present"]);
    expect(en("mar22-")).toEqual(["Mar 2022 - Present"]);
    expect(en("2019 -")).toEqual(["2019 - Present"]);
  });

  it("reads a range", () => {
    expect(en("mar 2022 - dec 2023")).toEqual(["Mar 2022 - Dec 2023"]);
    expect(en("3/2022 - 5/2023")).toEqual(["Mar 2022 - May 2023"]);
    expect(en("jun 2016-dic 2018")).toEqual(["Jun 2016 - Dec 2018"]);
    expect(en("2012 to 2016")).toEqual(["2012 - 2016"]);
    expect(en("2019–2022")).toEqual(["2019 - 2022"]);
  });

  it("reads years typed one after the other", () => {
    expect(en("2012 2016")).toEqual(["2012 - 2016"]);
    expect(en("mar 2022 dec 2023")).toEqual(["Mar 2022 - Dec 2023"]);
    expect(en("6/16 12/18")).toEqual(["Jun 2016 - Dec 2018"]);
    expect(en("mar22 dec23")).toEqual(["Mar 2022 - Dec 2023"]);
  });

  it("reads two-digit years inside a range", () => {
    expect(en("19-22")).toEqual(["2019 - 2022"]);
    expect(en("2019 - 22")).toEqual(["2019 - 2022"]);
    expect(en("95-99")).toEqual(["1995 - 1999"]);
  });

  it("reads a year alone only when it has four digits", () => {
    expect(en("2012")).toEqual(["2012", "2012 - Present"]);
    expect(en("20")).toEqual([]);
    expect(en("202")).toEqual([]);
  });

  it("reads the word for today in three languages", () => {
    expect(en("jan 2020 - now")).toEqual(["Jan 2020 - Present"]);
    expect(en("jan 2020 - pres")).toEqual(["Jan 2020 - Present"]);
    expect(en("jan 2020 - hoy")).toEqual(["Jan 2020 - Present"]);
    expect(en("jan 2020 - heute")).toEqual(["Jan 2020 - Present"]);
    expect(en("jan 2020 - current")).toEqual(["Jan 2020 - Present"]);
  });

  it("reads month names in three languages and writes them in the CV's own", () => {
    expect(dateSuggestions("ene 2020 - hoy", "es", now)).toEqual(["Ene 2020 - Actualidad"]);
    expect(dateSuggestions("marzo 2021 - diciembre 2022", "es", now)).toEqual(["Mar 2021 - Dic 2022"]);
    expect(dateSuggestions("mär 2021 - heute", "de", now)).toEqual(["Mär 2021 - Heute"]);
    expect(dateSuggestions("mai 2021 - okt 2022", "de", now)).toEqual(["Mai 2021 - Okt 2022"]);
    expect(dateSuggestions("ene 2020", "en", now)[0]).toBe("Jan 2020");
    expect(dateSuggestions("jan 2020 - aug 2021", "es", now)).toEqual(["Ene 2020 - Ago 2021"]);
  });

  it("leaves what is not a date alone", () => {
    expect(en("")).toEqual([]);
    expect(en("   ")).toEqual([]);
    expect(en("summer 2019")).toEqual([]);
    expect(en("mar")).toEqual([]);
    expect(en("13/2022")).toEqual([]);
    expect(en("0/22")).toEqual([]);
    expect(en("1800")).toEqual([]);
    expect(en("2099")).toEqual([]);
    expect(en("mar 2022 - soon")).toEqual([]);
    expect(en("a - b - c")).toEqual([]);
  });

  it("does not reorder dates that are backwards", () => {
    expect(en("dec 2023 - mar 2022")).toEqual(["Dec 2023 - Mar 2022"]);
  });

  it("lets a future graduation year through", () => {
    expect(en("2028")).toEqual(["2028", "2028 - Present"]);
    expect(en("2024 - 2028")).toEqual(["2024 - 2028"]);
  });
});
