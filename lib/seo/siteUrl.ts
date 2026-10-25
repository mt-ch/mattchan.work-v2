// Absolute origin the site is served from, used for metadataBase, canonical
// URLs, the sitemap and robots.txt. Falls back to the local dev origin so
// metadata routes still render without the env var set.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");
