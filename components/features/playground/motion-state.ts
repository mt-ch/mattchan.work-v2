// Local modules
import type { Point } from "./edge-nudge";

/** Mutable camera and effect state shared by the motion modules. */
export type MotionState = {
  /** Camera world position, the viewport's top-left corner. */
  x: number;
  y: number;
  /** Inertia velocity in px/s. */
  vx: number;
  vy: number;
  /** Current edge nudge offset in px. */
  nudge: Point;
  /** Pointer position in viewport px, or null when it is not over the page. */
  pointer: Point | null;
  dragging: boolean;
  /** Pointer travel since the last press, to tell clicks from drags. */
  dragDistance: number;
  /** Seconds since the last input. */
  idle: number;
  /** Smoothed, normalised camera velocity (-1 to 1) used by the effects. */
  fx: { x: number; y: number; scale: number };
  /** Camera position on the previous frame, for measuring speed. */
  last: Point;
  /** Joined keys of the tiles last handed to React. */
  signature: string;
  videoClock: number;
  /** Set to force the next frame to recompute everything. */
  dirty: boolean;
};

/**
 * Creates fresh motion state with the camera at a given world position.
 *
 * @param start - World position of the viewport's top-left corner.
 * @returns State at rest.
 */
export function createState(start: Point): MotionState {
  return {
    x: start.x,
    y: start.y,
    vx: 0,
    vy: 0,
    nudge: { x: 0, y: 0 },
    pointer: null,
    dragging: false,
    dragDistance: 0,
    idle: 0,
    fx: { x: 0, y: 0, scale: 0 },
    last: { ...start },
    signature: "",
    videoClock: 0,
    dirty: true,
  };
}
