// Third-party libraries
import { describe, expect, it } from "vitest";

// Shared modules
import type { PlaygroundProjectsQueryResult } from "@/sanity.types";

// Local modules
import { toPieces } from "./playground-data";

const size = 600;
const image = (
  id: string,
  dimensions: { width?: number; height?: number } | null = null,
) =>
  ({
    asset: { _ref: `image-${id}-2000x3000-jpg`, _type: "reference" },
    _type: "image",
    metadata: { lqip: "data:image/jpeg;base64,x", dimensions },
  }) as never;

const project = (
  over: Partial<PlaygroundProjectsQueryResult[number]> = {},
): PlaygroundProjectsQueryResult[number] => ({
  _id: "p1",
  title: "Pertemps",
  slug: { current: "pertemps", _type: "slug" },
  coverImage: image("cover"),
  coverVideoUrl: null,
  story: [],
  ...over,
});

describe("toPieces", () => {
  describe("orientation", () => {
    const orientationOf = (dims: { width?: number; height?: number } | null) =>
      toPieces([project({ coverImage: image("c", dims) })], size)[0]
        .orientation;

    it("is landscape above the 1.095 cut-off and portrait below it", () => {
      expect(orientationOf({ width: 1100, height: 1000 })).toBe("landscape");
      expect(orientationOf({ width: 1090, height: 1000 })).toBe("portrait");
      expect(orientationOf({ width: 3000, height: 2000 })).toBe("landscape");
      expect(orientationOf({ width: 2000, height: 3000 })).toBe("portrait");
    });

    it("treats square and missing dimensions as portrait", () => {
      expect(orientationOf({ width: 1000, height: 1000 })).toBe("portrait");
      expect(orientationOf(null)).toBe("portrait");
      expect(orientationOf({ width: 1000 })).toBe("portrait");
    });

    it("takes a video piece's orientation from its poster", () => {
      const pieces = toPieces(
        [
          project({
            coverImage: null,
            story: [
              {
                _key: "r1",
                items: [
                  {
                    _key: "v",
                    _type: "videoCell",
                    videoUrl: "https://x/v.mp4",
                    poster: image("v", { width: 1920, height: 1080 }),
                  },
                ],
              },
            ],
          }),
        ],
        size,
      );
      expect(pieces[0].orientation).toBe("landscape");
    });

    it("crops each orientation to its own size", () => {
      const [portrait] = toPieces(
        [project({ coverImage: image("p", { width: 800, height: 1000 }) })],
        size,
      );
      const [landscape] = toPieces(
        [project({ coverImage: image("l", { width: 1500, height: 1000 }) })],
        size,
      );
      expect(portrait.src).toContain("w=480");
      expect(landscape.src).toContain("w=900");
      expect(landscape.src).toContain("h=600");
    });
  });

  it("makes a piece from a cover, cropped to the tile height", () => {
    const [piece] = toPieces([project()], size);
    expect(piece).toMatchObject({ slug: "pertemps", title: "Pertemps" });
    expect(piece.src).toContain("w=480");
    expect(piece.src).toContain("h=600");
    expect(piece.blurDataURL).toBe("data:image/jpeg;base64,x");
    expect(piece.videoSrc).toBeUndefined();
  });

  it("makes pieces from image Cells and video Cells", () => {
    const pieces = toPieces(
      [
        project({
          story: [
            {
              _key: "r1",
              items: [
                { _key: "a", _type: "imageCell", image: image("a") },
                {
                  _key: "b",
                  _type: "videoCell",
                  videoUrl: "https://cdn.sanity.io/files/p/d/b.mp4",
                  poster: image("b"),
                },
              ],
            },
          ],
        }),
      ],
      size,
    );
    expect(pieces).toHaveLength(3);
    expect(pieces[1].videoSrc).toBeUndefined();
    expect(pieces[2].videoSrc).toBe("https://cdn.sanity.io/files/p/d/b.mp4");
    expect(pieces[2].src).toContain("b-2000x3000");
  });

  it("uses the cover video with the cover as its poster", () => {
    const [piece] = toPieces(
      [project({ coverVideoUrl: "https://cdn.sanity.io/files/p/d/c.mp4" })],
      size,
    );
    expect(piece.videoSrc).toBe("https://cdn.sanity.io/files/p/d/c.mp4");
    expect(piece.src).toContain("cover-2000x3000");
  });

  it("skips Projects without a title or slug", () => {
    expect(
      toPieces([project({ title: null }), project({ slug: null })], size),
    ).toEqual([]);
  });

  it("skips Cells without media", () => {
    const pieces = toPieces(
      [
        project({
          coverImage: null,
          story: [
            {
              _key: "r1",
              items: [
                { _key: "t", _type: "textCell" },
                { _key: "a", _type: "imageCell", image: null },
                {
                  _key: "v",
                  _type: "videoCell",
                  videoUrl: "https://x/v.mp4",
                  poster: null,
                },
              ],
            },
          ],
        }),
      ],
      size,
    );
    expect(pieces).toEqual([]);
  });
});
