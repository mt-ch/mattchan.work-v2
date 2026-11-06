// Third-party libraries
import { gsap } from "gsap";

// Shared modules
import { getCoarsePointer, getReducedMotion } from "@/lib/motion/environment";

// Local modules
import type { PlaygroundConfig } from "./config";
import { periodSize, type Tile } from "./layout";
import { startInput } from "./motion-input";
import { applyConfigVars, render, type RenderTargets } from "./motion-render";
import { createState, type MotionState } from "./motion-state";
import { stepEffects, stepInertia, stepNudge } from "./motion-step";
import type { Piece } from "./playground-data";
import { playIntro } from "./intro";

export type PlaygroundOptions = RenderTargets & {
  pieces: Piece[];
  /** Live config; the debug panel mutates it and calls `refresh`. */
  config: PlaygroundConfig;
  /** Called with the visible tiles whenever the set or arrangement changes. */
  onTiles: (tiles: Tile[]) => void;
};

export type PlaygroundController = {
  /** Re-reads the config on the next frame. */
  refresh: () => void;
  /** Plays the load animation, unless motion is reduced. */
  intro: () => void;
  stop: () => void;
};

/** Gap in px kept between a focused tile and the viewport edge. */
const FOCUS_PADDING = 48;

/**
 * Tracks the mouse position for the edge nudge. Touch pointers are ignored.
 *
 * @param state - Motion state whose pointer is updated.
 * @returns A function that stops listening.
 */
function startPointerTracking(state: MotionState) {
  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    state.pointer = { x: event.clientX, y: event.clientY };
  };
  const onLeave = () => {
    state.pointer = null;
  };
  window.addEventListener("pointermove", onMove);
  document.documentElement.addEventListener("pointerleave", onLeave);

  return () => {
    window.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", onLeave);
  };
}

/**
 * Pans the camera to bring a keyboard-focused tile into view.
 *
 * @param options - The canvas elements.
 * @param state - Motion state to move.
 * @returns A function that stops listening.
 */
function startFocusPanning(options: PlaygroundOptions, state: MotionState) {
  const onFocus = (event: FocusEvent) => {
    const el = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-tile]",
    );
    if (!el || !(event.target as HTMLElement).matches(":focus-visible")) return;

    // Move just far enough that the whole tile sits inside the viewport
    const { clientWidth: vw, clientHeight: vh } = options.viewport;
    const left = Number(el.dataset.worldX);
    const top = Number(el.dataset.worldY);
    const fit = (pos: number, size: number, cam: number, view: number) =>
      Math.min(
        Math.max(cam, pos + size + FOCUS_PADDING - view),
        pos - FOCUS_PADDING,
      );
    const target = {
      x: fit(left, el.offsetWidth, state.x, vw),
      y: fit(top, el.offsetHeight, state.y, vh),
    };

    state.vx = 0;
    state.vy = 0;
    state.idle = 0;
    if (getReducedMotion().matches) Object.assign(state, target);
    else gsap.to(state, { ...target, duration: 0.6, ease: "power3.out" });
  };
  options.viewport.addEventListener("focusin", onFocus);

  return () => options.viewport.removeEventListener("focusin", onFocus);
}

/**
 * Runs the GSAP ticker that steps and renders the canvas every frame.
 *
 * @param options - The canvas elements, pieces, config and callback.
 * @param state - Motion state to advance.
 * @returns A function that removes the ticker.
 */
function startTicker(options: PlaygroundOptions, state: MotionState) {
  const reducedQuery = getReducedMotion();
  const coarseQuery = getCoarsePointer();

  const tick = (_time: number, deltaMs: number) => {
    if (document.hidden) return;

    const { config, viewport } = options;
    const dt = Math.min(deltaMs / 1000, 0.1);
    const reduced = reducedQuery.matches;
    const size = { width: viewport.clientWidth, height: viewport.clientHeight };

    stepInertia(state, config, dt, reduced);
    stepNudge(state, config, size, dt, reduced || coarseQuery.matches);
    stepEffects(state, dt, reduced);
    render(options, state, config, options.pieces, options.onTiles, reduced);
  };
  gsap.ticker.add(tick);

  return () => gsap.ticker.remove(tick);
}

/**
 * Starts the Playground: centres the camera, then drives it with the ticker
 * and every input.
 *
 * @param options - The canvas elements, pieces, config and callback.
 * @returns A controller to refresh, run the intro and stop.
 */
export function startPlayground(
  options: PlaygroundOptions,
): PlaygroundController {
  const { viewport, dots, config } = options;
  const period = periodSize(config.layout);
  const state = createState({
    x: period.width / 2 - viewport.clientWidth / 2,
    y: period.height / 2 - viewport.clientHeight / 2,
  });
  applyConfigVars(viewport, config);

  const stops = [
    startInput({ viewport, state, config }),
    startPointerTracking(state),
    startFocusPanning(options, state),
    startTicker(options, state),
  ];
  const reduced = getReducedMotion().matches;
  if (reduced) gsap.set(dots, { opacity: 1 });

  return {
    refresh: () => {
      applyConfigVars(viewport, config);
      state.dirty = true;
    },
    intro: () => {
      if (reduced) return;
      playIntro(viewport, dots);
    },
    stop: () => {
      gsap.killTweensOf(state);
      stops.forEach((stop) => stop());
    },
  };
}
