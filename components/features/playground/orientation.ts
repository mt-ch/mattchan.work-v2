/** Which of the two tile shapes a piece gets, chosen per Playground piece in Sanity. */
export type Orientation = "portrait" | "landscape";

/** Width ÷ height of a portrait (4:5) and a landscape (3:2) tile. */
export const PORTRAIT_RATIO = 4 / 5;
export const LANDSCAPE_RATIO = 3 / 2;

/**
 * Width of a tile of one orientation at a given height.
 *
 * @param orientation - The tile's orientation.
 * @param height - Tile height in px.
 * @returns The tile width in px.
 */
export function tileWidthFor(orientation: Orientation, height: number): number {
  const ratio = orientation === "landscape" ? LANDSCAPE_RATIO : PORTRAIT_RATIO;

  return Math.round(height * ratio);
}
