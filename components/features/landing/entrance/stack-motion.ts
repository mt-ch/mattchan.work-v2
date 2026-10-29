// Third-party libraries
import { gsap } from "gsap";

// Local modules
import { counterScaleRadius, naturalRadius } from "./deal-motion";
import type { Counter } from "./counter-motion";
import { ENTRANCE_CONFIG } from "./entrance-config";
import {
  getStackRect,
  getStackTransform,
  type StackRect,
  type StackTransform,
} from "./entrance-stack";

/** The stack phase's parts. */
export type StackParts = {
  /** The cards that loaded, in tile order: the first is the top of the stack. */
  cards: HTMLElement[];
  counter: Counter;
};

/**
 * Measures where a card sits with no transform applied. Scaling is about the
 * centre, so removing the current translation recovers the natural centre.
 *
 * @param el - The card.
 * @returns The card's natural slot in viewport pixels.
 */
function naturalSlot(el: HTMLElement): StackRect {
  const rect = el.getBoundingClientRect();
  const x = parseFloat(String(gsap.getProperty(el, "x")));
  const y = parseFloat(String(gsap.getProperty(el, "y")));
  const { offsetWidth: width, offsetHeight: height } = el;

  return {
    left: rect.left + rect.width / 2 - x - width / 2,
    top: rect.top + rect.height / 2 - y - height / 2,
    width,
    height,
  };
}

/**
 * Remembers each card's transform into the stack, so a layout is measured once
 * rather than once per animated property.
 *
 * @returns The lookup, and a function that forgets every measurement.
 */
function createStackMeasurer() {
  const measured = new Map<HTMLElement, StackTransform>();

  const transformOf = (el: HTMLElement) => {
    const known = measured.get(el);
    if (known) return known;

    const next = getStackTransform(
      naturalSlot(el),
      getStackRect(window.innerWidth, window.innerHeight),
    );
    measured.set(el, next);

    return next;
  };

  return { transformOf, forget: () => measured.clear() };
}

/**
 * Adds one card's pop-in: it scales up and fades in, its corners counter-scaled
 * so they match the deal's from the first frame.
 *
 * @param tl - The master timeline.
 * @param el - The card.
 * @param from - Where the card's scale starts.
 * @param to - Where the card's scale ends.
 * @param at - When the pop starts in seconds.
 */
function addPop(
  tl: gsap.core.Timeline,
  el: HTMLElement,
  from: () => number,
  to: () => number,
  at: number,
) {
  const { popDuration, popEase, popFadeShare } = ENTRANCE_CONFIG;
  const sync = () => counterScaleRadius(el, naturalRadius(el));

  tl.fromTo(
    el,
    { scale: from },
    { scale: to, duration: popDuration, ease: popEase, onUpdate: sync },
    at,
  );
  const fade = { duration: popDuration * popFadeShare, ease: "none" };
  tl.to(el, { opacity: 1, ...fade }, at);
}

/**
 * Adds the stack phase: every card pops in on top of the last, tile 4 first
 * and tile 0 last, while the counter runs to 100 and then blurs out.
 *
 * @param tl - The master timeline.
 * @param parts - The cards and counter.
 * @returns When the stack phase ends in seconds, and how to re-measure after a resize.
 */
export function addStack(tl: gsap.core.Timeline, parts: StackParts) {
  const { cards, counter } = parts;
  const { popStagger, popDuration, popFromScale } = ENTRANCE_CONFIG;
  const { transformOf, forget } = createStackMeasurer();
  const fromScale = (el: HTMLElement) => () =>
    transformOf(el).scale * popFromScale;

  // With no card to show, the counter simply leaves
  if (cards.length === 0) {
    tl.add(counter.hide(), 0);

    return { end: 0, forget };
  }

  // Stack the cards, tile 0 on top, hidden until their pop
  cards.forEach((el, i) => {
    tl.set(el, {
      x: () => transformOf(el).x,
      y: () => transformOf(el).y,
      scale: fromScale(el),
      opacity: 0,
      zIndex: cards.length - i,
      borderRadius: () => `${naturalRadius(el) / fromScale(el)()}px`,
    });
  });

  // Pop them in from the last tile to the first
  [...cards].reverse().forEach((el, k) => {
    addPop(tl, el, fromScale(el), () => transformOf(el).scale, k * popStagger);
  });

  // The counter reaches 100 as the top card settles, then blurs out
  const end = (cards.length - 1) * popStagger + popDuration;
  tl.add(counter.run(end), 0);
  tl.add(counter.hide(), end);

  return { end, forget };
}
