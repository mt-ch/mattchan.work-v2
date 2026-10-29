// Third-party libraries
import { gsap } from "gsap";

// Local modules
import { ENTRANCE_CONFIG } from "./entrance-config";

/** CSS variable the Entrance fades; the pre-hydration CSS reads it as opacity. */
export const ENTRANCE_FADE_VAR = "--entrance-fade";

export type EntranceTimelineOptions = {
  /** The Entrance root; the fade variable is set on it. */
  root: HTMLElement;
  /** Play the 0.4s reduced-motion fade instead of the full Entrance. */
  reduced: boolean;
  /** Called once, as the timeline's final step. */
  onComplete: () => void;
};

/**
 * Builds the Entrance's master timeline: a page fade from 0 to 1, then the
 * hand-off call. Fading a CSS variable on the root lets every element the
 * pre-hydration CSS hid follow it, including stream copies added after mount.
 *
 * @param options - The root element, reduced-motion flag and hand-off callback.
 * @returns The timeline, already playing.
 */
export function buildEntranceTimeline({
  root,
  reduced,
  onComplete,
}: EntranceTimelineOptions): gsap.core.Timeline {
  const duration = reduced
    ? ENTRANCE_CONFIG.reducedFadeDuration
    : ENTRANCE_CONFIG.fadeDuration;

  const tl = gsap.timeline();
  tl.fromTo(
    root,
    { [ENTRANCE_FADE_VAR]: 0 },
    { [ENTRANCE_FADE_VAR]: 1, duration, ease: "power1.out" },
  );

  // Hand the page over once everything has faded in
  tl.call(onComplete);

  return tl;
}
