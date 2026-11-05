// Local modules
import {
  PERIOD_COLUMNS,
  PERIOD_ROWS,
  bestOf,
  mod,
  mulberry32,
  rankPieces,
  type Cell,
  type LayoutConfig,
} from "./layout-core";
import { tileWidthFor, type Orientation } from "./orientation";
import type { Piece } from "./playground-data";

/** One slot of a row: its place along the row and what it shows, if anything. */
export type Slot = { cell: Cell | null; x: number; width: number };

/** One row of the period. `length` is the distance after which it repeats. */
export type Row = { slots: Slot[]; length: number; done: boolean };

/** What surrounds a slot about to be filled. */
type Around = {
  slugs: Record<Orientation, string[]>;
  landscapeBeside: boolean;
};

/** Result of arranging one period of rows, cached while its inputs are unchanged. */
type Pattern = { rows: Row[]; pieces: Piece[]; key: string };

let cached: Pattern | null = null;

/**
 * Sideways offset of a row: odd rows are shifted by the stagger.
 *
 * @param row - World row.
 * @param layout - Source of the stagger.
 * @returns The offset in px.
 */
export function rowOffset(row: number, layout: LayoutConfig): number {
  return mod(row, 2) === 1 ? layout.stagger : 0;
}

/**
 * Finds the slots of a finished row that overlap a horizontal span, allowing
 * for the row repeating along the canvas.
 *
 * @param row - The finished row.
 * @param offset - The row's sideways offset.
 * @param span - Start and width of the span in world px.
 * @returns The slots whose tile overlaps the span.
 */
function overlapping(row: Row, offset: number, span: [number, number]) {
  const [start, width] = span;

  return row.slots.filter((slot) => {
    const from = offset + slot.x;
    // The first repeat of this slot that ends after the span starts
    const repeat = Math.floor((start - from - slot.width) / row.length) + 1;

    return from + repeat * row.length < start + width;
  });
}

/**
 * Collects what surrounds a slot that is about to be filled: the Project
 * slugs of its placed neighbours, which depend on how wide the tile will be,
 * and whether a landscape sits beside it.
 *
 * @param rows - The period's rows so far.
 * @param row - Row of the slot.
 * @param slotIndex - Index of the slot within its row.
 * @param layout - Tile height, gap and stagger.
 * @returns Neighbouring slugs for each orientation, and whether a landscape is beside the slot.
 */
function surroundings(
  rows: Row[],
  row: number,
  slotIndex: number,
  layout: LayoutConfig,
): Around {
  const mine = rows[row];
  const beside = [
    mine.slots[slotIndex - 1],
    slotIndex === PERIOD_COLUMNS - 1 ? mine.slots[0] : undefined,
  ];
  const start = rowOffset(row, layout) + mine.slots[slotIndex].x;
  const slugsFor = (orientation: Orientation) => {
    const width = tileWidthFor(orientation, layout.tileHeight);
    const touching = [...beside];

    // Tiles in the rows above and below that overlap horizontally
    for (const step of [-1, 1]) {
      const index = mod(row + step, PERIOD_ROWS);
      if (!rows[index].done) continue;
      const offset = rowOffset(index, layout);
      touching.push(...overlapping(rows[index], offset, [start, width]));
    }

    return touching.flatMap((s) => (s?.cell ? [s.cell.piece.slug] : []));
  };

  return {
    slugs: { portrait: slugsFor("portrait"), landscape: slugsFor("landscape") },
    landscapeBeside: beside.some(
      (s) => s?.cell?.piece.orientation === "landscape",
    ),
  };
}

/**
 * Picks the piece for a slot. In order: fewest Project clashes with the
 * neighbours, no landscape beside a landscape, least used, shuffled order.
 *
 * @param pieces - All pieces.
 * @param rank - Shuffled rank per piece; lower goes first.
 * @param uses - How often each piece has been placed.
 * @param around - What surrounds the slot.
 * @returns The index of the chosen piece.
 */
function choosePiece(
  pieces: Piece[],
  rank: number[],
  uses: number[],
  around: Around,
): number {
  return bestOf(
    pieces.map((piece, i) => [
      around.slugs[piece.orientation].filter((slug) => slug === piece.slug)
        .length,
      around.landscapeBeside && piece.orientation === "landscape" ? 1 : 0,
      uses[i],
      rank[i],
    ]),
  );
}

/**
 * Arranges one period: for every row, which slots are filled and with what.
 * Rows are filled top to bottom and left to right, so indices count that way.
 *
 * @param pieces - All pieces.
 * @param layout - Tile height, gap, stagger and fill ratio.
 * @param seed - Seed for the arrangement.
 * @returns The rows of the period.
 */
function arrange(pieces: Piece[], layout: LayoutConfig, seed: number): Row[] {
  const random = mulberry32(seed);
  const rank = rankPieces(pieces.length, random);
  const uses = pieces.map(() => 0);
  const portrait = tileWidthFor("portrait", layout.tileHeight);
  const rows: Row[] = Array.from({ length: PERIOD_ROWS }, () => ({
    slots: [],
    length: 0,
    done: false,
  }));
  let count = 0;

  for (let r = 0; r < PERIOD_ROWS; r++) {
    let x = 0;
    for (let s = 0; s < PERIOD_COLUMNS; s++) {
      const last = r === PERIOD_ROWS - 1 && s === PERIOD_COLUMNS - 1;
      const filled =
        pieces.length > 0 &&
        layout.fillRatio > 0 &&
        (random() < layout.fillRatio || (count === 0 && last));

      // Reserve the slot at the portrait width, then fill it if it is filled
      rows[r].slots.push({ cell: null, x, width: portrait });
      if (filled) {
        const around = surroundings(rows, r, s, layout);
        const choice = choosePiece(pieces, rank, uses, around);
        const slot = rows[r].slots[s];
        slot.cell = { piece: pieces[choice], index: ++count };
        slot.width = tileWidthFor(
          pieces[choice].orientation,
          layout.tileHeight,
        );
        uses[choice]++;
      }
      x += rows[r].slots[s].width + layout.gap;
    }
    rows[r].length = x;
    rows[r].done = true;
  }

  return rows;
}

/**
 * Returns the arranged period, reusing the last one when inputs are unchanged.
 *
 * @param pieces - All pieces.
 * @param layout - Tile height, gap, stagger and fill ratio.
 * @param seed - Seed for the arrangement.
 * @returns The Pattern.
 */
export function patternFor(
  pieces: Piece[],
  layout: LayoutConfig,
  seed: number,
): Pattern {
  const { tileHeight, gap, stagger, fillRatio } = layout;
  const key = [tileHeight, gap, stagger, fillRatio, seed].join("|");
  if (cached && cached.pieces === pieces && cached.key === key) return cached;
  cached = { rows: arrange(pieces, layout, seed), pieces, key };

  return cached;
}
