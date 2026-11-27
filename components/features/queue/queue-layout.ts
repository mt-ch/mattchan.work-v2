// Local modules
import type { Orientation } from "./orientation";
import { tileWidthFor } from "./orientation";
import type { QueueConfig } from "./config";
import { curveDepth } from "./depth-curve";

/** Aspect ratio (width ÷ height) of every Queue card: 4:5 portrait. */
export const CARD_RATIO = 4 / 5;

/** One card of the Queue, positioned relative to the centre of the viewport. */
export type QueueCard = {
  /** Unique among rendered cards, and the same card keeps it as the Queue moves. */
  key: string;
  /** Index into the pieces, after wrapping. */
  pieceIndex: number;
  /** Card size in px. */
  width: number;
  height: number;
  /** Offset of the card's centre from the viewport centre, in px. */
  x: number;
  y: number;
  z: number;
  rotateY: number;
  /** Skew along the track in degrees, from scroll velocity. */
  skew: number;
  /** Static slope of the card's top and bottom edges in degrees. */
  skewY: number;
  scale: number;
  opacity: number;
  /** Cards ahead of this one, nearest first: 0 for the front-most card. */
  depthRank: number;
  /** True for the single card at the focus point. */
  focus: boolean;
};

/** Speed in cards per second at which velocity coupling reaches its full effect. */
export const FULL_COUPLING_SPEED = 4;

/**
 * Scroll speed as a share of the full coupling effect.
 *
 * @param velocity - Signed scroll speed in cards per second.
 * @returns A value from -1 to 1.
 */
function couplingShare(velocity: number): number {
  const share = velocity / FULL_COUPLING_SPEED;

  return Math.min(Math.max(share, -1), 1);
}

/**
 * Wraps an index into [0, count) so the Queue loops without an end.
 *
 * @param index - Any integer index.
 * @param count - Number of pieces.
 * @returns The wrapped index, or 0 when there are no pieces.
 */
export function wrapIndex(index: number, count: number): number {
  if (count <= 0) return 0;

  return ((index % count) + count) % count;
}

/**
 * Width of a card: its piece's shape when the config honours orientation, else 4:5.
 *
 * @param config - Queue config.
 * @param orientation - The piece's orientation, when known.
 * @param height - Card height in px.
 * @returns The card width in px.
 */
function cardWidth(
  config: QueueConfig,
  orientation: Orientation | undefined,
  height: number,
): number {
  if (config.honourOrientation && orientation) {
    return tileWidthFor(orientation, height);
  }

  return height * CARD_RATIO;
}

/**
 * Z position of a card: how far back it sits, shaped by the config's depth curve.
 *
 * @param config - Queue config.
 * @param offset - Signed distance ahead of the focus point, in cards.
 * @param height - Card height in px.
 * @returns Z in px; negative is further from the camera.
 */
function depthZ(config: QueueConfig, offset: number, height: number): number {
  const depth = curveDepth(config.depthCurve, offset, config.renderAfter);

  return -depth * height * config.depthStep;
}

/**
 * Rotation and skew of a card, in degrees, from its distance and the scroll speed.
 *
 * @param config - Queue config.
 * @param distance - Absolute distance from the focus point, in cards.
 * @param share - Scroll speed as a share of full coupling, -1 to 1.
 * @returns The signed rotateY, velocity skew and static skewY, mirrored by the config's direction.
 */
function tiltFor(config: QueueConfig, distance: number, share: number) {
  const direction = config.direction < 0 ? -1 : 1;
  const rotate =
    config.rotateY +
    distance * config.rotateFalloff +
    share * config.velocityRotate;

  return {
    rotateY: direction * rotate,
    skew: direction * share * config.velocitySkew,
    skewY: direction * config.skewY,
  };
}

/**
 * Distance between neighbouring cards, widened by scroll speed.
 *
 * @param config - Queue config.
 * @param height - Card height in px.
 * @param share - Scroll speed as a share of full coupling, -1 to 1.
 * @returns The step along the track in px.
 */
function stepFor(config: QueueConfig, height: number, share: number): number {
  return (
    height * config.spacing * (1 + config.velocitySpread * Math.abs(share))
  );
}

/**
 * Where a point along the track sits, given the track angle and direction.
 *
 * @param config - Queue config.
 * @param along - Distance along the track from the focus point, in px.
 * @returns The x and y offset in px.
 */
function trackPoint(config: QueueConfig, along: number) {
  const angle = (config.angle * Math.PI) / 180;
  const direction = config.direction < 0 ? -1 : 1;

  return {
    x: direction * along * Math.cos(angle),
    y: -along * Math.sin(angle),
  };
}

/**
 * Lays out the cards of the Queue: a diagonal fan from far (top-right) to near
 * (bottom-left), cards shrinking and fading with distance from the focus card.
 *
 * @param input.count - Number of pieces; indices wrap by modulo.
 * @param input.orientations - Shape of each piece, used only when the config honours orientation.
 * @param input.config - Queue config.
 * @param input.position - Scroll position as a fractional card index; the focus card is the nearest integer.
 * @param input.viewport - Viewport size in px.
 * @param input.velocity - Signed scroll speed in cards per second; faster movement skews, rotates and spreads the cards. Defaults to 0.
 * @returns The visible cards, nearest first. Empty when there are no pieces.
 */
export function layoutQueue(input: {
  count: number;
  orientations?: Orientation[];
  config: QueueConfig;
  position: number;
  viewport: { width: number; height: number };
  velocity?: number;
}): QueueCard[] {
  const { count, orientations, config, position, viewport } = input;
  if (count <= 0) return [];

  const height = viewport.height * config.cardHeight;
  const share = couplingShare(input.velocity ?? 0);
  const step = stepFor(config, height, share);
  const focusIndex = Math.round(position);

  const cards: QueueCard[] = [];
  for (let slot = -config.renderBefore; slot <= config.renderAfter; slot++) {
    // Distance ahead of the focus point, in cards; fractional while moving
    const offset = focusIndex + slot - position;
    const absolute = focusIndex + slot;
    const distance = Math.abs(offset);
    const pieceIndex = wrapIndex(absolute, count);
    const orientation = orientations?.[pieceIndex];

    cards.push({
      key: `${absolute}`,
      pieceIndex,
      width: cardWidth(config, orientation, height),
      height,
      ...trackPoint(config, offset * step),
      z: depthZ(config, offset, height),
      ...tiltFor(config, distance, share),
      scale: Math.max(config.minScale, 1 - distance * config.scaleFalloff),
      opacity: Math.max(0, 1 - distance * config.fadeFalloff),
      depthRank: 0,
      focus: slot === 0,
    });
  }

  return cards
    .sort((a, b) => b.z - a.z)
    .map((card, rank) => ({ ...card, depthRank: rank }));
}
