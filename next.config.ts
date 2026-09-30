import type { NextConfig } from "next";

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
};

export default nextConfig;
