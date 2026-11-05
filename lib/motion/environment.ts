/** Media query that matches when the visitor asks for reduced motion. */
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Media query that matches at the `lg` breakpoint and above. */
const DESKTOP_QUERY = "(min-width: 1024px)";

/**
 * Reads the visitor's reduced-motion preference as a live query.
 *
 * @returns A media query list that matches while reduced motion is requested.
 */
export function getReducedMotion(): MediaQueryList {
  return window.matchMedia(REDUCED_MOTION_QUERY);
}

/**
 * Reads whether the viewport is at the desktop breakpoint as a live query.
 *
 * @returns A media query list that matches at desktop widths.
 */
export function getDesktop(): MediaQueryList {
  return window.matchMedia(DESKTOP_QUERY);
}

/**
 * One-shot check of the reduced-motion preference.
 *
 * @returns True when the visitor prefers reduced motion.
 */
export function prefersReducedMotion(): boolean {
  return getReducedMotion().matches;
}

/** Media query that matches when the primary pointer is coarse, such as a finger. */
const COARSE_POINTER_QUERY = "(pointer: coarse)";

/**
 * Reads whether the primary pointer is coarse as a live query.
 *
 * @returns A media query list that matches on touch-first devices.
 */
export function getCoarsePointer(): MediaQueryList {
  return window.matchMedia(COARSE_POINTER_QUERY);
}
