// Local modules
import type { Point } from "./edge-nudge";
import {
  PERIOD_COLUMNS,
  PERIOD_ROWS,
  mod,
  type Cell,
  type LayoutConfig,
  type Tile,
} from "./layout-core";
import { patternFor, rowOffset, type Row, type Slot } from "./mixed-pattern";
import { tileWidthFor } from "./orientation";
import type { Piece } from "./playground-data";
import { offsetCap, tileOffset } from "./tile-offset";

export { PERIOD_COLUMNS, PERIOD_ROWS } from "./layout-core";
export type { LayoutConfig, Tile } from "./layout-core";

/**
 * Size of one repeating period of the arrangement. Rows differ in length, so
 * the width is nominal: twelve portrait slots plus gaps.
 *
 * @param layout - Tile height and gap.
 * @returns Period width and height in px.
 */
export function periodSize(layout: LayoutConfig) {
  const portrait = tileWidthFor("portrait", layout.tileHeight);

  return {
    width: PERIOD_COLUMNS * (portrait + layout.gap),
    height: PERIOD_ROWS * (layout.tileHeight + layout.gap),
  };
}

/**
 * Places the tile of one filled slot relative to the camera.
 *
 * @param place.column - World column: the slot's index counting along the row's repeats.
 * @param place.row - World row.
 * @param place.slot - The slot, which holds a cell.
 * @param place.worldX - World x of the tile's left edge.
 * @param place.slotIndex - Index of the slot within its row.
 * @param place.seed - Seed for the vertical jitter.
 * @param place.layout - Tile height, gap, wave and jitter settings.
 * @param place.camera - World position of the viewport's top-left corner.
 * @returns The tile, with its world and screen positions.
 */
function placeTile(place: {
  column: number;
  row: number;
  slot: Slot & { cell: Cell };
  slotIndex: number;
  worldX: number;
  seed: number;
  layout: LayoutConfig;
  camera: Point;
}): Tile {
  const { column, row, slot, slotIndex, worldX, seed, layout, camera } = place;
  const offsetY = tileOffset({
    row,
    slotIndex,
    centreX: worldX + slot.width / 2,
    layout,
    seed,
  });
  const worldY = row * (layout.tileHeight + layout.gap) + offsetY;

  return {
    key: `${column}:${row}`,
    column,
    row,
    x: worldX - camera.x,
    y: worldY - camera.y,
    worldX,
    worldY,
    width: slot.width,
    height: layout.tileHeight,
    piece: slot.cell.piece,
    index: slot.cell.index,
    label: String(slot.cell.index).padStart(2, "0"),
    // Parallax moves rows sideways, each at its own depth
    depth: { x: mod(row, 3) - 1, y: 0 },
  };
}

/** What the mixed layout needs to place the tiles of one row. */
type RowInput = {
  seed: number;
  layout: LayoutConfig;
  camera: Point;
  viewport: { width: number; height: number };
};

/**
 * Places the visible tiles of one world row, walking every repeat of the row
 * that could reach the viewport plus the margin.
 *
 * @param row - World row.
 * @param pattern - The period row this world row repeats.
 * @param input - Layout, camera and viewport.
 * @returns The row's visible tiles, left to right.
 */
function rowTiles(row: number, pattern: Row, input: RowInput): Tile[] {
  const { layout, camera, viewport, seed } = input;
  const { slots, length } = pattern;
  const reach = layout.margin;
  const offset = rowOffset(row, layout);
  const firstRepeat = Math.floor((camera.x - reach - offset) / length) - 1;
  const lastRepeat = Math.ceil((camera.x + viewport.width + reach) / length);
  const tiles: Tile[] = [];

  for (let repeat = firstRepeat; repeat <= lastRepeat; repeat++) {
    slots.forEach((slot, s) => {
      if (!slot.cell) return;
      const tile = placeTile({
        column: repeat * PERIOD_COLUMNS + s,
        row,
        slot: slot as Slot & { cell: Cell },
        slotIndex: s,
        worldX: offset + repeat * length + slot.x,
        seed,
        layout,
        camera,
      });
      const visible =
        tile.x + tile.width > -reach &&
        tile.x < viewport.width + reach &&
        tile.y + tile.height > -reach &&
        tile.y < viewport.height + reach;
      if (visible) tiles.push(tile);
    });
  }

  return tiles;
}

/**
 * Lays tiles out as horizontal rows and returns those near the viewport.
 * A pure function of its inputs: the arrangement is seeded and repeats, so
 * panning never runs out and every visit looks the same. Every tile is the
 * same height; width follows the piece's orientation. Each row repeats at its
 * own length and odd rows are shifted sideways by the stagger. Tiles rise and
 * fall off their row line by a wave plus jitter, capped so rows never overlap.
 *
 * @param input.pieces - Everything the canvas can show.
 * @param input.layout - Tile height, gap, stagger, wave, jitter, fill ratio and margin.
 * @param input.seed - Seed for the arrangement.
 * @param input.camera - World position of the viewport's top-left corner.
 * @param input.viewport - Viewport width and height in px.
 * @returns The visible tiles, ordered by row then position along it.
 */
export function layoutTiles(input: {
  pieces: Piece[];
  layout: LayoutConfig;
  seed: number;
  camera: Point;
  viewport: { width: number; height: number };
}): Tile[] {
  const { pieces, layout, seed, camera, viewport } = input;
  const { rows } = patternFor(pieces, layout, seed);
  const pitchY = layout.tileHeight + layout.gap;
  // Rows just outside the margin can still offset a tile into it
  const reach = layout.margin + offsetCap(layout);
  const firstRow = Math.floor((camera.y - reach) / pitchY) - 1;
  const lastRow = Math.ceil((camera.y + viewport.height + reach) / pitchY);
  const tiles: Tile[] = [];

  for (let row = firstRow; row <= lastRow; row++) {
    tiles.push(...rowTiles(row, rows[mod(row, PERIOD_ROWS)], input));
  }

  return tiles;
}
