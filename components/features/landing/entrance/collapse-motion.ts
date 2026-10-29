// Third-party libraries
import { gsap } from "gsap";

// Local modules
import { counterScaleRadius } from "./deal-motion";
import { ENTRANCE_CONFIG } from "./entrance-config";
import { getStackRect, getStackTransform } from "./entrance-stack";
import { removeClones, type RingCard, type SlotReader } from "./orbit-cards";

/** Lifts every clone above every real card, wherever the browser composites the stream. */
const CLONE_Z_BASE = 100;

/**
 * Stacks the ring's cards by tile, tile 0 on top, within real cards and within
 * clones. Clones sit above every real card, which looks the same because a
 * clone shows the same image as its tile.
 *
 * @param card - The card.
 * @param ring - The ring's cards.
 * @returns The card's z-index in the stack.
 */
function stackZ(card: RingCard, ring: RingCard[]) {
  const peers = ring.filter((other) => other.clone === card.clone);
  const byTile = [...peers].sort((a, b) => a.tile - b.tile);

  return (card.clone ? CLONE_Z_BASE : 0) + peers.length - byTile.indexOf(card);
}

/**
 * Adds the collapse: every card glides from the ring into the centred stack,
 * tile 0 on top.
 *
 * @param tl - The master timeline.
 * @param ring - The ring's cards.
 * @param reader - The cards' natural slots.
 * @param start - When the glide begins in seconds.
 * @returns When the glide ends in seconds.
 */
export function addCollapse(
  tl: gsap.core.Timeline,
  ring: RingCard[],
  reader: SlotReader,
  start: number,
) {
  const { collapseDuration, collapseEase } = ENTRANCE_CONFIG;
  const aim = (card: RingCard) =>
    getStackTransform(
      reader.slotOf(card),
      getStackRect(window.innerWidth, window.innerHeight),
    );

  ring.forEach((card) => {
    const sync = () => counterScaleRadius(card.el, card.radius);

    tl.set(card.el, { zIndex: stackZ(card, ring) }, start);
    tl.to(
      card.el,
      {
        x: () => aim(card).x,
        y: () => aim(card).y,
        scale: () => aim(card).scale,
        duration: collapseDuration,
        ease: collapseEase,
        onUpdate: sync,
      },
      start,
    );
  });

  return start + collapseDuration;
}

/**
 * Adds the clones' deal: each travels to the slot of the tile it copies,
 * alongside that tile's real card, fading out on the way. They are removed
 * from the document when the deal ends.
 *
 * @param tl - The master timeline.
 * @param ring - The ring's cards.
 * @param reader - The cards' natural slots.
 * @param start - When the deal begins in seconds.
 */
export function addCloneDeal(
  tl: gsap.core.Timeline,
  ring: RingCard[],
  reader: SlotReader,
  start: number,
) {
  const { dealDuration, dealEase, dealStagger, cloneFadeEase } =
    ENTRANCE_CONFIG;
  const clones = ring.filter((card) => card.clone);
  const tiles = ring.filter((card) => !card.clone);
  const homeOf = (card: RingCard) => {
    const home = tiles.find((tile) => tile.tile === card.tile)!;

    return getStackTransform(reader.slotOf(card), reader.slotOf(home));
  };

  clones.forEach((card) => {
    const sync = () => counterScaleRadius(card.el, card.radius);
    const at = start + card.tile * dealStagger;

    tl.to(
      card.el,
      {
        x: () => homeOf(card).x,
        y: () => homeOf(card).y,
        scale: () => homeOf(card).scale,
        duration: dealDuration,
        ease: dealEase,
        onUpdate: sync,
      },
      at,
    );
    tl.to(
      card.el,
      { opacity: 0, duration: dealDuration, ease: cloneFadeEase },
      at,
    );
  });

  // The clones have served their purpose once the last card is home
  const span = dealDuration + dealStagger * Math.max(tiles.length - 1, 0);
  tl.call(() => removeClones(ring), undefined, start + span);
}
