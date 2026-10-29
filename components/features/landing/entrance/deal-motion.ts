// Third-party libraries
import { gsap } from "gsap";

// Local modules
import { ENTRANCE_CONFIG } from "./entrance-config";

/** Label on the master timeline where the deal begins. */
export const DEAL_LABEL = "deal";

/** Each card's stylesheet radius, read once before the Entrance overrides it. */
const naturalRadii = new WeakMap<HTMLElement, number>();

/**
 * Reads a card's natural corner radius. The first read is remembered, because
 * the Entrance then overrides the radius inline.
 *
 * @param el - The card.
 * @returns The radius in px.
 */
export function naturalRadius(el: HTMLElement) {
  const known = naturalRadii.get(el);
  if (known !== undefined) return known;

  const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
  naturalRadii.set(el, radius);

  return radius;
}

/**
 * Keeps a card's corners the same size on screen while it is scaled, by
 * dividing its natural radius by its current scale.
 *
 * @param el - The card.
 * @param radius - The card's natural corner radius in px.
 */
export function counterScaleRadius(el: HTMLElement, radius: number) {
  const scale = Number(gsap.getProperty(el, "scale")) || 1;
  el.style.borderRadius = `${radius / scale}px`;
}

/**
 * Seconds the whole deal takes: the last card starts after every stagger.
 *
 * @param cardCount - How many cards are dealt.
 * @returns The deal's length in seconds.
 */
function dealSpan(cardCount: number) {
  const { dealDuration, dealStagger } = ENTRANCE_CONFIG;

  return dealDuration + dealStagger * Math.max(cardCount - 1, 0);
}

/**
 * Adds one card's travel from the stack to its slot, counter-scaling its corners.
 *
 * @param tl - The master timeline.
 * @param el - The card.
 * @param at - When the card starts in seconds.
 */
function addCardDeal(tl: gsap.core.Timeline, el: HTMLElement, at: number) {
  const config = ENTRANCE_CONFIG;
  const radius = naturalRadius(el);
  const sync = () => counterScaleRadius(el, radius);

  tl.to(
    el,
    {
      x: 0,
      y: 0,
      scale: 1,
      duration: config.dealDuration,
      ease: config.dealEase,
      onStart: sync,
      onUpdate: sync,
    },
    at,
  );
}

/**
 * Adds the deal: the stacked cards travel back to their natural slots, tile 0
 * first, while every other node fades in and rises over the deal's last half.
 *
 * @param tl - The master timeline.
 * @param cards - The stacked cards, top of the stack first.
 * @param others - Every other tile node: the rest of the column and any dropped card.
 * @param start - When the deal begins in seconds.
 * @returns When the deal ends in seconds.
 */
export function addDeal(
  tl: gsap.core.Timeline,
  cards: HTMLElement[],
  others: HTMLElement[],
  start: number,
) {
  const config = ENTRANCE_CONFIG;
  const span = dealSpan(cards.length);
  tl.addLabel(DEAL_LABEL, start);

  // Deal each card to its slot, tile 0 first
  cards.forEach((el, i) => addCardDeal(tl, el, start + i * config.dealStagger));

  // Hand the cards back to the layout once they are home
  tl.set(cards, { clearProps: "transform,zIndex,borderRadius" }, start + span);

  // The rest of the column fades in and rises over the last share of the deal
  const fadeSpan = span * config.dealFadeShare;
  tl.fromTo(
    others,
    { opacity: 0, y: config.dealFadeOffset },
    {
      opacity: 1,
      y: 0,
      duration: fadeSpan,
      ease: config.dealFadeEase,
      clearProps: "transform",
      immediateRender: false,
    },
    start + span - fadeSpan,
  );

  return start + span;
}

/**
 * Adds the sidebar fade: the whole sidebar as one block, starting before the
 * deal ends.
 *
 * @param tl - The master timeline.
 * @param sidebar - The sidebar element, if the page has one.
 * @param dealEnd - When the deal ends in seconds.
 * @returns When the sidebar finishes in seconds.
 */
export function addSidebar(
  tl: gsap.core.Timeline,
  sidebar: HTMLElement | null,
  dealEnd: number,
) {
  const { sidebarDuration, sidebarEase, sidebarOverlap } = ENTRANCE_CONFIG;
  const start = Math.max(dealEnd - sidebarOverlap, 0);
  if (!sidebar) return dealEnd;

  tl.fromTo(
    sidebar,
    { opacity: 0 },
    { opacity: 1, duration: sidebarDuration, ease: sidebarEase },
    start,
  );

  return Math.max(dealEnd, start + sidebarDuration);
}
