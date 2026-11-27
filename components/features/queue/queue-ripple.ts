/** How far Ripple lifts the hovered card at full strength, in card heights. */
export const RIPPLE_LIFT = 0.2;

/** Peak push of a neighbour one card away, in card heights. */
export const RIPPLE_PUSH = 0.12;

/** Seconds the wave takes to travel one card further out. */
export const RIPPLE_DELAY = 0.07;

/** Oscillations per second of the wave. */
export const RIPPLE_FREQUENCY = 2.5;

/** How fast the wave dies out, per second. */
export const RIPPLE_DAMPING = 4;

/**
 * Z offset of one card from a Ripple, as a share of card height, before the
 * hover strength. Pure: the same inputs always give the same offset.
 *
 * The hovered card (distance 0) lifts steadily. A neighbour waits for the wave
 * to reach it (a delay per card of distance), then swings as a damped sine
 * that settles back to rest, weaker the further out it is. Cards beyond reach
 * are untouched.
 *
 * @param input.distance - Whole cards between this card and the hovered one.
 * @param input.reach - Cards either side of the hovered one the wave reaches.
 * @param input.elapsed - Seconds since the effect took the hovered card.
 * @returns Signed z offset in card heights; positive is toward the camera.
 */
export function rippleOffset(input: {
  distance: number;
  reach: number;
  elapsed: number;
}): number {
  const { distance, reach, elapsed } = input;
  if (distance === 0) return RIPPLE_LIFT;
  if (distance > reach) return 0;

  // Wait for the wave to arrive, then let it swing and die away
  const age = elapsed - distance * RIPPLE_DELAY;
  if (age <= 0) return 0;

  const swing = Math.sin(2 * Math.PI * RIPPLE_FREQUENCY * age);
  const settle = Math.exp(-RIPPLE_DAMPING * age);
  const falloff = 1 / distance;

  return RIPPLE_PUSH * falloff * swing * settle;
}
