// Shared modules
import { urlFor } from "@/lib/sanity/image";
import type { PlaygroundProjectsQueryResult } from "@/sanity.types";

// Local modules
import { orientationOf, tileWidthFor, type Orientation } from "./orientation";

/** One image or video the canvas can show, with the Project it belongs to. */
export type Piece = {
  slug: string;
  title: string;
  /** Shape of the tile, from the source media's own dimensions. */
  orientation: Orientation;
  src: string;
  blurDataURL?: string;
  /** Muted looping video; `src` is its poster. */
  videoSrc?: string;
};

type Project = PlaygroundProjectsQueryResult[number];
type ImageSource = {
  asset?: unknown;
  metadata?: {
    lqip: string | null;
    dimensions?: { width?: number; height?: number } | null;
  } | null;
};

/**
 * Builds a piece from an image, and optionally the video it is the poster of.
 *
 * @param project - Identity of the owning Project.
 * @param image - The image or poster.
 * @param height - Tile height in px; the image is cropped to its orientation's width at this height.
 * @param videoSrc - Video URL, if the piece is a video.
 * @returns The piece, or nothing when the image has no asset.
 */
function toPiece(
  project: { slug: string; title: string },
  image: ImageSource | null | undefined,
  height: number,
  videoSrc?: string | null,
): Piece[] {
  if (!image?.asset) return [];

  // Crop to the tile shape this media gets, not one shared size
  const orientation = orientationOf(image.metadata?.dimensions);

  return [
    {
      ...project,
      orientation,
      src: urlFor(image as Parameters<typeof urlFor>[0])
        .width(tileWidthFor(orientation, height))
        .height(height)
        .fit("crop")
        .auto("format")
        .url(),
      blurDataURL: image.metadata?.lqip ?? undefined,
      videoSrc: videoSrc ?? undefined,
    },
  ];
}

/**
 * Flattens Projects into the pieces the canvas can show: each cover, then each
 * image and video Cell of its story. Projects lacking a title or slug yield
 * nothing, and neither do Cells without media.
 *
 * @param projects - Projects as returned by the Playground query.
 * @param height - Tile height in px to crop images to (pass tile height × pixel density).
 * @returns Pieces in Project then story order.
 */
export function toPieces(
  projects: PlaygroundProjectsQueryResult,
  height: number,
): Piece[] {
  return projects.flatMap((p: Project) => {
    if (!p.title || !p.slug?.current) return [];
    const id = { slug: p.slug.current, title: p.title };

    const cells = (p.story ?? []).flatMap((row) =>
      (row.items ?? []).flatMap((cell) => {
        if (cell._type === "imageCell") return toPiece(id, cell.image, height);
        if (cell._type === "videoCell")
          return toPiece(id, cell.poster, height, cell.videoUrl);

        return [];
      }),
    );

    return [...toPiece(id, p.coverImage, height, p.coverVideoUrl), ...cells];
  });
}
