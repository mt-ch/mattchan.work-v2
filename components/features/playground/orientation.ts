/** Which of the two tile shapes a piece of media gets. */
export type Orientation = "portrait" | "landscape";

/** Width ÷ height of a portrait (4:5) and a landscape (3:2) tile. */
export const PORTRAIT_RATIO = 4 / 5;
export const LANDSCAPE_RATIO = 3 / 2;

/** Media wider than this is landscape: the midpoint of the two tile ratios on a log scale. */
const LANDSCAPE_CUTOFF = Math.sqrt(PORTRAIT_RATIO * LANDSCAPE_RATIO);

/**
 * Decides a piece's orientation from its source dimensions. Square or unknown
 * dimensions are portrait, which loses the least when cropped.
 *
 * @param dimensions - Width and height of the source image, if known.
 * @returns The orientation.
 */
export function orientationOf(
  dimensions:
    { width?: number | null; height?: number | null } | null | undefined,
): Orientation {
  const { width, height } = dimensions ?? {};
  if (!width || !height) return "portrait";

  return width / height > LANDSCAPE_CUTOFF ? "landscape" : "portrait";
}

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
