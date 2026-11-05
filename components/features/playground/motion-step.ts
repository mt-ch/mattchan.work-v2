// Local modules
import type { PlaygroundConfig } from "./config";
import { edgeNudge } from "./edge-nudge";
import type { MotionState } from "./motion-state";

/** Camera speed in px/s at which velocity effects reach full strength. */
const FULL_SPEED = 2400;

/**
 * Moves the camera by its inertia velocity, decays the velocity by friction,
 * and drifts the camera after the idle delay.
 *
 * @param state - Motion state to advance.
 * @param config - Friction and drift settings.
 * @param dt - Seconds since the previous frame.
 * @param reduced - When true there is no inertia or drift.
 */
export function stepInertia(
  state: MotionState,
  config: PlaygroundConfig,
  dt: number,
  reduced: boolean,
) {
  state.idle += dt;
  if (reduced) {
    state.vx = 0;
    state.vy = 0;

    return;
  }

  if (!state.dragging) {
    state.x += state.vx * dt;
    state.y += state.vy * dt;
    const decay = Math.exp(-config.input.friction * dt);
    state.vx = Math.abs(state.vx) < 1 ? 0 : state.vx * decay;
    state.vy = Math.abs(state.vy) < 1 ? 0 : state.vy * decay;
  }

  // Drift slowly once nothing has happened for a while
  const { enabled, speed, delay } = config.drift;
  if (enabled && !state.dragging && state.idle > delay) state.x += speed * dt;
}

/**
 * Eases the edge nudge towards its target, which is zero while dragging, when
 * motion is reduced and on touch devices.
 *
 * @param state - Motion state whose nudge is eased.
 * @param config - Nudge settings.
 * @param viewport - Viewport width and height in px.
 * @param dt - Seconds since the previous frame.
 * @param off - True when the nudge must not apply (reduced motion, coarse pointer).
 */
export function stepNudge(
  state: MotionState,
  config: PlaygroundConfig,
  viewport: { width: number; height: number },
  dt: number,
  off: boolean,
) {
  const target =
    off || state.dragging
      ? { x: 0, y: 0 }
      : edgeNudge(state.pointer, viewport, config.nudge);
  const k = 1 - Math.exp(-config.nudge.ease * dt);

  state.nudge.x += (target.x - state.nudge.x) * k;
  state.nudge.y += (target.y - state.nudge.y) * k;
}

/**
 * Measures the camera's speed this frame and eases the effect values towards it.
 *
 * @param state - Motion state whose effect values are eased.
 * @param dt - Seconds since the previous frame.
 * @param reduced - When true the effects stay at rest.
 */
export function stepEffects(state: MotionState, dt: number, reduced: boolean) {
  const clamp = (v: number) => Math.max(-1, Math.min(1, v));
  const vx = reduced ? 0 : (state.x - state.last.x) / Math.max(dt, 0.001);
  const vy = reduced ? 0 : (state.y - state.last.y) / Math.max(dt, 0.001);
  state.last = { x: state.x, y: state.y };

  const k = 1 - Math.exp(-10 * dt);
  const speed = Math.min(1, Math.hypot(vx, vy) / FULL_SPEED);
  state.fx.x += (clamp(vx / FULL_SPEED) - state.fx.x) * k;
  state.fx.y += (clamp(vy / FULL_SPEED) - state.fx.y) * k;
  state.fx.scale += (speed - state.fx.scale) * k;
}
