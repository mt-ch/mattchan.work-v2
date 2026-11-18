/** How the Queue bends in depth: a straight ramp, an ease-out, or an arc. */
export type DepthCurve = "linear" | "ease" | "arc";

/** Every depth curve, for the panel's options. */
export const DEPTH_CURVES: DepthCurve[] = ["linear", "ease", "arc"];

/**
 * Shapes a card's distance from the focus card into its depth, in card steps.
 * All curves agree at the focus card (0) and at the far end of the window (`reach`).
 *
 * @param curve - Which curve to apply; an unknown value (such as stale storage) is treated as linear.
 * @param offset - Signed distance ahead of the focus point, in cards.
 * @param reach - Distance at which the curves meet, in cards (the far end of the window).
 * @returns Depth in card steps, positive meaning further back.
 */
export function curveDepth(
  curve: DepthCurve,
  offset: number,
  reach: number,
): number {
  if (reach <= 0) return offset;

  const sign = offset < 0 ? -1 : 1;
  const t = Math.min(Math.abs(offset) / reach, 1);

  if (curve === "ease") {
    // Quadratic ease-out: depth builds fast near the focus, then flattens
    return sign * reach * (1 - (1 - t) * (1 - t));
  }
  if (curve === "arc") {
    // Quadratic bowl: every card recedes, the further the more steeply
    return reach * t * t;
  }

  return offset;
}
