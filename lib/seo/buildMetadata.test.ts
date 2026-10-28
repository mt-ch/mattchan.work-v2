// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { buildMetadata } from "./buildMetadata";

const base = {
  title: "T",
  description: "D",
  ogImage: "https://cdn.test/og",
  ogImageAlt: "Alt",
  noIndex: false,
};

describe("buildMetadata", () => {
  it("sets canonical, OG and a large Twitter card", () => {
    const m = buildMetadata(base, "/work/x");
    expect(m.alternates?.canonical).toBe("/work/x");
    expect(m.openGraph?.images).toEqual([
      { url: base.ogImage, width: 1200, height: 630, alt: "Alt" },
    ]);
    expect(m.twitter).toMatchObject({ card: "summary_large_image" });
    expect(m.robots).toBeUndefined();
  });

  it("emits noindex and omits images when absent", () => {
    const m = buildMetadata({ ...base, ogImage: null, noIndex: true }, "/");
    expect(m.robots).toEqual({ index: false, follow: true });
    expect(m.openGraph?.images).toBeUndefined();
    expect(m.twitter).toMatchObject({ card: "summary" });
  });
});
