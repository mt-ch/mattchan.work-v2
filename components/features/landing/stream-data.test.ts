// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { toStreamTiles } from "./stream-data";

const cover = {
  asset: { _ref: "image-abc123-2000x3000-jpg", _type: "reference" },
  metadata: { lqip: "data:image/jpeg;base64,x" },
};

describe("toStreamTiles", () => {
  it("makes a 16:9 tile linked by slug, whatever the cover's shape", () => {
    const [tile] = toStreamTiles([
      { title: "Pertemps", slug: { current: "pertemps" }, coverImage: cover },
    ]);
    expect(tile.slug).toBe("pertemps");
    expect(tile.width / tile.height).toBeCloseTo(16 / 9);
    expect(tile.src).toContain("w=1600");
    expect(tile.src).toContain("h=900");
  });

  it("skips Projects without a cover image or slug", () => {
    expect(
      toStreamTiles([
        { title: "A", slug: { current: "a" }, coverImage: null },
        { title: "B", slug: null, coverImage: cover },
      ]),
    ).toEqual([]);
  });

  it("carries the cover video url when present", () => {
    const [withVideo, without] = toStreamTiles([
      {
        title: "A",
        slug: { current: "a" },
        coverImage: cover,
        coverVideoUrl: "https://cdn.sanity.io/files/p/d/abc.mp4",
      },
      { title: "B", slug: { current: "b" }, coverImage: cover },
    ]);
    expect(withVideo.videoSrc).toBe("https://cdn.sanity.io/files/p/d/abc.mp4");
    expect(without.videoSrc).toBeUndefined();
  });
});

describe("toStreamTiles discipline", () => {
  it("carries disciplines, defaulting to none", () => {
    const base = { title: "A", slug: { current: "a" }, coverImage: cover };
    const [withDiscipline, without] = toStreamTiles([
      { ...base, discipline: ["Design", "AI"] },
      base,
    ]);
    expect(withDiscipline.discipline).toEqual(["Design", "AI"]);
    expect(without.discipline).toEqual([]);
  });
});
