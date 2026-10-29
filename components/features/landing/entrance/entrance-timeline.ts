// Third-party libraries
import { gsap } from "gsap";

// Local modules
import { addDeal, addSidebar, DEAL_LABEL } from "./deal-motion";
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
  /** Re-measures the stack's slots and keeps the timeline's place; snaps to the end once dealing. */
  remeasure: () => void;
  /** Snaps the timeline to its finished state. */
  finish: () => void;
};

/**
 * Adds the deal and the sidebar fade after the stack, ending with the hand-off.
 *
 * @param tl - The master timeline.
 * @param root - The Entrance root.
 * @param stack - The stack that has just been added.
 * @param stackEnd - When the stack phase ends in seconds.
 * @returns When the deal and sidebar fade end in seconds.
 */
function addDealAndSidebar(
  tl: gsap.core.Timeline,
  root: HTMLElement,
  stack: StackParts,
  stackEnd: number,
) {
  const tiles = Array.from(
    root.querySelectorAll<HTMLElement>('[data-entrance="tile"]'),
  );
  const others = tiles.filter((tile) => !stack.cards.includes(tile));
  const sidebar = root.querySelector<HTMLElement>('[data-entrance="sidebar"]');

  const dealEnd = addDeal(tl, stack.cards, others, stackEnd);

  return addSidebar(tl, sidebar, dealEnd);
}

/**
 * Builds the Entrance's master timeline. With a stack it runs the stack, the
 * deal and the sidebar fade; without one it is a page fade. Either way it ends
 * with the hand-off call. Fading a CSS variable on the root lets every element
 * the pre-hydration CSS hid follow it, including stream copies added after mount.
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
  const tl = gsap.timeline();
  let forget = () => {};

  if (stack) {
    const added = addStack(tl, stack);
    forget = added.forget;
    addDealAndSidebar(tl, root, stack, added.end);
  } else {
    const duration = reduced
      ? ENTRANCE_CONFIG.reducedFadeDuration
      : ENTRANCE_CONFIG.fadeDuration;
    tl.fromTo(
      root,
      { [ENTRANCE_FADE_VAR]: 0 },
      { [ENTRANCE_FADE_VAR]: 1, duration, ease: "power1.out" },
    );
  }

  // Hand the page over once everything has faded in
  tl.call(onComplete);

  return {
    timeline: tl,
    remeasure() {
      // Past the stack the layout takes over, so finish instead of re-aiming
      if (tl.time() >= (tl.labels[DEAL_LABEL] ?? Infinity)) {
        tl.progress(1);
        return;
      }

      forget();
      tl.invalidate();
    },
    finish: () => tl.progress(1),
  };
}
