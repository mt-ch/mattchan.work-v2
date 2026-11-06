// Local modules
import type { Tile } from "./layout";

/** What counts as seen: how much of a tile shows, and for how long. */
export type SeenConfig = {
  /** Share of a tile's area that must be on screen, 0 to 1. */
  threshold: number;
  /** How long a tile must stay past the threshold, in ms. */
  dwell: number;
};

/** Which pieces have been seen, and which tiles are on their way to counting. */
export type SeenState = {
  /** Keys of the pieces seen so far. */
  seen: ReadonlySet<string>;
  /** Time in ms at which each tile (by key) first went past the threshold. */
  pending: ReadonlyMap<string, number>;
};

/**
 * Creates the state to start counting from.
 *
 * @param seen - Keys of pieces already seen, such as those restored from storage.
 * @returns State with nothing pending.
 */
export function createSeenState(seen: Iterable<string> = []): SeenState {
  return { seen: new Set(seen), pending: new Map() };
}

/**
 * Measures how much of a tile is inside the viewport.
 *
 * @param tile - A tile with its screen position.
 * @param viewport - Viewport width and height in px.
 * @returns The visible share of the tile's area, 0 to 1.
 */
function visibleShare(
  tile: Tile,
  viewport: { width: number; height: number },
): number {
  const w = Math.min(tile.x + tile.width, viewport.width) - Math.max(tile.x, 0);
  const h =
    Math.min(tile.y + tile.height, viewport.height) - Math.max(tile.y, 0);
  if (w <= 0 || h <= 0) return 0;

  return (w * h) / (tile.width * tile.height);
}

/**
 * Advances seen tracking by one frame. A piece becomes seen once any of its
 * tiles has stayed past the threshold for the dwell time; a tile that dips
 * below the threshold starts over.
 *
 * @param prev - State from the previous frame.
 * @param frame.tiles - Tiles near the viewport, with screen positions.
 * @param frame.viewport - Viewport width and height in px.
 * @param frame.now - Current time in ms.
 * @param frame.config - Threshold and dwell.
 * @param frame.enabled - False while counting is off, such as during the intro.
 * @returns The new state; `prev` itself when counting is off.
 */
export function updateSeen(
  prev: SeenState,
  frame: {
    tiles: Tile[];
    viewport: { width: number; height: number };
    now: number;
    config: SeenConfig;
    enabled: boolean;
  },
): SeenState {
  if (!frame.enabled) return prev;
  const { tiles, viewport, now, config } = frame;

  const seen = new Set(prev.seen);
  const pending = new Map<string, number>();

  for (const tile of tiles) {
    // Tiles of a piece already seen have nothing left to prove
    if (seen.has(tile.piece.key)) continue;
    if (visibleShare(tile, viewport) < config.threshold) continue;

    // Keep the original start time so the dwell runs unbroken
    const since = prev.pending.get(tile.key) ?? now;
    if (now - since >= config.dwell) seen.add(tile.piece.key);
    else pending.set(tile.key, since);
  }

  return { seen: seen.size === prev.seen.size ? prev.seen : seen, pending };
}

/**
 * Reads seen keys from storage, keeping only pieces that still exist.
 *
 * @param raw - The stored string, or null when nothing is stored.
 * @param current - Keys of every piece that exists now.
 * @returns The stored keys that still exist; empty when `raw` is missing or invalid.
 */
export function parseSeen(
  raw: string | null,
  current: Iterable<string>,
): Set<string> {
  if (!raw) return new Set();

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    const exists = new Set(current);

    return new Set(
      parsed.filter((k): k is string => typeof k === "string" && exists.has(k)),
    );
  } catch {
    return new Set();
  }
}
