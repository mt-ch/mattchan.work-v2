// Third-party libraries
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";

// Shared modules
import { getReducedMotion } from "@/lib/motion/environment";

// Local modules
import type { MotionController } from "./motion-controller";
import { BOOST_GAIN, advanceMotion, wrapOffset } from "./stream-math";

gsap.registerPlugin(Observer);

/** Mutable motion state shared by the carousel's helpers. */
type CarouselState = {
  offset: number;
  boost: number;
  setWidth: number;
  viewportWidth: number;
  centred: boolean;
};

export type CarouselOptions = {
  viewport: HTMLElement;
  track: HTMLElement;
  /** Number of tiles in one copy of the set. */
  tileCount: number;
  /** Called when a swipe starts. */
  onPress: () => void;
  /** Called with the horizontal distance (px) each swipe step moved. */
  onSwipe: (distance: number) => void;
  /** Called with how many copies of the set the viewport needs to stay full. */
  onCopiesNeeded: (needed: number) => void;
};

/**
 * Reads the layout of the first copy of the set, reports how many copies the
 * viewport needs, and centres the first Project the first time it can.
 *
 * @param state - Motion state to update with the measurements.
 * @param options - The carousel's elements and callbacks.
 */
function measure(state: CarouselState, options: CarouselOptions) {
  const { viewport, track, tileCount, onCopiesNeeded } = options;
  state.viewportWidth = viewport.clientWidth;

  // Read the width of one copy of the set
  const first = track.children[0] as HTMLElement | undefined;
  const nextCopy = track.children[tileCount] as HTMLElement | undefined;
  state.setWidth = nextCopy ? nextCopy.offsetLeft : 0;

  // Ask for enough copies that the carousel always fills the viewport
  if (state.setWidth > 0) {
    onCopiesNeeded(Math.ceil(state.viewportWidth / state.setWidth) + 2);
  }

  // Start with the first Project centred, neighbours peeking
  if (first && !state.centred && state.viewportWidth > 0) {
    state.offset =
      first.offsetLeft + first.offsetWidth / 2 - state.viewportWidth / 2;
    state.centred = true;
  }
}

/**
 * Applies the current offset to the track.
 *
 * @param state - Motion state to read and wrap.
 * @param options - The carousel's elements and callbacks.
 */
function render(state: CarouselState, options: CarouselOptions) {
  if (state.setWidth <= 0) return;

  state.offset = wrapOffset(state.offset, state.setWidth);
  gsap.set(options.track, { x: -state.offset });
}

/**
 * Re-measures and re-renders whenever the viewport or track changes size.
 *
 * @param state - Motion state to update.
 * @param options - The carousel's elements and callbacks.
 * @returns A function that stops observing.
 */
function watchResize(state: CarouselState, options: CarouselOptions) {
  const resize = new ResizeObserver(() => {
    measure(state, options);
    render(state, options);
  });
  resize.observe(options.viewport);
  resize.observe(options.track);

  return () => resize.disconnect();
}

/**
 * Drives the constant base flow, plus any boost, on every GSAP tick.
 *
 * @param state - Motion state to advance.
 * @param options - The carousel's elements and callbacks.
 * @param reduced - Media query for reduced motion; the flow pauses when it matches.
 * @returns A function that removes the ticker.
 */
function startTicker(
  state: CarouselState,
  options: CarouselOptions,
  reduced: MediaQueryList,
) {
  const tick = (_time: number, deltaMs: number) => {
    if (document.hidden || reduced.matches || state.setWidth <= 0) return;

    Object.assign(state, advanceMotion(state, deltaMs));
    render(state, options);
  };
  gsap.ticker.add(tick);

  return () => gsap.ticker.remove(tick);
}

/**
 * Turns swipes on the viewport into carousel movement.
 *
 * @param state - Motion state to move.
 * @param options - The carousel's elements and callbacks.
 * @param reduced - Media query for reduced motion; swipes move the offset directly when it matches.
 * @returns A function that stops listening.
 */
function startInput(
  state: CarouselState,
  options: CarouselOptions,
  reduced: MediaQueryList,
) {
  // Drag-left reports a negative deltaX; the carousel should flow left, so
  // `-deltaX` is the direction to advance.
  const observer = Observer.create({
    target: options.viewport,
    type: "touch,pointer",
    tolerance: 1,
    onPress: options.onPress,
    onChangeX: (self) => {
      options.onSwipe(Math.abs(self.deltaX));

      const delta = -self.deltaX;
      if (reduced.matches) {
        state.offset += delta;
        render(state, options);
      } else {
        state.boost += delta * BOOST_GAIN;
      }
    },
  });

  return () => observer.kill();
}

/**
 * Creates the infinite horizontal carousel paused: the stream's motion model
 * on the x axis. It measures and keeps slots correct on resize, but does not
 * flow or take swipes until `start()` is called. Constant base speed, swipes
 * add velocity that eases back.
 *
 * @param options - The carousel's elements and callbacks.
 * @returns A controller to start the carousel and to tear it down.
 */
export function createCarousel(options: CarouselOptions): MotionController {
  const reduced = getReducedMotion();
  const state: CarouselState = {
    offset: 0,
    boost: 0,
    setWidth: 0,
    viewportWidth: 0,
    centred: false,
  };

  measure(state, options);
  render(state, options);

  const stopResize = watchResize(state, options);
  let stopRunning: (() => void) | undefined;
  let started = false;

  return {
    start() {
      if (started) return;
      started = true;

      const stopTicker = startTicker(state, options, reduced);
      const stopInput = startInput(state, options, reduced);
      stopRunning = () => {
        stopInput();
        stopTicker();
      };
    },
    destroy() {
      stopRunning?.();
      stopResize();
    },
  };
}
