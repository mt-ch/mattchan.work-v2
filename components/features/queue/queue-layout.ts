// Local modules
import type { Orientation } from "../playground/orientation";
import { tileWidthFor } from "../playground/orientation";
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
  scale: number;
  opacity: number;
  /** Cards ahead of this one, nearest first: 0 for the front-most card. */
  depthRank: number;
  /** True for the single card at the focus point. */
  focus: boolean;
};

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
 * Lays out the cards of the Queue: a diagonal fan from far (top-right) to near
 * (bottom-left), cards shrinking and fading with distance from the focus card.
 *
 * @param input.count - Number of pieces; indices wrap by modulo.
 * @param input.orientations - Shape of each piece, used only when the config honours orientation.
 * @param input.config - Queue config.
 * @param input.position - Scroll position as a fractional card index; the focus card is the nearest integer.
 * @param input.viewport - Viewport size in px.
 * @returns The visible cards, nearest first. Empty when there are no pieces.
 */
export function layoutQueue(input: {
  count: number;
  orientations?: Orientation[];
  config: QueueConfig;
  position: number;
  viewport: { width: number; height: number };
}): QueueCard[] {
  const { count, orientations, config, position, viewport } = input;
  if (count <= 0) return [];

  const height = viewport.height * config.cardHeight;
  const step = height * config.spacing;
  const angle = (config.angle * Math.PI) / 180;
  const direction = config.direction < 0 ? -1 : 1;
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
      x: direction * offset * step * Math.cos(angle),
      y: -offset * step * Math.sin(angle),
      z: depthZ(config, offset, height),
      rotateY: direction * (config.rotateY + distance * config.rotateFalloff),
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
