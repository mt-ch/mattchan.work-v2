import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo/siteUrl";

// Allows every crawler everywhere; per-page opt-outs are emitted as noindex
// robots metadata from each route.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
