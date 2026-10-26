import type { Image } from "sanity";

import { urlFor } from "@/lib/sanity/image";

// Fixed Open Graph / Twitter card image size, requested with a hotspot-aware crop.
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export interface SeoObject {
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: Image | null;
  ogImageAlt?: string | null;
  noIndex?: boolean | null;
}

// Minimal document shape read by resolveSeo. A project and the About singleton
// both satisfy it; absent fields fall through to the site defaults.
export interface SeoDocument {
  title?: string | null;
  summary?: string | null;
  coverImage?: Image | null;
  seo?: SeoObject | null;
}

export interface SiteSeoDefaults {
  siteName?: string | null;
  defaultMetaDescription?: string | null;
  defaultOgImage?: Image | null;
}

export interface ResolvedSeo {
  title: string;
  description: string;
  ogImage: string | null;
  ogImageAlt: string;
  noIndex: boolean;
}

// Sanity leaves an assetless `{ _type: "image", crop, hotspot }` behind when an
// editor clears an image; it is truthy but must not stop the fallback chain.
function hasAsset(source: Image | null | undefined): source is Image {
  return Boolean(source && (source as { asset?: unknown }).asset);
}

function firstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

// Three-tier fallback: page seo -> document fields -> site defaults. The title
// template is applied by Next Metadata, not here.
export function resolveSeo(
  doc: SeoDocument,
  siteDefaults: SiteSeoDefaults,
): ResolvedSeo {
  const seo = doc.seo ?? {};

  const title = firstNonEmpty(seo.metaTitle, doc.title, siteDefaults.siteName);
  const description = firstNonEmpty(
    seo.metaDescription,
    doc.summary,
    siteDefaults.defaultMetaDescription,
  );

  const imageSource = [
    seo.ogImage,
    doc.coverImage,
    siteDefaults.defaultOgImage,
  ].find(hasAsset);

  const ogImage = imageSource
    ? urlFor(imageSource)
        .width(OG_IMAGE_WIDTH)
        .height(OG_IMAGE_HEIGHT)
        .fit("crop")
        .url()
    : null;

  return {
    title,
    description,
    ogImage,
    ogImageAlt: firstNonEmpty(seo.ogImageAlt) || title,
    noIndex: seo.noIndex ?? false,
  };
}
