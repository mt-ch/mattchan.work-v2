/** Base flow of the stream, in px/s. The single tunable speed constant. */
export const BASE_SPEED = 40;

/** How quickly a wheel/drag boost eases back to nothing (per second). */
export const BOOST_DECAY = 3;

/** Longest frame the ticker will integrate, so resuming a tab never jumps. */
export const MAX_DT = 0.1;

/** Converts wheel/drag delta (px) into boost velocity (px/s). */
export const BOOST_GAIN = 12;

export type TileBox = { top: number; height: number };

export type Motion = { offset: number; boost: number };

/**
 * Wraps an offset into [0, setHeight) so repeated copies look identical.
 *
 * @param offset - Current scroll offset in px.
 * @param setHeight - Height of one copy of the tile set in px.
 * @returns The offset wrapped into one copy, or 0 when the set has no size.
 */
export function wrapOffset(offset: number, setHeight: number): number {
  if (setHeight <= 0) return 0;

  return ((offset % setHeight) + setHeight) % setHeight;
}

/**
 * Index of the tile at the vertical centre of the viewport. `tiles` describes
 * one copy of the set; the centre is wrapped into that copy, so every repeated
 * copy maps to the same index. Gaps between tiles belong to the tile above.
 *
 * @param offset - Current scroll offset in px.
 * @param viewportHeight - Height of the viewport in px.
 * @param tiles - Position and size of each tile in one copy of the set.
 * @param setHeight - Height of one copy of the tile set in px.
 * @returns The index of the tile under the viewport centre.
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

/**
 * Exponentially eases a boost velocity back to zero over `dt` seconds.
 *
 * @param boost - Current boost velocity in px/s.
 * @param dt - Time elapsed in seconds.
 * @returns The decayed boost, snapped to 0 once it is negligible.
 */
export function decayBoost(boost: number, dt: number): number {
  const next = boost * Math.exp(-BOOST_DECAY * dt);

  return Math.abs(next) < 0.5 ? 0 : next;
}

/**
 * Integrates one ticker frame: decays the boost, then moves the offset by the
 * base speed plus the remaining boost.
 *
 * @param motion - Current offset (px) and boost velocity (px/s).
 * @param deltaMs - Time since the previous frame in milliseconds.
 * @returns The offset and boost after the frame.
 */
export function advanceMotion(motion: Motion, deltaMs: number): Motion {
  const dt = Math.min(deltaMs / 1000, MAX_DT);
  const boost = decayBoost(motion.boost, dt);

  return { offset: motion.offset + (BASE_SPEED + boost) * dt, boost };
}
