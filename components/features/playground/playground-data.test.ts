// Third-party libraries
import { describe, expect, it } from "vitest";

// Shared modules
import type { PlaygroundProjectsQueryResult } from "@/sanity.types";

// Local modules
import { toPieces } from "./playground-data";

const size = { width: 480, height: 600 };
const image = (id: string) =>
  ({
    asset: { _ref: `image-${id}-2000x3000-jpg`, _type: "reference" },
    _type: "image",
    metadata: { lqip: "data:image/jpeg;base64,x", dimensions: null },
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
  it("makes a piece from a cover, cropped to the tile size", () => {
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
