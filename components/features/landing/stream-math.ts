/** Base flow of the stream, in px/s. The single tunable speed constant. */
export const BASE_SPEED = 40;

/** How quickly a wheel/drag boost eases back to nothing (per second). */
export const BOOST_DECAY = 3;

export type TileBox = { top: number; height: number };

/** Wraps an offset into [0, setHeight) so repeated copies look identical. */
export function wrapOffset(offset: number, setHeight: number): number {
  if (setHeight <= 0) return 0;
  return ((offset % setHeight) + setHeight) % setHeight;
}

/**
 * Index of the tile at the vertical centre of the viewport. `tiles` describes
 * one copy of the set; the centre is wrapped into that copy, so every repeated
 * copy maps to the same index. Gaps between tiles belong to the tile above.
 */
export function activeTileIndex(
  offset: number,
  viewportHeight: number,
  tiles: TileBox[],
  setHeight: number,
): number {
  if (tiles.length === 0) return 0;
  const centre = wrapOffset(offset + viewportHeight / 2, setHeight);
  let index = 0;
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].top <= centre) index = i;
    else break;
  }
  return index;
}

/** Exponentially eases a boost velocity back to zero over `dt` seconds. */
export function decayBoost(boost: number, dt: number): number {
  const next = boost * Math.exp(-BOOST_DECAY * dt);
  return Math.abs(next) < 0.5 ? 0 : next;
}
