import { describe, expect, it } from "vitest";

import { activeTileIndex, decayBoost, wrapOffset } from "./stream-math";

const tiles = [
  { top: 0, height: 100 },
  { top: 110, height: 100 },
  { top: 220, height: 100 },
];
const setHeight = 330;

describe("wrapOffset", () => {
  it("loops forwards and backwards into one set height", () => {
    expect(wrapOffset(335, setHeight)).toBe(5);
    expect(wrapOffset(-5, setHeight)).toBe(325);
  });
});

describe("activeTileIndex", () => {
  it("picks the tile at the viewport centre", () => {
    expect(activeTileIndex(0, 100, tiles, setHeight)).toBe(0);
    expect(activeTileIndex(100, 100, tiles, setHeight)).toBe(1);
    expect(activeTileIndex(200, 100, tiles, setHeight)).toBe(2);
  });

  it("maps repeated copies to the same tile", () => {
    expect(activeTileIndex(100 + setHeight * 3, 100, tiles, setHeight)).toBe(1);
    expect(activeTileIndex(100 - setHeight, 100, tiles, setHeight)).toBe(1);
  });
});

describe("decayBoost", () => {
  it("eases towards zero in either direction and settles", () => {
    expect(decayBoost(100, 0.1)).toBeLessThan(100);
    expect(decayBoost(-100, 0.1)).toBeGreaterThan(-100);
    expect(decayBoost(1, 5)).toBe(0);
  });
});
