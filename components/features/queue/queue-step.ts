// Local modules
import type { QueueConfig } from "./config";

/** Longest frame the stepper integrates, so resuming a hidden tab never jumps. */
const MAX_DT = 0.1;

/** Momentum slower than this, in cards per second, is snapped to rest. */
const REST_SPEED = 0.001;

/**
 * Eases a drift share from where it is up toward 1, exponentially.
 *
 * @param share - Current share, 0 to 1.
 * @param rate - Ease speed per second.
 * @param dt - Seconds to advance.
 * @returns The new share, closer to 1.
 */
function easeToward(share: number, rate: number, dt: number): number {
  return 1 - (1 - share) * Math.exp(-rate * dt);
}

/** Where the Queue is and how fast input is carrying it. */
export type QueueMotion = {
  /** Scroll position as a fractional card index. */
  position: number;
  /** Momentum in cards per second, on top of the drift; decays to zero. */
  velocity: number;
  /** How much of the drift is applied, 0 (stopped) to 1 (full); eases up after a pause. */
  drift: number;
};

/**
 * Advances the Queue by one frame: the drift moves it at a constant speed,
 * and any momentum moves it further while decaying by friction. A pause stops
 * the drift at once; when it ends the drift eases back to full speed.
 *
 * @param input.motion - Position and velocity at the start of the frame.
 * @param input.paused - When true the drift stops at once; momentum still plays out.
 * @param input.reduced - When true the drift is off; momentum still plays out.
 * @param input.dt - Seconds since the previous frame.
 * @param input.config - Drift speed, direction and friction.
 * @returns The position and velocity for the next frame.
 */
export function stepQueue(input: {
  motion: QueueMotion;
  paused: boolean;
  reduced: boolean;
  dt: number;
  config: QueueConfig;
}): QueueMotion {
  const { motion, paused, reduced, config } = input;
  const dt = Math.min(Math.max(input.dt, 0), MAX_DT);

  // Drift is a constant speed in the configured direction
  const direction = config.driftDirection < 0 ? -1 : 1;
  const share = paused ? 0 : easeToward(motion.drift, config.resumeRate, dt);
  const drift = reduced ? 0 : direction * config.driftSpeed * share;

  // Momentum carries on from input and fades out
  const decayed = motion.velocity * Math.exp(-config.friction * dt);
  const velocity = Math.abs(decayed) < REST_SPEED ? 0 : decayed;

  return {
    position: motion.position + (drift + motion.velocity) * dt,
    velocity,
    drift: share,
  };
}
