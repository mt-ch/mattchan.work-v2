// Local modules
import { MAX_DT, easeToward } from "./queue-step";

/** Queue speed, in cards per second, below which the Queue counts as still. */
export const STILL_SPEED = 0.02;

/** Amount below which a fading hover counts as gone, so the next card can take over. */
const GONE = 0.001;

/** The card the hover effect is on, and how far the effect has eased in. */
export type HoverState = {
  /** Key of the card the effect is on, or null when none. */
  key: string | null;
  /** Effect share, 0 (rest) to 1 (full). */
  amount: number;
  /** Seconds the effect has been on this card, for effects that play over time. */
  elapsed: number;
};

/**
 * Whether the Queue is still enough for the hover effect to show.
 *
 * @param speed - Smoothed Queue speed in cards per second, signed.
 * @returns True when the Queue is effectively at rest.
 */
export function isStill(speed: number): boolean {
  return Math.abs(speed) < STILL_SPEED;
}

/**
 * Advances the hover effect by one frame. The amount eases up while a card is
 * hovered and the Queue is still, and down otherwise. When the pointer moves
 * to another card the old one eases out first and the new one takes over from
 * zero, so the effect never jumps.
 *
 * @param input.state - Key and amount at the start of the frame.
 * @param input.hovered - Key of the card under the pointer or focus, or null.
 * @param input.still - True when the Queue is at rest.
 * @param input.rate - Ease speed per second.
 * @param input.dt - Seconds since the previous frame.
 * @returns The key and amount for the next frame.
 */
export function stepHover(input: {
  state: HoverState;
  hovered: string | null;
  still: boolean;
  rate: number;
  dt: number;
}): HoverState {
  const { state, hovered } = input;
  const dt = Math.min(Math.max(input.dt, 0), MAX_DT);

  // The current card keeps the effect only while it is still the hovered one
  const holdsKey = hovered !== null && hovered === state.key;
  const rising = holdsKey && input.still;
  const amount = rising
    ? easeToward(state.amount, input.rate, dt)
    : 1 - easeToward(1 - state.amount, input.rate, dt);

  // Once the old card has faded out, the hovered one (if any) takes over
  if (amount < GONE) return { key: hovered, amount: 0, elapsed: 0 };

  // Time runs only while the effect holds the card, so a wave restarts on each hover
  const elapsed = holdsKey ? state.elapsed + dt : state.elapsed;

  return { key: state.key, amount, elapsed };
}
