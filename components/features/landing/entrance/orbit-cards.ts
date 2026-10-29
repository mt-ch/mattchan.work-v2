// Third-party libraries
import { gsap } from "gsap";

// Local modules
import { naturalRadius } from "./deal-motion";
import { getStackRect, type StackRect } from "./entrance-stack";

/** One card on the orbit ring: a real tile, or a clone of one. */
export type RingCard = {
  el: HTMLElement;
  /** Index into the loaded tiles of the tile this card shows. */
  tile: number;
  /** True for a clone: a throwaway copy that is removed when the deal ends. */
  clone: boolean;
  /** The real tile's natural corner radius in px, kept on screen while scaled. */
  radius: number;
};

/**
 * Measures where a real tile sits with no transform applied. Scaling is about
 * the centre, so removing the current translation recovers the natural centre.
 *
 * @param el - The tile.
 * @returns The tile's natural slot in viewport pixels.
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
 * Creates a clone of a tile: a fixed, top-left anchored box showing the same
 * image URL, so the browser reuses the download. It is hidden from assistive
 * technology and ignores input.
 *
 * @param source - The real tile to copy.
 * @returns The clone, not yet in the document.
 */
function createClone(source: HTMLElement) {
  const sourceImg = source.querySelector("img");
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.setAttribute("data-entrance-clone", "");
  Object.assign(el.style, {
    position: "fixed",
    left: "0",
    top: "0",
    overflow: "hidden",
    pointerEvents: "none",
    opacity: "0",
  });

  const img = document.createElement("img");
  img.alt = "";
  img.draggable = false;
  img.src = sourceImg?.currentSrc || sourceImg?.src || "";
  Object.assign(img.style, {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  });
  // Decode ahead of the first pop so the card never paints half-ready
  img.decode().catch(() => {});

  el.append(img);

  return el;
}

/**
 * Lays out the ring's cards: the real tiles fill the first slots in tile
 * order, then clones of them, repeating, fill the rest.
 *
 * @param root - The Entrance root; clones are appended to it.
 * @param tiles - The real tiles that loaded, in tile order.
 * @param count - How many slots the ring has.
 * @returns The ring's cards in slot order, real tiles first.
 */
export function createRingCards(
  root: HTMLElement,
  tiles: HTMLElement[],
  count: number,
): RingCard[] {
  if (tiles.length === 0) return [];

  return Array.from({ length: Math.max(count, tiles.length) }, (_, i) => {
    const tile = i % tiles.length;
    const clone = i >= tiles.length;
    const el = clone ? createClone(tiles[tile]) : tiles[tile];
    if (clone) root.append(el);

    return { el, tile, clone, radius: naturalRadius(tiles[tile]) };
  });
}

/**
 * Removes every clone from the document.
 *
 * @param ring - The ring's cards.
 */
export function removeClones(ring: RingCard[]) {
  ring.forEach((card) => card.clone && card.el.remove());
}

/**
 * Remembers each card's natural slot, so a layout is measured once rather than
 * once per animated property. A clone's slot is the stack-sized box at the
 * viewport's top-left.
 *
 * @returns The lookup, and a function that forgets every measurement.
 */
export function createSlotReader() {
  const measured = new Map<HTMLElement, StackRect>();

  const slotOf = (card: RingCard): StackRect => {
    if (card.clone) {
      const { width, height } = getStackRect(
        window.innerWidth,
        window.innerHeight,
      );

      return { left: 0, top: 0, width, height };
    }

    const known = measured.get(card.el);
    if (known) return known;

    const next = naturalSlot(card.el);
    measured.set(card.el, next);

    return next;
  };

  return { slotOf, forget: () => measured.clear() };
}

/** Looks up a card's natural slot. */
export type SlotReader = ReturnType<typeof createSlotReader>;
