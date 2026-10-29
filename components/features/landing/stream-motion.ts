// Third-party libraries
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";

// Shared modules
import { getDesktop, getReducedMotion } from "@/lib/motion/environment";

// Local modules
import type { StreamTile } from "./stream-data";
import type { MotionController } from "./motion-controller";
import {
  BOOST_GAIN,
  activeTileIndex,
  advanceMotion,
  wrapOffset,
  type TileBox,
} from "./stream-math";

gsap.registerPlugin(Observer);

/** Mutable motion state shared by the stream's helpers. */
type StreamState = {
  offset: number;
  boost: number;
  setHeight: number;
  viewportHeight: number;
  boxes: TileBox[];
  activeSlug: string;
  /** False while paused: no active-Project reporting. */
  started: boolean;
};

export type StreamOptions = {
  viewport: HTMLElement;
  track: HTMLElement;
  tiles: StreamTile[];
  /** Called when the Project at the viewport centre changes. */
  onActiveSlug: (slug: string) => void;
  /** Called with how many copies of the set the viewport needs to stay full. */
  onCopiesNeeded: (needed: number) => void;
};

/**
 * Reads the layout of the first copy of the set and reports how many copies
 * the viewport needs.
 *
 * @param state - Motion state to update with the measurements.
 * @param options - The stream's elements and callbacks.
 */
function measure(state: StreamState, options: StreamOptions) {
  const { viewport, track, tiles, onCopiesNeeded } = options;
  state.viewportHeight = viewport.clientHeight;

  // Read the layout of one copy of the set
  const first = Array.from(track.children).slice(0, tiles.length);
  const nextCopy = track.children[tiles.length] as HTMLElement | undefined;
  state.boxes = first.map((el) => ({
    top: (el as HTMLElement).offsetTop,
    height: (el as HTMLElement).offsetHeight,
  }));
  state.setHeight = nextCopy ? nextCopy.offsetTop : 0;

  // Ask for enough copies that the stream always fills the viewport
  if (state.setHeight > 0) {
    onCopiesNeeded(Math.ceil(state.viewportHeight / state.setHeight) + 2);
  }
}

/**
 * Applies the current offset to the track and reports the active Project.
 *
 * @param state - Motion state to read and wrap.
 * @param options - The stream's elements and callbacks.
 */
function render(state: StreamState, options: StreamOptions) {
  if (state.setHeight <= 0) return;

  state.offset = wrapOffset(state.offset, state.setHeight);
  gsap.set(options.track, { y: -state.offset });

  // Stay silent until started so the owner controls the highlight
  if (!state.started) return;

  // Report the Project at the viewport centre when it changes
  const index = activeTileIndex(
    state.offset,
    state.viewportHeight,
    state.boxes,
    state.setHeight,
  );
  const slug = options.tiles[index].slug;
  if (slug !== state.activeSlug) {
    state.activeSlug = slug;
    options.onActiveSlug(slug);
  }
}

/**
 * Starts the stream with the first Project at the centre of the viewport.
 *
 * @param state - Motion state whose offset is set.
 */
function centreFirstTile(state: StreamState) {
  const first = state.boxes[0];
  if (!first) return;

  state.offset = first.top + first.height / 2 - state.viewportHeight / 2;
}

/**
 * Re-measures and re-renders whenever the viewport or track changes size.
 *
 * @param state - Motion state to update.
 * @param options - The stream's elements and callbacks.
 * @returns A function that stops observing.
 */
function watchResize(state: StreamState, options: StreamOptions) {
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
 * @param options - The stream's elements and callbacks.
 * @param reduced - Media query for reduced motion; the flow pauses when it matches.
 * @returns A function that removes the ticker.
 */
function startTicker(
  state: StreamState,
  options: StreamOptions,
  reduced: MediaQueryList,
) {
  const tick = (_time: number, deltaMs: number) => {
    if (document.hidden || reduced.matches || state.setHeight <= 0) return;

    Object.assign(state, advanceMotion(state, deltaMs));
    render(state, options);
  };
  gsap.ticker.add(tick);

  return () => gsap.ticker.remove(tick);
}

/**
 * Turns wheel and touch input anywhere on the window into stream movement.
 * Only active at the desktop breakpoint; below it the stream is hidden and
 * native page scroll is left alone.
 *
 * @param state - Motion state to move.
 * @param options - The stream's elements and callbacks.
 * @param reduced - Media query for reduced motion; input moves the offset directly when it matches.
 * @returns A function that stops listening.
 */
function startInput(
  state: StreamState,
  options: StreamOptions,
  reduced: MediaQueryList,
) {
  // wheelSpeed -1 makes wheel-down and finger-drag-up both negative, so
  // `-deltaY` is the direction the stream should flow.
  const observer = Observer.create({
    target: window,
    type: "wheel,touch",
    wheelSpeed: -1,
    tolerance: 1,
    preventDefault: true,
    onChangeY: (self) => {
      const delta = -self.deltaY;
      if (reduced.matches) {
        state.offset += delta;
        render(state, options);
      } else {
        state.boost += delta * BOOST_GAIN;
      }
    },
  });

  const desktop = getDesktop();
  const syncObserver = () =>
    desktop.matches ? observer.enable() : observer.disable();
  syncObserver();
  desktop.addEventListener("change", syncObserver);

  return () => {
    desktop.removeEventListener("change", syncObserver);
    observer.kill();
  };
}

/**
 * Creates the infinite vertical stream paused: it measures, centres the first
 * Project and keeps slots correct on resize, but does not flow, take input or
 * report the active Project until `start()` is called.
 *
 * @param options - The stream's elements and callbacks.
 * @returns A controller to start the stream and to tear it down.
 */
export function createStream(options: StreamOptions): MotionController {
  const reduced = getReducedMotion();
  const state: StreamState = {
    offset: 0,
    boost: 0,
    setHeight: 0,
    viewportHeight: 0,
    boxes: [],
    activeSlug: "",
    started: false,
  };

  measure(state, options);
  centreFirstTile(state);
  render(state, options);

  const stopResize = watchResize(state, options);
  let stopRunning: (() => void) | undefined;

  return {
    start() {
      if (state.started) return;
      state.started = true;

      // Report the centred Project now, then flow and listen
      render(state, options);
      const stopInput = startInput(state, options, reduced);
      const stopTicker = startTicker(state, options, reduced);
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
