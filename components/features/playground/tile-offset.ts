// Local modules
import { PERIOD_ROWS, mod, mulberry32, type LayoutConfig } from "./layout-core";

/**
 * Largest vertical offset a tile may have, so it never reaches the rows above
 * or below: half of the gap that is left once the minimum row gap is kept.
 *
 * @param layout - Gap and minimum row gap.
 * @returns The cap in px, never negative.
 */
export function offsetCap(layout: LayoutConfig): number {
  return Math.max(0, (layout.gap - layout.minGap) / 2);
}

/**
 * Height of the sine wave at a point along a row.
 *
 * @param row - World row, which shifts the wave's phase.
 * @param centreX - World x of the tile's centre.
 * @param layout - Wave amplitude, length and per-row phase step.
 * @returns The wave in px.
 */
function waveAt(row: number, centreX: number, layout: LayoutConfig): number {
  if (layout.waveLength <= 0) return 0;
  const phase = (row * layout.wavePhaseStep * Math.PI) / 180;

  return (
    layout.waveAmplitude *
    Math.sin((2 * Math.PI * centreX) / layout.waveLength + phase)
  );
}

/**
 * Seeded jitter for one slot of the period, so the same slot always gets the
 * same value and the jitter repeats with the period.
 *
 * @param row - World row.
 * @param slotIndex - Index of the slot within its row.
 * @param seed - Seed for the arrangement.
 * @param amount - Largest jitter in px.
 * @returns A value in [-amount, +amount].
 */
function jitterFor(
  row: number,
  slotIndex: number,
  seed: number,
  amount: number,
): number {
  const random = mulberry32(
    seed ^
      Math.imul(mod(row, PERIOD_ROWS) + 1, 0x9e3779b1) ^
      Math.imul(slotIndex + 1, 0x85ebca6b),
  );
  // The first draw of nearby seeds is correlated, so skip it
  random();

  return (random() * 2 - 1) * amount;
}

/**
 * Vertical offset of a tile from its row line: wave plus jitter, clamped to
 * the cap so no setting can make tiles overlap.
 *
 * @param place.row - World row.
 * @param place.slotIndex - Index of the slot within its row.
 * @param place.centreX - World x of the tile's centre.
 * @param place.layout - Wave, jitter and gap settings.
 * @param place.seed - Seed for the jitter.
 * @returns The offset in px; positive moves the tile down.
 */
export function tileOffset(place: {
  row: number;
  slotIndex: number;
  centreX: number;
  layout: LayoutConfig;
  seed: number;
}): number {
  const { row, slotIndex, centreX, layout, seed } = place;
  const cap = offsetCap(layout);
  const wave = waveAt(row, centreX, layout);
  const jitter = jitterFor(row, slotIndex, seed, layout.jitterAmount);

  return Math.min(cap, Math.max(-cap, wave + jitter));
}
