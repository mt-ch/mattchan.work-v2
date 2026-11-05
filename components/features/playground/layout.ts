// Local modules
import type { Point } from "./edge-nudge";
import type { LayoutConfig, Tile } from "./layout-core";
import { layoutMixed, mixedPeriodSize } from "./layout-mixed";
import { layoutUniform, uniformPeriodSize } from "./layout-uniform";
import type { Piece } from "./playground-data";

export { PERIOD_COLUMNS, PERIOD_ROWS } from "./layout-core";
export type { LayoutConfig, Tile } from "./layout-core";

/**
 * Size of one repeating period of the arrangement. In mixed mode the width is
 * nominal, since each row repeats at its own length.
 *
 * @param layout - Mode, tile size and gap.
 * @returns Period width and height in px.
 */
export function periodSize(layout: LayoutConfig) {
  return layout.mode === "mixed"
    ? mixedPeriodSize(layout)
    : uniformPeriodSize(layout);
}

/**
 * Lays tiles out on the infinite canvas and returns those near the viewport.
 * A pure function of its inputs: the arrangement is seeded and repeats, so
 * panning never runs out and every visit looks the same. `layout.mode` picks
 * between the uniform grid and the mixed rows.
 *
 * @param input.pieces - Everything the canvas can show.
 * @param input.layout - Mode, tile size, gap, stagger, fill ratio and margin.
 * @param input.seed - Seed for the arrangement.
 * @param input.camera - World position of the viewport's top-left corner.
 * @param input.viewport - Viewport width and height in px.
 * @returns The visible tiles.
 */
export function layoutTiles(input: {
  pieces: Piece[];
  layout: LayoutConfig;
  seed: number;
  camera: Point;
  viewport: { width: number; height: number };
}): Tile[] {
  return input.layout.mode === "mixed"
    ? layoutMixed(input)
    : layoutUniform(input);
}
