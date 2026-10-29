// Shared modules
import { getDesktop } from "@/lib/motion/environment";

// Local modules
import { createCounter, type Counter } from "./counter-motion";
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

/** The master timeline once the gate has opened, and how to unmount its dev tools. */
type StackRun = { master?: EntranceTimeline; stopDevTools: () => void };

/**
 * Ends the counter's load phase, builds the master timeline for the cards that
 * loaded and mounts the dev tools.
 *
 * @param run - The run to fill in.
 * @param options - The root, stack tiles, which of them loaded, counter and hand-off callback.
 */
function startMaster(
  run: StackRun,
  options: {
    root: HTMLElement;
    tiles: HTMLElement[];
    loaded: boolean[];
    counter: Counter;
    onComplete: () => void;
  },
) {
  const { root, tiles, loaded, counter, onComplete } = options;
  counter.endLoad();

  const cards = tiles.filter((_, i) => loaded[i]);
  const stack = { cards, counter };
  run.master = buildEntranceTimeline({
    root,
    reduced: false,
    stack,
    onComplete,
  });
  run.stopDevTools = mountEntranceDevTools(run.master.timeline);
}

/**
 * Watches the viewport for a resize (debounced to a frame) and for crossing
 * the desktop breakpoint.
 *
 * @param onResize - Called after a burst of resize events.
 * @param onBreakpoint - Called when the desktop breakpoint is crossed.
 * @returns A function that stops watching.
 */
function watchViewport(onResize: () => void, onBreakpoint: () => void) {
  const debounced = rafDebounce(onResize);
  const desktop = getDesktop();
  window.addEventListener("resize", debounced);
  desktop.addEventListener("change", onBreakpoint);

  return () => {
    window.removeEventListener("resize", debounced);
    desktop.removeEventListener("change", onBreakpoint);
    debounced.cancel();
  };
}

/**
 * Plays the Load and Stack phases: the counter blurs in and climbs with the
 * stack images' loading; once all of them have settled the cards that loaded
 * pop in, deal out into the stream and the sidebar fades in. A resize during
 * the deal, or crossing the desktop breakpoint, snaps to the finished state.
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
  const run: StackRun = { master: undefined, stopDevTools: () => {} };
  let [cancelled, crossed] = [false, false];

  const place = () => {
    counter.place(getStackRect(window.innerWidth, window.innerHeight));
  };
  place();
  counter.show();

  // Build the stack from the cards that loaded, once all have settled
  const images = tiles.map((tile) => tile.querySelector("img")!);
  waitForImages(images, (n) => counter.loadTo(n / tiles.length)).then(
    (loaded) => {
      if (cancelled) return;

      startMaster(run, { root, tiles, loaded, counter, onComplete });

      // The breakpoint was crossed while the images loaded
      if (crossed) run.master?.finish();
    },
  );

  // A resize keeps the stack centred; crossing the breakpoint ends the Entrance
  const stopWatching = watchViewport(
    () => {
      place();
      run.master?.remeasure();
    },
    () => {
      crossed = true;
      run.master?.finish();
    },
  );

  return () => {
    cancelled = true;
    stopWatching();
    run.stopDevTools();
    run.master?.timeline.kill();
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
