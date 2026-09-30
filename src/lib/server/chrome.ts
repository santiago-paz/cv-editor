import { existsSync } from "node:fs";
import puppeteer, { type Browser } from "puppeteer-core";

/* The PDF is printed by Chrome, as the preview is drawn by the browser: the
   same engine on both sides is what keeps the page breaks where the preview
   shows them.

   On Vercel and AWS Lambda it runs the Chromium from @sparticuz/chromium.
   Anywhere else it runs an installed Chrome, found at CHROME_PATH or in the
   usual places. One browser serves every request while the process lives. */

export class ChromeMissing extends Error {
  constructor() {
    super(
      "No Chrome to print with. Install Google Chrome, or set CHROME_PATH to a Chrome or Chromium binary.",
    );
    this.name = "ChromeMissing";
  }
}

const INSTALLED = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

const serverless = () =>
  !process.env.CHROME_PATH && Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

let pending: Promise<Browser> | null = null;

export async function getBrowser(): Promise<Browser> {
  if (pending) {
    const open = await pending.catch(() => null);
    if (open?.connected) return open;
  }
  pending = launch();
  pending.catch(() => {
    pending = null;
  });
  return pending;
}

async function launch(): Promise<Browser> {
  if (serverless()) {
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
      executablePath: await chromium.executablePath(),
      headless: "shell",
    });
  }

  const path = [process.env.CHROME_PATH, ...INSTALLED].find(
    (candidate): candidate is string => !!candidate && existsSync(candidate),
  );
  if (!path) throw new ChromeMissing();
  return puppeteer.launch({
    executablePath: path,
    headless: true,
    args: ["--no-first-run", "--no-default-browser-check", "--disable-extensions", "--disable-gpu"],
  });
}
