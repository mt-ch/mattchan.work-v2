// Third-party libraries
import { gsap } from "gsap";

// Local modules
import type { Counter } from "./counter-motion";
import { addCollapse } from "./collapse-motion";
import { counterScaleRadius } from "./deal-motion";
import { ENTRANCE_CONFIG } from "./entrance-config";
import { getStackTransform } from "./entrance-stack";
import {
  createRingCards,
  createSlotReader,
  type RingCard,
  type SlotReader,
} from "./orbit-cards";
import { getRingGeometry, getSlotPoint } from "./orbit-geometry";

/** Label on the master timeline where the collapse begins. */
export const COLLAPSE_LABEL = "collapse";

/** The orbit phase's parts. */
export type OrbitParts = {
  /** The Entrance root; clones are added to it. */
  root: HTMLElement;
  /** The tiles that loaded, in tile order: the first is the top of the stack. */
  cards: HTMLElement[];
  counter: Counter;
};

/**
 * Works out the transform that fits a card on the ring slot at a given turn.
 *
 * @param card - The card.
 * @param slot - Its ring slot index.
 * @param reader - The cards' natural slots.
 * @param turn - How far the ring has turned in radians.
 * @returns The x and y offset in px and the scale.
 */
function ringTransform(
  card: RingCard,
  slot: number,
  reader: SlotReader,
  turn: number,
) {
  const ring = getRingGeometry(window.innerWidth, window.innerHeight);
  const { x, y } = getSlotPoint(ring, slot, ENTRANCE_CONFIG.ringCount, turn);
  const box = {
    left: x - ring.cardWidth / 2,
    top: y - ring.cardHeight / 2,
    width: ring.cardWidth,
    height: ring.cardHeight,
  };

  return getStackTransform(reader.slotOf(card), box);
}

/**
 * Adds one card's pop-in: it scales up and fades in, its corners counter-scaled.
 *
 * @param tl - The master timeline.
 * @param card - The card.
 * @param to - The card's ring scale.
 * @param at - When the pop starts in seconds.
 */
function addPop(
  tl: gsap.core.Timeline,
  card: RingCard,
  to: () => number,
  at: number,
) {
  const { popDuration, popEase, popFadeShare, popFromScale } = ENTRANCE_CONFIG;
  const sync = () => counterScaleRadius(card.el, card.radius);

  tl.fromTo(
    card.el,
    { scale: () => to() * popFromScale },
    { scale: to, duration: popDuration, ease: popEase, onUpdate: sync },
    at,
  );
  const fade = { duration: popDuration * popFadeShare, ease: "none" };
  tl.to(card.el, { opacity: 1, ...fade }, at);
}

/**
 * Adds the ring's constant clockwise turn from the first pop, then its ease to
 * a stop. The stop's distance is chosen so the speed carries on unbroken.
 *
 * @param tl - The master timeline.
 * @param place - Moves every card to the ring's current turn.
 * @param spin - The turn in radians, written by the tweens.
 * @param stopAt - When the rotation starts to ease out in seconds.
 */
function addSpin(
  tl: gsap.core.Timeline,
  place: () => void,
  spin: { turn: number },
  stopAt: number,
) {
  const { ringPeriod, ringStopDuration, ringStopEase } = ENTRANCE_CONFIG;
  const speed = (2 * Math.PI) / ringPeriod;
  const coast = speed * stopAt;

  // An ease's opening slope is how much faster than linear it starts
  const slope = gsap.parseEase(ringStopEase)(0.001) / 0.001;
  const stop = (speed * ringStopDuration) / slope;

  tl.fromTo(
    spin,
    { turn: 0 },
    { turn: coast, duration: stopAt, ease: "none", onUpdate: place },
    0,
  );
  tl.fromTo(
    spin,
    { turn: coast },
    {
      turn: coast + stop,
      duration: ringStopDuration,
      ease: ringStopEase,
      onUpdate: place,
      immediateRender: false,
    },
    stopAt,
  );
}

/**
 * Parks every card on its slot, hidden until its pop and newest on top, and
 * adds the pops on a fixed stagger.
 *
 * @param tl - The master timeline.
 * @param ring - The ring's cards.
 * @param reader - The cards' natural slots.
 */
function addPops(tl: gsap.core.Timeline, ring: RingCard[], reader: SlotReader) {
  const { popStagger, popFromScale } = ENTRANCE_CONFIG;

  ring.forEach((card, i) => {
    const at = () => ringTransform(card, i, reader, 0);
    const from = () => at().scale * popFromScale;

    tl.set(
      card.el,
      {
        x: () => at().x,
        y: () => at().y,
        scale: from,
        opacity: 0,
        zIndex: i + 1,
        // A clone has no layout of its own, so it is sized as a stack card
        ...(card.clone && {
          width: () => reader.slotOf(card).width,
          height: () => reader.slotOf(card).height,
        }),
        borderRadius: () => `${card.radius / from()}px`,
      },
      0,
    );
    addPop(tl, card, () => at().scale, i * popStagger);
  });
}

/**
 * Adds the orbit phase and the collapse: cards pop onto the ring newest on
 * top while it turns and the counter runs to 100; then the counter blurs out,
 * the turn eases to a stop and every card glides into the centred stack.
 *
 * @param tl - The master timeline.
 * @param parts - The root, loaded tiles and counter.
 * @returns When the collapse ends in seconds, the ring's cards and their slot reader.
 */
export function addOrbit(tl: gsap.core.Timeline, parts: OrbitParts) {
  const { root, cards, counter } = parts;
  const { popStagger, popDuration, ringCount, ringStopDuration } =
    ENTRANCE_CONFIG;
  const ring = createRingCards(root, cards, ringCount);
  const reader = createSlotReader();
  const spin = { turn: 0 };
  const place = () =>
    ring.forEach((card, i) => {
      const { x, y } = ringTransform(card, i, reader, spin.turn);
      gsap.set(card.el, { x, y });
    });

  // With no card to show, the counter simply leaves
  if (ring.length === 0) {
    tl.add(counter.hide(), 0);

    return { end: 0, ring, reader };
  }

  addPops(tl, ring, reader);

  // The counter reaches 100 as the newest card settles, then the collapse begins
  const popsEnd = (ring.length - 1) * popStagger + popDuration;
  tl.add(counter.run(popsEnd), 0);
  tl.addLabel(COLLAPSE_LABEL, popsEnd);
  tl.add(counter.hide(), popsEnd);

  // The rotation eases out once the counter has gone, then the cards glide in
  const stopAt = popsEnd + ENTRANCE_CONFIG.counterOutDuration;
  addSpin(tl, place, spin, stopAt);

  return {
    end: addCollapse(tl, ring, reader, stopAt + ringStopDuration),
    ring,
    reader,
  };
}
