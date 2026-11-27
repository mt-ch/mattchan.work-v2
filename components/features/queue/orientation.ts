/** Which of the two card shapes a piece gets, chosen per Playground piece in Sanity. */
export type Orientation = "portrait" | "landscape";

/** Width ÷ height of a portrait (4:5) and a landscape (3:2) card. */
const PORTRAIT_RATIO = 4 / 5;
const LANDSCAPE_RATIO = 3 / 2;

/**
 * Width of a card of one orientation at a given height.
 *
 * @param orientation - The card's orientation.
 * @param height - Card height in px.
 * @returns The card width in px.
 */
export function tileWidthFor(orientation: Orientation, height: number): number {
  const ratio = orientation === "landscape" ? LANDSCAPE_RATIO : PORTRAIT_RATIO;

  return Math.round(height * ratio);
}
