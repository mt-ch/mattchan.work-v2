// Local modules
import type { QueueConfig } from "./config";

/** Pointer travel in px beyond which a press counts as a drag, not a click. */
export const DRAG_THRESHOLD = 6;

/**
 * Converts a horizontal pointer or wheel distance into cards, so the Queue
 * follows the pointer one to one.
 *
 * @param px - Distance in px; negative is leftwards.
 * @param config - Queue config.
 * @param viewportHeight - Viewport height in px.
 * @returns Change in position, in cards. Leftwards moves forward (positive).
 */
export function pxToCards(
  px: number,
  config: QueueConfig,
  viewportHeight: number,
): number {
  const step = viewportHeight * config.cardHeight * config.spacing;
  const stepX = step * Math.cos((config.angle * Math.PI) / 180);
  if (stepX <= 0) return 0;

  const direction = config.direction < 0 ? -1 : 1;

  return (-px * direction) / stepX;
}

/**
 * Velocity that carries the Queue a given number of cards before friction
 * stops it (distance travelled is velocity ÷ friction).
 *
 * @param cards - Distance to coast, in cards.
 * @param config - Queue config.
 * @returns Momentum in cards per second.
 */
export function impulseFor(cards: number, config: QueueConfig): number {
  return cards * config.friction;
}

/**
 * Blends a new drag sample into a running velocity estimate.
 *
 * @param previous - Estimate so far, in cards per second.
 * @param cards - Cards moved since the last sample.
 * @param dt - Seconds since the last sample.
 * @returns The smoothed velocity in cards per second.
 */
export function blendVelocity(
  previous: number,
  cards: number,
  dt: number,
): number {
  if (dt <= 0) return previous;

  return previous * 0.6 + (cards / dt) * 0.4;
}

/**
 * Whether the Queue should hold its drift.
 *
 * @param input.holds - True while the pointer is down, over a card, or a card has focus.
 * @param input.now - Current time in seconds.
 * @param input.resumeAt - Time in seconds the last hold ends.
 * @returns True when the drift should be paused.
 */
export function isPaused(input: {
  holds: boolean;
  now: number;
  resumeAt: number;
}): boolean {
  return input.holds || input.now < input.resumeAt;
}
