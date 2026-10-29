// Third-party libraries
import { gsap } from "gsap";

// Local modules
import { ENTRANCE_CONFIG } from "./entrance-config";
import { addStack, type StackParts } from "./stack-motion";

export type { StackParts };

/** CSS variable the Entrance fades; the pre-hydration CSS reads it as opacity. */
export const ENTRANCE_FADE_VAR = "--entrance-fade";

export type EntranceTimelineOptions = {
  /** The Entrance root; the fade variable is set on it. */
  root: HTMLElement;
  /** Play the 0.4s reduced-motion fade instead of the full Entrance. */
  reduced: boolean;
  /** The stack and counter to play before the fade; omitted for the fade alone. */
  stack?: StackParts;
  /** Called once, as the timeline's final step. */
  onComplete: () => void;
};

/** The master timeline and how to keep it in place across a resize. */
export type EntranceTimeline = {
  timeline: gsap.core.Timeline;
  /** Re-measures the stack's slots and keeps the timeline's place. */
  remeasure: () => void;
};

/**
 * Builds the Entrance's master timeline: the stack phase when there is one,
 * then a page fade from 0 to 1 and the hand-off call. Fading a CSS variable on
 * the root lets every element the pre-hydration CSS hid follow it, including
 * stream copies added after mount.
 *
 * @param options - The root element, reduced-motion flag, stack and hand-off callback.
 * @returns The timeline, already playing, and its re-measure function.
 */
export function buildEntranceTimeline({
  root,
  reduced,
  stack,
  onComplete,
}: EntranceTimelineOptions): EntranceTimeline {
  const duration = reduced
    ? ENTRANCE_CONFIG.reducedFadeDuration
    : ENTRANCE_CONFIG.fadeDuration;
  const tl = gsap.timeline();
  let forget = () => {};

  if (stack) {
    const added = addStack(tl, stack);
    forget = added.forget;

    // Until the deal exists, the stack dissolves, then the page fades in
    tl.to(
      stack.cards,
      {
        opacity: 0,
        duration: ENTRANCE_CONFIG.counterOutDuration,
        ease: ENTRANCE_CONFIG.counterOutEase,
      },
      added.end,
    );
    tl.set(stack.cards, { clearProps: "transform,opacity,zIndex" });
  }

  tl.fromTo(
    root,
    { [ENTRANCE_FADE_VAR]: 0 },
    { [ENTRANCE_FADE_VAR]: 1, duration, ease: "power1.out" },
  );

  // Hand the page over once everything has faded in
  tl.call(onComplete);

  return {
    timeline: tl,
    remeasure() {
      forget();
      tl.invalidate();
    },
  };
}
