// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import type { Tile } from "./layout";
import { pickPlaying } from "./video-budget";

const viewport = { width: 1000, height: 800 };

const tile = (key: string, x: number, y: number, video = true): Tile => ({
  key,
  column: 0,
  row: 0,
  x,
  y,
  worldX: x,
  worldY: y,
  width: 200,
  height: 250,
  index: 1,
  label: "01",
  piece: {
    slug: key,
    title: key,
    src: "x",
    videoSrc: video ? "v.mp4" : undefined,
  },
});

describe("pickPlaying", () => {
  it("plays the videos nearest the centre, up to the cap", () => {
    const tiles = [
      tile("far", 10, 10),
      tile("near", 450, 300),
      tile("mid", 200, 300),
      tile("also-far", 780, 540),
    ];
    expect([...pickPlaying(tiles, viewport, 2)]).toEqual(["near", "mid"]);
  });

  it("ignores tiles off screen and tiles without video", () => {
    const tiles = [
      tile("off", -500, 100),
      tile("still", 400, 300, false),
      tile("on", 100, 100),
    ];
    expect([...pickPlaying(tiles, viewport, 3)]).toEqual(["on"]);
  });

  it("plays nothing when the cap is zero", () => {
    expect(pickPlaying([tile("a", 400, 300)], viewport, 0).size).toBe(0);
  });
});
