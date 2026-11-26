// Third-party libraries
import { describe, expect, it } from "vitest";

// Shared modules
import type { PlaygroundPiecesQueryResult } from "@/sanity.types";

// Local modules
import { toPlaygroundPieces } from "./queue-data";

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

  it("keys the piece by its asset reference, the poster's for videos", () => {
    const [still, video] = toPlaygroundPieces(
      [doc(), doc({ videoUrl: "https://x/v.mp4", image: image("poster") })],
      size,
    );
    expect(still.key).toBe("image-piece-2000x3000-jpg");
    expect(video.key).toBe("image-poster-2000x3000-jpg");
  });

  it("gives the same key to one asset used twice, whatever the crop", () => {
    const [a, b] = toPlaygroundPieces(
      [doc(), doc({ orientation: "landscape" })],
      size,
    );
    expect(a.key).toBe(b.key);
    expect(a.src).not.toBe(b.src);
  });

  it("carries the caption through", () => {
    const [piece] = toPlaygroundPieces([doc({ caption: "A caption" })], size);
    expect(piece.caption).toBe("A caption");
  });
});
