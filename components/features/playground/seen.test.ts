// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import type { Tile } from "./layout";
import { createSeenState, parseSeen, updateSeen, type SeenState } from "./seen";

const viewport = { width: 1000, height: 800 };
const config = { threshold: 0.5, dwell: 300 };

const tile = (key: string, x: number, y: number, piece = key): Tile => ({
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
  depth: { x: 0, y: 0 },
  piece: {
    key: piece,
    slug: piece,
    title: piece,
    orientation: "portrait",
    src: "x",
  },
});

const step = (prev: SeenState, tiles: Tile[], now: number, enabled = true) =>
  updateSeen(prev, { tiles, viewport, now, config, enabled });

describe("updateSeen", () => {
  it("never counts a tile below the threshold", () => {
    // Only 40% of the tile is on screen
    const edge = tile("a", 920, 100);
    let state = createSeenState();
    for (const now of [0, 500, 1000]) state = step(state, [edge], now);
    expect(state.seen.size).toBe(0);
  });

  it("counts a tile at the threshold only once the dwell has passed", () => {
    // Exactly half of the tile is on screen
    const half = tile("a", 900, 100);
    let state = step(createSeenState(), [half], 0);
    state = step(state, [half], 299);
    expect(state.seen.has("a")).toBe(false);
    state = step(state, [half], 300);
    expect(state.seen.has("a")).toBe(true);
  });

  it("restarts the timer when a tile leaves before the dwell ends", () => {
    const inside = tile("a", 100, 100);
    const outside = tile("a", 2000, 100);
    let state = step(createSeenState(), [inside], 0);
    state = step(state, [outside], 200);
    state = step(state, [inside], 250);
    state = step(state, [inside], 500);
    expect(state.seen.has("a")).toBe(false);
    state = step(state, [inside], 550);
    expect(state.seen.has("a")).toBe(true);
  });

  it("counts several tiles of one piece once", () => {
    const tiles = [tile("a1", 100, 100, "p"), tile("a2", 500, 100, "p")];
    let state = step(createSeenState(), tiles, 0);
    state = step(state, tiles, 400);
    expect([...state.seen]).toEqual(["p"]);
  });

  it("counts nothing while counting is disabled", () => {
    const inside = tile("a", 100, 100);
    let state = step(createSeenState(), [inside], 0, false);
    state = step(state, [inside], 1000, false);
    expect(state.seen.size).toBe(0);
  });

  it("keeps pieces already seen", () => {
    const state = step(createSeenState(["old"]), [], 0);
    expect(state.seen.has("old")).toBe(true);
  });
});

describe("parseSeen", () => {
  const current = ["a", "b", "c"];

  it("keeps stored keys that still exist and drops removed ones", () => {
    expect(parseSeen('["a","gone","c"]', current)).toEqual(new Set(["a", "c"]));
  });

  it("treats missing, malformed or non-array input as empty", () => {
    for (const raw of [null, "", "{oops", '{"a":1}', '"a"', "42"])
      expect(parseSeen(raw, current).size).toBe(0);
  });

  it("ignores non-string entries", () => {
    expect(parseSeen('["a",1,null]', current)).toEqual(new Set(["a"]));
  });
});
