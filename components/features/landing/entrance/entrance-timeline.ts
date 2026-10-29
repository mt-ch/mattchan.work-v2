// Third-party libraries
import { gsap } from "gsap";

// Local modules
import { addCloneDeal } from "./collapse-motion";
import type { Counter } from "./counter-motion";
import { addDeal, addSidebar } from "./deal-motion";
import { ENTRANCE_CONFIG } from "./entrance-config";
import { removeClones, type RingCard, type SlotReader } from "./orbit-cards";
import { addOrbit, COLLAPSE_LABEL } from "./orbit-motion";

/** What the orbit plays with: the tiles that loaded and the counter. */
export type StackParts = {
  /** The tiles that loaded, in tile order: the first is the top of the stack. */
  cards: HTMLElement[];
  counter: Counter;
};

/** CSS variable the Entrance fades; the pre-hydration CSS reads it as opacity. */
export const ENTRANCE_FADE_VAR = "--entrance-fade";

export type EntranceTimelineOptions = {
  /** The Entrance root; the fade variable is set on it. */
  root: HTMLElement;
  /** Play the 0.4s reduced-motion fade instead of the full Entrance. */
  reduced: boolean;
  /** The tiles and counter to play before the fade; omitted for the fade alone. */
  stack?: StackParts;
  /** Called once, as the timeline's final step. */
  onComplete: () => void;
};

/** The master timeline and how to keep it in place across a resize. */
export type EntranceTimeline = {
  timeline: gsap.core.Timeline;
  /** Re-measures the ring's slots and keeps the timeline's place; snaps to the end once collapsing. */
  remeasure: () => void;
  /** Snaps the timeline to its finished state. */
  finish: () => void;
  /** Stops the timeline and removes any clones still in the document. */
  dispose: () => void;
};

/**
 * Adds the deal, the clones' deal and the sidebar fade after the collapse.
 *
 * @param tl - The master timeline.
 * @param root - The Entrance root.
 * @param stack - The tiles and counter being played.
 * @param orbit - When the collapse ended, and the ring's cards and slot reader.
 * @returns When the deal and sidebar fade end in seconds.
 */
function addDealAndSidebar(
  tl: gsap.core.Timeline,
  root: HTMLElement,
  stack: StackParts,
  orbit: { end: number; ring: RingCard[]; reader: SlotReader },
) {
  const tiles = Array.from(
    root.querySelectorAll<HTMLElement>('[data-entrance="tile"]'),
  );
  const others = tiles.filter((tile) => !stack.cards.includes(tile));
  const sidebar = root.querySelector<HTMLElement>('[data-entrance="sidebar"]');

  const dealEnd = addDeal(tl, stack.cards, others, orbit.end);
  addCloneDeal(tl, orbit.ring, orbit.reader, orbit.end);

  return addSidebar(tl, sidebar, dealEnd);
}

/**
 * Adds the page fade: the root's fade variable from 0 to 1.
 *
 * @param tl - The master timeline.
 * @param root - The Entrance root.
 * @param reduced - Whether to use the reduced-motion duration.
 */
function addPageFade(
  tl: gsap.core.Timeline,
  root: HTMLElement,
  reduced: boolean,
) {
  const duration = reduced
    ? ENTRANCE_CONFIG.reducedFadeDuration
    : ENTRANCE_CONFIG.fadeDuration;

  tl.fromTo(
    root,
    { [ENTRANCE_FADE_VAR]: 0 },
    { [ENTRANCE_FADE_VAR]: 1, duration, ease: "power1.out" },
  );
}

/**
 * Builds the Entrance's master timeline. With a stack it runs the orbit, the
 * collapse, the deal and the sidebar fade; without one it is a page fade. Either way it ends
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
  let ring: RingCard[] = [];

  if (stack) {
    const orbit = addOrbit(tl, { root, ...stack });
    ({ ring } = orbit);
    forget = orbit.reader.forget;
    addDealAndSidebar(tl, root, stack, orbit);
  } else {
    addPageFade(tl, root, reduced);
  }

  // Hand the page over once everything has faded in
  tl.call(onComplete);

  return {
    timeline: tl,
    remeasure() {
      // Once the collapse has begun the layout takes over, so finish instead of re-aiming
      if (tl.time() >= (tl.labels[COLLAPSE_LABEL] ?? Infinity)) {
        tl.progress(1);
        return;
      }

      forget();
      tl.invalidate();
    },
    finish: () => tl.progress(1),
    dispose() {
      tl.kill();
      removeClones(ring);
    },
  };
}
