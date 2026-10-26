import type { MetadataRoute } from "next";

import { getAbout, getProjects } from "@/lib/sanity";
import { buildSitemapEntries } from "@/lib/seo/buildSitemapEntries";
import { SITE_URL } from "@/lib/seo/siteUrl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [about, projects] = await Promise.all([getAbout(), getProjects()]);

  return buildSitemapEntries(projects, {
    siteUrl: SITE_URL,
    homepageLastModified: about?._updatedAt ?? new Date().toISOString(),
  });
}
