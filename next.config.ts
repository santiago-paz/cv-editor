import type { NextConfig } from "next";

const dev = process.env.NODE_ENV === "development";

/* What a page may load, and from where. Everything is the site's own: the
   fonts, the scripts and the API. Next writes small inline scripts into each
   page, and a nonce would make every page render on request, so inline scripts
   and styles stay allowed. The rest still blocks other hosts, plugins, a
   changed <base> and any site that tries to frame the editor. Sign-in leaves
   by navigation, which a CSP does not limit.

   A new host, script or frame needs an entry here first. Dev mode adds what
   React's debugging and hot reload need. */
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${dev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  // The badge sits over the page gauges in the footer. Errors still show.
  devIndicators: false,
  // Both are on Next's own list already; named here so the dependency on
  // plain Node require() is visible where the config is read.
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  outputFileTracingIncludes: {
    // The PDF route reads the fonts from disk, and on Vercel it unpacks
    // Chromium from these compressed files. Neither is imported, so the
    // tracer would leave them out of the function.
    "/api/pdf": ["./public/fonts/*.woff2", "./node_modules/@sparticuz/chromium/bin/**"],
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
