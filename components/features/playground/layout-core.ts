// Local modules
import type { PlaygroundConfig } from "./config";
import type { Piece } from "./playground-data";

export type LayoutConfig = PlaygroundConfig["layout"];

/** Columns and rows after which the arrangement repeats. Columns stay even so the stagger lines up. */
export const PERIOD_COLUMNS = 12;
export const PERIOD_ROWS = 10;

/** A tile on the canvas. `x`/`y` are viewport px; `worldX`/`worldY` ignore the camera. */
export type Tile = {
  /** Stable for the world cell, so React keeps the element while panning. */
  key: string;
  column: number;
  row: number;
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  width: number;
  height: number;
  piece: Piece;
  /** 1-based running index of the tile within one period; repeats with it. */
  index: number;
  /** `index` zero-padded to two digits. */
  label: string;
  /** How strongly parallax moves the tile on each axis, -1 to 1. */
  depth: { x: number; y: number };
};

/** What a filled cell shows. */
export type Cell = { piece: Piece; index: number };

/**
 * Small deterministic random number generator.
 *
 * @param seed - Any integer.
 * @returns A function returning numbers in [0, 1).
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;

  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Wraps an integer into [0, size).
 *
 * @param value - Any integer.
 * @param size - Positive modulus.
 * @returns The wrapped value.
 */
export function mod(value: number, size: number): number {
  return ((value % size) + size) % size;
}

/**
 * Index of the lowest-scoring candidate, comparing score lists
 * lexicographically; the first wins a full tie.
 *
 * @param scores - One score list per candidate; lower is better.
 * @returns The index of the best candidate.
 */
export function bestOf(scores: number[][]): number {
  let best = 0;

  scores.forEach((score, i) => {
    const other = scores[best];
    const k = score.findIndex((v, j) => v !== other[j]);
    if (k !== -1 && score[k] < other[k]) best = i;
  });

  return best;
}

/**
 * Shuffled rank of each piece, drawn from a seeded generator.
 *
 * @param count - Number of pieces.
 * @param random - The generator to draw from.
 * @returns A rank per piece; lower goes first.
 */
export function rankPieces(count: number, random: () => number): number[] {
  return Array.from({ length: count }, () => random());
}
