/* Types a whole CV into the editor with real key presses in Chrome, and times
   it. Two runs: one that takes the suggested bullets, and one that types every
   bullet. The typist writes seven characters a second, with a short beat at
   every Enter.

     npm run dev          (in another terminal)
     npm run speedrun

   URL points at the editor (default http://localhost:3000). CHROME_PATH points
   at Chrome when it is not in a usual place. `--fast` types with no delay, for
   a quick check that the whole flow still works. */

import { existsSync } from "node:fs";
import puppeteer from "puppeteer-core";

const URL = process.env.URL ?? "http://localhost:3000";
const FAST = process.argv.includes("--fast");
const CHAR_DELAY = FAST ? 0 : 140;
const ENTER_BEAT = FAST ? 40 : 260;

const CHROME = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
].find(path => path && existsSync(path));
if (!CHROME) {
  console.error("Chrome not found. Set CHROME_PATH.");
  process.exit(1);
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
  defaultViewport: { width: 1440, height: 900 },
});

async function run(pick) {
  const page = await browser.newPage();
  const problems = [];
  page.on("pageerror", error => problems.push(error.message));
  await page.goto(URL, { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: "networkidle0" });
  await page.waitForSelector('[data-field="person.name"]');
  await page.click('[data-field="person.name"]');

  let keys = 0;
  const type = async text => {
    await page.keyboard.type(text, { delay: CHAR_DELAY });
    keys += text.length;
  };
  const press = async (key, beat = ENTER_BEAT) => {
    await page.keyboard.press(key);
    keys++;
    await sleep(beat);
  };
  const enter = () => press("Enter");
  const down = () => press("ArrowDown", ENTER_BEAT / 2);
  const nextStep = async () => {
    await page.keyboard.down("Meta");
    await page.keyboard.press("Enter");
    await page.keyboard.up("Meta");
    keys++;
    await sleep(ENTER_BEAT);
  };
  const bullet = async text => {
    if (pick) await down();
    else await type(text);
    await enter();
  };

  const started = Date.now();

  // About you
  await type("Mia Torres"); await enter();
  await type("sen fr"); await enter();
  await type("ber"); await enter();
  await type("mia.torres"); await enter();
  await type("+49 30 1234 5678"); await enter();
  await type("lin"); await enter();
  await type("mia-torres"); await enter();
  await enter();

  // Experience: two jobs
  await type("sen fr"); await enter();
  await type("goo"); await enter();
  await type("3/22 -"); await enter();
  await bullet("Built the design system used by five teams");
  await bullet("Led the checkout rebuild");
  await enter(); // an empty bullet leaves the list
  await enter(); // "Add another job"
  await type("web dev"); await enter();
  await type("Tidewater Studio"); await enter();
  await type("6/16 12/18"); await enter();
  await bullet("Built campaign sites for retail clients");
  await enter();
  await nextStep();

  // Education
  await type("bsc comp"); await enter();
  await type("valen"); await enter();
  await type("2012 2016"); await enter();
  await nextStep();

  // Skills
  for (const skill of ["ts", "rea", "next", "node", "css", "figma", "git", "a11y"]) {
    await type(skill);
    await enter();
  }
  await enter();

  // Languages and interests
  for (const [name, level] of [["spa", "nat"], ["eng", "flu"], ["ger", "int"]]) {
    await type(name); await enter();
    await type(level); await enter();
  }
  await enter();
  await type("clim"); await enter();
  await type("photo"); await enter();
  await enter();

  // Summary: the first draft
  await enter();
  await down();
  await enter();
  const seconds = (Date.now() - started) / 1000;

  await sleep(500);
  const cv = await page.evaluate(() => JSON.parse(localStorage.getItem("cv-editor.v1.cvs")).cvs[0]);
  const pdf = page.waitForResponse(response => response.url().includes("/api/pdf"), { timeout: 60000 }).catch(() => null);
  await page.keyboard.press("Enter"); // the focused Download button
  const response = await pdf;
  await page.close();

  const jobs = cv.sections[0].items;
  const filled =
    cv.person.name === "Mia Torres" &&
    cv.person.role === "Senior Frontend Developer" &&
    jobs.length === 2 &&
    jobs.every(job => job.bullets.some(item => item.html)) &&
    cv.sections[1].items.length === 1 &&
    cv.skills.filter(item => item.text).length === 8 &&
    cv.languages.length === 3 &&
    !!cv.summary;
  return { seconds, keys, filled, pdf: response ? response.status() : "no response", problems };
}

let failed = false;
for (const pick of [true, false]) {
  const result = await run(pick);
  const label = pick ? "taking the suggested bullets" : "typing every bullet";
  console.log(
    `${label}: ${result.seconds.toFixed(1)} s, ${result.keys} key presses, ` +
      `CV filled in: ${result.filled ? "yes" : "NO"}, PDF: ${result.pdf}` +
      `${FAST ? " (no typing delay)" : ""}`,
  );
  if (!result.filled || result.pdf !== 200 || result.problems.length) {
    failed = true;
    for (const problem of result.problems) console.error("  page error:", problem);
  }
}
// A download still in flight can keep Chrome from closing, so give it a moment and stop it.
await Promise.race([browser.close().catch(() => undefined), sleep(3000)]);
browser.process()?.kill("SIGKILL");
process.exit(failed ? 1 : 0);
