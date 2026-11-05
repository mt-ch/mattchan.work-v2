// Local modules
import type { Point } from "./edge-nudge";
import {
  PERIOD_COLUMNS,
  PERIOD_ROWS,
  bestOf,
  mod,
  mulberry32,
  rankPieces,
  type Cell,
  type LayoutConfig,
  type Tile,
} from "./layout-core";
import type { Piece } from "./playground-data";

/** Result of arranging one period, cached while its inputs are unchanged. */
type Pattern = {
  cells: (Cell | null)[];
  pieces: Piece[];
  fill: number;
  seed: number;
};

let cached: Pattern | null = null;

/**
 * Size of one repeating period of the uniform arrangement.
 *
 * @param layout - Tile size and gap.
 * @returns Period width and height in px.
 */
export function uniformPeriodSize(layout: LayoutConfig) {
  return {
    width: PERIOD_COLUMNS * (layout.tileWidth + layout.gap),
    height: PERIOD_ROWS * (layout.tileHeight + layout.gap),
  };
}

/**
 * Picks the piece whose Project clashes least with the neighbours, preferring
 * pieces used least so far and then the shuffled order.
 *
 * @param pieces - All pieces.
 * @param rank - Shuffled rank per piece; lower goes first.
 * @param uses - How often each piece has been placed.
 * @param around - Slugs of the already placed neighbours.
 * @returns The index of the chosen piece.
 */
function choosePiece(
  pieces: Piece[],
  rank: number[],
  uses: number[],
  around: string[],
): number {
  return bestOf(
    pieces.map((piece, i) => [
      around.filter((slug) => slug === piece.slug).length,
      uses[i],
      rank[i],
    ]),
  );
}

/**
 * Slugs of the placed pieces in the eight cells around one, wrapping at the
 * period's edges.
 *
 * @param cells - The period's cells, column-major.
 * @param column - Column of the cell.
 * @param row - Row of the cell.
 * @returns The neighbouring Project slugs.
 */
function neighbourSlugs(cells: (Cell | null)[], column: number, row: number) {
  const slugs: string[] = [];

  for (let dc = -1; dc <= 1; dc++) {
    for (let dr = -1; dr <= 1; dr++) {
      if (dc === 0 && dr === 0) continue;
      const c = mod(column + dc, PERIOD_COLUMNS);
      const r = mod(row + dr, PERIOD_ROWS);
      const cell = cells[c * PERIOD_ROWS + r];
      if (cell) slugs.push(cell.piece.slug);
    }
  }

  return slugs;
}

/**
 * Arranges one period: which cells are filled and which piece each shows.
 *
 * @param pieces - All pieces.
 * @param fill - Share of cells to fill, 0 to 1.
 * @param seed - Seed for the arrangement.
 * @returns A Pattern, with cells in column-major order.
 */
function arrange(pieces: Piece[], fill: number, seed: number): Pattern {
  const random = mulberry32(seed);
  const rank = rankPieces(pieces.length, random);
  const uses = pieces.map(() => 0);
  const cells: (Cell | null)[] = [];
  let count = 0;

  for (let column = 0; column < PERIOD_COLUMNS; column++) {
    for (let row = 0; row < PERIOD_ROWS; row++) {
      const filled =
        random() < fill ||
        (count === 0 && column + row === PERIOD_COLUMNS + PERIOD_ROWS - 2);
      if (!filled || fill <= 0 || pieces.length === 0) {
        cells.push(null);
        continue;
      }

      const around = neighbourSlugs(cells, column, row);
      const choice = choosePiece(pieces, rank, uses, around);
      uses[choice]++;
      cells.push({ piece: pieces[choice], index: ++count });
    }
  }

  return { cells, pieces, fill, seed };
}

/**
 * Returns the arranged period, reusing the last one when inputs are unchanged.
 *
 * @param pieces - All pieces.
 * @param fill - Share of cells to fill.
 * @param seed - Seed for the arrangement.
 * @returns The Pattern.
 */
function patternFor(pieces: Piece[], fill: number, seed: number): Pattern {
  if (
    cached &&
    cached.pieces === pieces &&
    cached.fill === fill &&
    cached.seed === seed
  ) {
    return cached;
  }
  cached = arrange(pieces, fill, seed);

  return cached;
}

/**
 * Places the tile of one filled cell relative to the camera.
 *
 * @param column - World column of the cell.
 * @param row - World row of the cell.
 * @param cell - What the cell shows.
 * @param layout - Tile size, gap and stagger.
 * @param camera - World position of the viewport's top-left corner.
 * @returns The tile, with its world and screen positions.
 */
function placeTile(
  column: number,
  row: number,
  cell: Cell,
  layout: LayoutConfig,
  camera: Point,
): Tile {
  const worldX = column * (layout.tileWidth + layout.gap);
  const rowTop = row * (layout.tileHeight + layout.gap);
  const worldY = rowTop + (mod(column, 2) === 1 ? layout.stagger : 0);
  const depth = mod(column, 3) - 1;

  return {
    key: `${column}:${row}`,
    column,
    row,
    x: worldX - camera.x,
    y: worldY - camera.y,
    worldX,
    worldY,
    width: layout.tileWidth,
    height: layout.tileHeight,
    piece: cell.piece,
    index: cell.index,
    label: String(cell.index).padStart(2, "0"),
    depth: { x: depth, y: depth },
  };
}

/**
 * Lays uniform tiles out on the infinite canvas and returns those near the
 * viewport. Cells form a grid with alternate columns offset by the stagger;
 * which cells are filled and with what repeats every period.
 *
 * @param input.pieces - Everything the canvas can show.
 * @param input.layout - Tile size, gap, stagger, fill ratio and margin.
 * @param input.seed - Seed for the arrangement.
 * @param input.camera - World position of the viewport's top-left corner.
 * @param input.viewport - Viewport width and height in px.
 * @returns The visible tiles, ordered by column then row.
 */
export function layoutUniform(input: {
  pieces: Piece[];
  layout: LayoutConfig;
  seed: number;
  camera: Point;
  viewport: { width: number; height: number };
}): Tile[] {
  const { pieces, layout, seed, camera, viewport } = input;
  const pattern = patternFor(pieces, layout.fillRatio, seed);
  const pitchX = layout.tileWidth + layout.gap;
  const pitchY = layout.tileHeight + layout.gap;
  const reach = layout.margin;

  // Walk every cell that could reach the viewport plus the margin
  const firstColumn = Math.floor((camera.x - reach) / pitchX) - 1;
  const lastColumn = Math.ceil((camera.x + viewport.width + reach) / pitchX);
  const firstRow = Math.floor((camera.y - reach - layout.stagger) / pitchY) - 1;
  const lastRow = Math.ceil((camera.y + viewport.height + reach) / pitchY);
  const tiles: Tile[] = [];

  for (let column = firstColumn; column <= lastColumn; column++) {
    for (let row = firstRow; row <= lastRow; row++) {
      const index =
        mod(column, PERIOD_COLUMNS) * PERIOD_ROWS + mod(row, PERIOD_ROWS);
      const cell = pattern.cells[index];
      if (!cell) continue;

      const tile = placeTile(column, row, cell, layout, camera);
      const visible =
        tile.x + tile.width > -reach &&
        tile.x < viewport.width + reach &&
        tile.y + tile.height > -reach &&
        tile.y < viewport.height + reach;
      if (visible) tiles.push(tile);
    }
  }

  return tiles;
}
