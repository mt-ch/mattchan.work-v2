// Local modules
import type { QueueConfig } from "./config";

/**
 * Applies the visitor's context to the config: narrow screens swap in the
 * mobile values, and reduced motion flattens every card to one small static tilt.
 *
 * @param config - Queue config with the desktop values.
 * @param context.mobile - True below the desktop breakpoint.
 * @param context.reduced - True when the visitor prefers reduced motion.
 * @returns The config to lay out and render with; `config` itself is not changed.
 */
export function resolveConfig(
  config: QueueConfig,
  context: { mobile: boolean; reduced: boolean },
): QueueConfig {
  const resolved = { ...config };

  if (context.mobile) {
    resolved.perspective = config.mobilePerspective;
    resolved.cardHeight = config.mobileCardHeight;
  }

  if (context.reduced) {
    resolved.rotateY = config.reducedTilt;
    resolved.rotateFalloff = 0;
  }

  return resolved;
}
