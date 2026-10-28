// React and Next.js
import type { MetadataRoute } from "next";

// Shared modules
import { getAbout, getProjects } from "@/lib/sanity";
import { buildSitemapEntries } from "@/lib/seo/buildSitemapEntries";
import { SITE_URL } from "@/lib/seo/siteUrl";

/**
 * Generates `sitemap.xml` from the published Projects.
 *
 * @returns The homepage and each indexable Work page.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [about, projects] = await Promise.all([getAbout(), getProjects()]);

  return buildSitemapEntries(projects, {
    siteUrl: SITE_URL,
    homepageLastModified: about?._updatedAt ?? new Date().toISOString(),
  });
}
