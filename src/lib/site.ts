/* The links the editor shows about itself. An environment variable can
   replace each address; Next.js writes it into the JavaScript at build time,
   so a change needs a new deploy. An address that is not https hides its
   link. */

export const DONATE_URL = https(process.env.NEXT_PUBLIC_DONATE_URL || "https://paypal.me/santiagopaz1992");

export const AUTHOR = {
  name: "Santiago Paz",
  url: https(process.env.NEXT_PUBLIC_AUTHOR_URL),
};

function https(value: string | undefined): string {
  const url = value?.trim() ?? "";
  return /^https:\/\/[^\s"'<>]+$/i.test(url) ? url : "";
}
