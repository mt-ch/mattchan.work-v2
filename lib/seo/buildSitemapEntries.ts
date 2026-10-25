import type { MetadataRoute } from "next";

export interface SitemapProject {
  slug?: { current?: string } | null;
  _updatedAt: string;
  seo?: { noIndex?: boolean | null } | null;
}

export interface SitemapSiteDefaults {
  siteUrl: string;
  // The homepage has no document of its own, so it inherits the About
  // singleton's `_updatedAt`.
  homepageLastModified: string;
}

// Homepage first, then Work pages in the order passed. Projects marked noIndex
// are omitted so crawlers never discover them through the sitemap.
export function buildSitemapEntries(
  projects: SitemapProject[],
  siteDefaults: SitemapSiteDefaults,
): MetadataRoute.Sitemap {
  const base = siteDefaults.siteUrl.replace(/\/+$/, "");

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: siteDefaults.homepageLastModified },
  ];

  for (const project of projects) {
    if (project.seo?.noIndex || !project.slug?.current) continue;
    entries.push({
      url: `${base}/work/${project.slug.current}`,
      lastModified: project._updatedAt,
    });
  }

  return entries;
}
