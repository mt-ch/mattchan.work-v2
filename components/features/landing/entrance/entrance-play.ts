// Shared modules
import { getDesktop } from "@/lib/motion/environment";

// Local modules
import { createCounter } from "./counter-motion";
import { ENTRANCE_CONFIG } from "./entrance-config";
import { mountEntranceDevTools } from "./entrance-devtools";
import { waitForImages } from "./entrance-gate";
import { getStackRect } from "./entrance-stack";
import {
  buildEntranceTimeline,
  type EntranceTimeline,
} from "./entrance-timeline";

/** Attribute on a stack tile holding its place in the stack (0 is the top). */
export const STACK_INDEX_ATTRIBUTE = "data-stack-index";

/**
 * Plays the page fade alone.
 *
 * @param root - The Entrance root.
 * @param reduced - Whether to use the reduced-motion fade.
 * @param onComplete - Called when the fade has finished.
 * @returns A function that stops it.
 */
function playFade(root: HTMLElement, reduced: boolean, onComplete: () => void) {
  const { timeline } = buildEntranceTimeline({ root, reduced, onComplete });
  const removeDevTools = mountEntranceDevTools(timeline);

  return () => {
    removeDevTools();
    timeline.kill();
  };
}

/**
 * Finds the stack's tiles in stack order.
 *
 * @param root - The Entrance root.
 * @returns The tiles that carry a stack index, top of the stack first.
 */
function findStackTiles(root: HTMLElement) {
  const tiles = Array.from(
    root.querySelectorAll<HTMLElement>(`[${STACK_INDEX_ATTRIBUTE}]`),
  );

  return tiles.sort(
    (a, b) =>
      Number(a.getAttribute(STACK_INDEX_ATTRIBUTE)) -
      Number(b.getAttribute(STACK_INDEX_ATTRIBUTE)),
  );
}

/**
 * Calls a function on the next frame after the last call, so a burst of resize
 * events re-measures once.
 *
 * @param fn - The function to run.
 * @returns The debounced function, with a `cancel` method.
 */
function rafDebounce(fn: () => void) {
  let frame = 0;
  const debounced = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(fn);
  };
  debounced.cancel = () => cancelAnimationFrame(frame);

  return debounced;
}

/**
 * Plays the Load and Stack phases: the counter blurs in and climbs with the
 * stack images' loading; once all of them have settled the cards that loaded
 * pop in, and the page fades in.
 *
 * @param root - The Entrance root.
 * @param tiles - The stack tiles, top of the stack first.
 * @param counterEl - The counter pill.
 * @param onComplete - Called when the Entrance has finished.
 * @returns A function that stops it.
 */
function playStack(
  root: HTMLElement,
  tiles: HTMLElement[],
  counterEl: HTMLElement,
  onComplete: () => void,
) {
  const counter = createCounter(counterEl);
  let master: EntranceTimeline | undefined;
  let removeDevTools = () => {};
  let cancelled = false;

  const place = () =>
    counter.place(getStackRect(window.innerWidth, window.innerHeight));
  place();
  counter.show();

  // Build the stack from the cards that loaded, once all have settled
  const images = tiles.map((tile) => tile.querySelector("img")!);
  const onSettle = (settled: number) => counter.loadTo(settled / tiles.length);
  waitForImages(images, onSettle).then((loaded) => {
    if (cancelled) return;

    counter.endLoad();
    const cards = tiles.filter((_, i) => loaded[i]);
    const stack = { cards, counter };
    master = buildEntranceTimeline({ root, reduced: false, stack, onComplete });
    removeDevTools = mountEntranceDevTools(master.timeline);
  });

  // A resize keeps the stack centred and the timeline in place
  const onResize = rafDebounce(() => {
    place();
    master?.remeasure();
  });
  window.addEventListener("resize", onResize);

  return () => {
    cancelled = true;
    window.removeEventListener("resize", onResize);
    onResize.cancel();
    removeDevTools();
    master?.timeline.kill();
    counter.destroy();
  };
}

/**
 * Plays the Entrance that suits the visit: the full Load and Stack on desktop,
 * and the page fade for reduced motion, below the desktop breakpoint or when
 * there is no stack to show.
 *
 * @param root - The Entrance root.
 * @param reduced - Whether reduced motion is requested.
 * @param onComplete - Called when the Entrance has finished.
 * @returns A function that stops it.
 */
export function playEntrance(
  root: HTMLElement,
  reduced: boolean,
  onComplete: () => void,
) {
  const tiles = findStackTiles(root).slice(0, ENTRANCE_CONFIG.stackSize);
  const counterEl = root.querySelector<HTMLElement>(
    '[data-entrance="counter"]',
  );

  if (reduced || !getDesktop().matches || !counterEl || tiles.length === 0) {
    return playFade(root, reduced, onComplete);
  }

  return playStack(root, tiles, counterEl, onComplete);
}
