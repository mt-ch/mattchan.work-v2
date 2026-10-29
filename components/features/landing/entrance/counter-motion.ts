// Third-party libraries
import { gsap } from "gsap";

// Local modules
import { ENTRANCE_CONFIG } from "./entrance-config";
import type { StackRect } from "./entrance-stack";

/** The Entrance counter's motion: blur in, climb with loading, run, blur out. */
export type Counter = {
  /** Blurs the pill in. */
  show: () => gsap.core.Tween;
  /** Moves the pill beside the stack's top-right corner. */
  place: (stack: StackRect) => void;
  /** Climbs towards the load phase's share of 100, never going backwards. */
  loadTo: (fraction: number) => void;
  /** Stops the load-phase climb; the stack phase continues from the load share. */
  endLoad: () => void;
  /** Runs from the load share to 100 over the given seconds. */
  run: (duration: number) => gsap.core.Tween;
  /** Blurs the pill out with no movement. */
  hide: () => gsap.core.Tween;
  /** Kills the counter's tweens. */
  destroy: () => void;
};

const blur = (px: number) => `blur(${px}px)`;

/**
 * Blurs the pill in from the first frame.
 *
 * @param el - The counter pill.
 * @returns The tween.
 */
function blurIn(el: HTMLElement) {
  return gsap.fromTo(
    el,
    { opacity: 0, filter: blur(ENTRANCE_CONFIG.counterBlur) },
    {
      opacity: 1,
      filter: blur(0),
      duration: ENTRANCE_CONFIG.counterInDuration,
      ease: ENTRANCE_CONFIG.counterInEase,
    },
  );
}

/**
 * Blurs the pill out, with no movement.
 *
 * @param el - The counter pill.
 * @returns The tween.
 */
function blurOut(el: HTMLElement) {
  return gsap.to(el, {
    opacity: 0,
    filter: blur(ENTRANCE_CONFIG.counterBlur),
    duration: ENTRANCE_CONFIG.counterOutDuration,
    ease: ENTRANCE_CONFIG.counterOutEase,
  });
}

/**
 * Creates the counter's motion over its pill element.
 *
 * @param el - The counter pill.
 * @returns The counter's controls.
 */
export function createCounter(el: HTMLElement): Counter {
  const { counterLoadShare, counterSmoothing, counterGap } = ENTRANCE_CONFIG;
  const state = { n: 0 };
  const onUpdate = () => {
    el.textContent = String(Math.round(state.n));
  };

  return {
    show: () => blurIn(el),
    place(stack) {
      gsap.set(el, {
        xPercent: -100,
        yPercent: -100,
        x: stack.left + stack.width,
        y: stack.top - counterGap,
      });
    },
    loadTo(fraction) {
      // A new target starts from the current value, so the counter only climbs
      gsap.to(state, {
        n: counterLoadShare * fraction,
        duration: counterSmoothing,
        ease: "none",
        overwrite: true,
        onUpdate,
      });
    },
    endLoad: () => gsap.killTweensOf(state),
    run: (duration) =>
      gsap.fromTo(
        state,
        { n: counterLoadShare },
        { n: 100, duration, ease: "none", onUpdate, immediateRender: false },
      ),
    hide: () => blurOut(el),
    destroy: () => gsap.killTweensOf([el, state]),
  };
}
