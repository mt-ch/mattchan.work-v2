// Local modules
import { ENTRANCE_CONFIG } from "./entrance-config";
import { getStackRect } from "./entrance-stack";

/** A point in viewport pixels. */
export type Point = { x: number; y: number };

/** The orbit ellipse and the size of a card on it. */
export type RingGeometry = {
  /** Ellipse centre. */
  centre: Point;
  /** Horizontal semi-axis in px. */
  radiusX: number;
  /** Vertical semi-axis in px. */
  radiusY: number;
  /** Card width in px. */
  cardWidth: number;
  /** Card height in px. */
  cardHeight: number;
};

/** Angle of slot 0: straight above the centre. */
const FIRST_SLOT_ANGLE = -Math.PI / 2;

/**
 * Sizes the ring: an ellipse centred in the full viewport, with cards a share
 * of the stack card's size.
 *
 * @param viewportWidth - Viewport width in px.
 * @param viewportHeight - Viewport height in px.
 * @returns The ring's geometry.
 */
export function getRingGeometry(
  viewportWidth: number,
  viewportHeight: number,
): RingGeometry {
  const { ringSize, ringCardScale } = ENTRANCE_CONFIG;
  const stack = getStackRect(viewportWidth, viewportHeight);

  return {
    centre: { x: viewportWidth / 2, y: viewportHeight / 2 },
    radiusX: (viewportWidth * ringSize.width) / 2,
    radiusY: (viewportHeight * ringSize.height) / 2,
    cardWidth: stack.width * ringCardScale,
    cardHeight: stack.height * ringCardScale,
  };
}

/**
 * Finds where a slot sits on the ellipse. Slots are evenly spaced; the turn
 * is clockwise on screen, so a larger angle moves a card clockwise.
 *
 * @param ring - The ring's geometry.
 * @param slot - The slot's index, 0 to count - 1.
 * @param count - How many slots the ring has.
 * @param turn - How far the ring has turned in radians.
 * @returns The slot's centre in viewport pixels.
 */
export function getSlotPoint(
  ring: RingGeometry,
  slot: number,
  count: number,
  turn: number,
): Point {
  const angle = FIRST_SLOT_ANGLE + (slot / count) * 2 * Math.PI + turn;

  return {
    x: ring.centre.x + ring.radiusX * Math.cos(angle),
    y: ring.centre.y + ring.radiusY * Math.sin(angle),
  };
}
