// React and Next.js
import type { Metadata } from "next";

// Local modules
import type { ResolvedSeo } from "./resolveSeo";

// Maps a ResolvedSeo to Next Metadata. `path` is the canonical path relative to
// metadataBase, e.g. "/" or "/work/pertemps".
export function buildMetadata(seo: ResolvedSeo, path: string): Metadata {
  const images = seo.ogImage
    ? [{ url: seo.ogImage, width: 1200, height: 630, alt: seo.ogImageAlt }]
    : undefined;

  return {
    title: seo.title,
    description: seo.description || undefined,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: seo.title,
      description: seo.description || undefined,
      url: path,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: seo.title,
      description: seo.description || undefined,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
    robots: seo.noIndex ? { index: false, follow: true } : undefined,
  };
}
