// Third-party libraries
import { describe, expect, it } from "vitest";

// Shared modules
import type {
  PlaygroundPiecesQueryResult,
  PlaygroundProjectsQueryResult,
} from "@/sanity.types";

// Local modules
import { toPieces, toPlaygroundPieces } from "./playground-data";

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
  it("falls back to portrait, since Project media has no chosen orientation", () => {
    const [piece] = toPieces(
      [project({ coverImage: image("c", { width: 3000, height: 1000 }) })],
      size,
    );
    expect(piece.orientation).toBe("portrait");
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

const doc = (
  over: Partial<PlaygroundPiecesQueryResult[number]> = {},
): PlaygroundPiecesQueryResult[number] => ({
  _id: "d1",
  image: image("piece", { width: 2000, height: 3000 }),
  videoUrl: null,
  orientation: "portrait",
  caption: null,
  projectTitle: "Pertemps",
  projectSlug: "pertemps",
  ...over,
});

describe("toPlaygroundPieces", () => {
  it("takes orientation from the field, whatever the image dimensions", () => {
    const [piece] = toPlaygroundPieces(
      [
        doc({
          orientation: "landscape",
          image: image("tall", { width: 1000, height: 3000 }),
        }),
      ],
      size,
    );
    expect(piece.orientation).toBe("landscape");
  });

  it("crops to the orientation's width at the requested height", () => {
    const [portrait, landscape] = toPlaygroundPieces(
      [doc(), doc({ orientation: "landscape" })],
      size,
    );
    expect(portrait.src).toContain("w=480");
    expect(portrait.src).toContain("h=600");
    expect(landscape.src).toContain("w=900");
    expect(landscape.src).toContain("h=600");
  });

  it("labels the piece with its Project and keeps the blur placeholder", () => {
    const [piece] = toPlaygroundPieces([doc()], size);
    expect(piece).toMatchObject({ slug: "pertemps", title: "Pertemps" });
    expect(piece.blurDataURL).toBe("data:image/jpeg;base64,x");
  });

  it("gives a video piece its video, with the image as src", () => {
    const [piece] = toPlaygroundPieces(
      [doc({ videoUrl: "https://cdn.sanity.io/files/p/d/v.mp4" })],
      size,
    );
    expect(piece.videoSrc).toBe("https://cdn.sanity.io/files/p/d/v.mp4");
    expect(piece.src).toContain("piece-2000x3000");
  });

  it("skips a piece without an image asset", () => {
    expect(toPlaygroundPieces([doc({ image: null })], size)).toEqual([]);
  });

  it("carries the caption through", () => {
    const [piece] = toPlaygroundPieces([doc({ caption: "A caption" })], size);
    expect(piece.caption).toBe("A caption");
  });
});
