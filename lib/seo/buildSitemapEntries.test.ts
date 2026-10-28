// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { buildSitemapEntries } from "./buildSitemapEntries";

const defaults = {
  siteUrl: "https://example.com/",
  homepageLastModified: "2026-01-01T00:00:00Z",
};

describe("buildSitemapEntries", () => {
  it("lists the homepage first, then work pages in order", () => {
    const entries = buildSitemapEntries(
      [
        { slug: { current: "a" }, _updatedAt: "2026-02-01" },
        { slug: { current: "b" }, _updatedAt: "2026-03-01" },
      ],
      defaults,
    );
    expect(entries).toEqual([
      {
        url: "https://example.com/",
        lastModified: defaults.homepageLastModified,
      },
      { url: "https://example.com/work/a", lastModified: "2026-02-01" },
      { url: "https://example.com/work/b", lastModified: "2026-03-01" },
    ]);
  });

  it("omits noIndex projects and projects without a slug", () => {
    const entries = buildSitemapEntries(
      [
        {
          slug: { current: "hidden" },
          _updatedAt: "x",
          seo: { noIndex: true },
        },
        { slug: null, _updatedAt: "x" },
      ],
      defaults,
    );
    expect(entries).toHaveLength(1);
  });
});
