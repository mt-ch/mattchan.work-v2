// Third-party libraries
import { describe, expect, it, vi } from "vitest";
import type { Image } from "sanity";

vi.mock("@/lib/sanity/image", () => {
  /**
   * Fakes the image builder chain, ending in a URL derived from the asset ref.
   *
   * @param ref - The asset reference ID.
   * @returns A chainable builder whose `url()` returns a test CDN URL.
   */
  const chain = (ref: string) => {
    const api = {
      width: () => api,
      height: () => api,
      fit: () => api,
      url: () => `https://cdn.test/${ref}`,
    };
    return api;
  };
  return {
    urlFor: (img: { asset: { _ref: string } }) => chain(img.asset._ref),
  };
});

// Local modules
import { resolveSeo } from "./resolveSeo";

/**
 * Builds a minimal Sanity image pointing at the given asset.
 *
 * @param ref - The asset reference ID.
 * @returns An image with that asset.
 */
const img = (ref: string) =>
  ({ _type: "image", asset: { _type: "reference", _ref: ref } }) as Image;

describe("resolveSeo", () => {
  it("prefers page seo over document fields and site defaults", () => {
    const r = resolveSeo(
      {
        title: "Doc",
        summary: "Doc summary",
        coverImage: img("cover"),
        seo: {
          metaTitle: "Meta",
          metaDescription: "Meta desc",
          ogImage: img("og"),
          ogImageAlt: "Alt",
          noIndex: true,
        },
      },
      { siteName: "Site", defaultMetaDescription: "Site desc" },
    );
    expect(r).toEqual({
      title: "Meta",
      description: "Meta desc",
      ogImage: "https://cdn.test/og",
      ogImageAlt: "Alt",
      noIndex: true,
    });
  });

  it("falls back to document fields, then site defaults", () => {
    const doc = resolveSeo(
      { title: "Doc", summary: "Sum", coverImage: img("cover") },
      { siteName: "Site", defaultOgImage: img("def") },
    );
    expect(doc.title).toBe("Doc");
    expect(doc.description).toBe("Sum");
    expect(doc.ogImage).toBe("https://cdn.test/cover");
    expect(doc.ogImageAlt).toBe("Doc");

    const site = resolveSeo(
      {},
      {
        siteName: "Site",
        defaultMetaDescription: "Default",
        defaultOgImage: img("def"),
      },
    );
    expect(site.title).toBe("Site");
    expect(site.description).toBe("Default");
    expect(site.ogImage).toBe("https://cdn.test/def");
    expect(site.noIndex).toBe(false);
  });

  it("ignores blank strings and assetless images", () => {
    const r = resolveSeo(
      {
        title: "Doc",
        seo: {
          metaTitle: "   ",
          ogImage: { _type: "image" } as Image,
        },
        coverImage: img("cover"),
      },
      {},
    );
    expect(r.title).toBe("Doc");
    expect(r.ogImage).toBe("https://cdn.test/cover");
  });

  it("returns a null image when no tier has one", () => {
    expect(resolveSeo({}, {}).ogImage).toBeNull();
  });
});
