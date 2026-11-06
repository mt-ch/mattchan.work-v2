export type Point = { x: number; y: number };

export type NudgeConfig = { enabled: boolean; zone: number; max: number };

/**
 * Strength of the nudge along one axis: 0 outside the edge zone, easing up to
 * 1 at the edge, signed towards the nearer edge.
 *
 * @param position - Pointer coordinate on this axis.
 * @param size - Viewport size on this axis.
 * @param zone - Edge zone as a fraction of the viewport.
 * @returns A value from -1 (low edge) to 1 (high edge).
 */
function axisStrength(position: number, size: number, zone: number): number {
  const band = size * zone;
  if (band <= 0) return 0;

  const low = Math.min(1, Math.max(0, (band - position) / band));
  const high = Math.min(1, Math.max(0, (position - (size - band)) / band));

  // Ease in so the nudge starts gently at the zone boundary
  return high * high - low * low;
}

/**
 * Offset the canvas should ease towards for a pointer near a viewport edge.
 * Positive x/y point towards the right/bottom edge.
 *
 * @param pointer - Pointer position in viewport px, or null when it is outside.
 * @param viewport - Viewport width and height in px.
 * @param config - Whether the nudge is on, its edge zone and maximum offset.
 * @returns The target offset in px; zero outside the edge zone or when disabled.
 */
export function edgeNudge(
  pointer: Point | null,
  viewport: { width: number; height: number },
  config: NudgeConfig,
): Point {
  if (!config.enabled || !pointer) return { x: 0, y: 0 };

  return {
    x: axisStrength(pointer.x, viewport.width, config.zone) * config.max,
    y: axisStrength(pointer.y, viewport.height, config.zone) * config.max,
  };
}
