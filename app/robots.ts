// React and Next.js
import type { MetadataRoute } from "next";

// Shared modules
import { SITE_URL } from "@/lib/seo/siteUrl";

/**
 * Generates `robots.txt`. Allows every crawler everywhere; per-page opt-outs
 * are emitted as noindex robots metadata from each route.
 *
 * @returns The robots rules, sitemap location and host.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
