// Shared modules
import { urlFor } from "@/lib/sanity/image";
import type { PlaygroundPiecesQueryResult } from "@/sanity.types";

// Local modules
import { tileWidthFor, type Orientation } from "./orientation";

/** One image or video the Queue can show, with the Project it belongs to. */
export type Piece = {
  /** Image asset reference (the poster's, for videos); stable across crops and pixel densities. */
  key: string;
  slug: string;
  title: string;
  /** Shape of the card, chosen on the Playground piece. */
  orientation: Orientation;
  src: string;
  blurDataURL?: string;
  /** Muted looping video; `src` is its poster. */
  videoSrc?: string;
  /** Plain-text caption, kept for the future click-into view; the Queue does not show it. */
  caption?: string;
};

type ImageSource = {
  asset?: { _ref: string };
  metadata?: { lqip: string | null } | null;
};

/**
 * Builds a piece from an image, and optionally the video it is the poster of.
 *
 * @param project - Identity of the owning Project.
 * @param image - The image or poster.
 * @param media.image - The image or poster.
 * @param media.orientation - The card shape.
 * @param media.videoSrc - Video URL, if the piece is a video.
 * @param media.caption - Optional caption.
 * @param height - Card height in px; the image is cropped to its orientation's width at this height.
 * @returns The piece, or nothing when the image has no asset.
 */
function toPiece(
  project: { slug: string; title: string },
  media: {
    image: ImageSource | null | undefined;
    orientation: Orientation;
    videoSrc?: string | null;
    caption?: string | null;
  },
  height: number,
): Piece[] {
  const { image, orientation, videoSrc, caption } = media;
  if (!image?.asset) return [];

  return [
    {
      ...project,
      key: image.asset._ref,
      orientation,
      src: urlFor(image as Parameters<typeof urlFor>[0])
        .width(tileWidthFor(orientation, height))
        .height(height)
        .fit("crop")
        .auto("format")
        .url(),
      blurDataURL: image.metadata?.lqip ?? undefined,
      videoSrc: videoSrc ?? undefined,
      caption: caption ?? undefined,
    },
  ];
}

/**
 * Turns Playground pieces into the pieces the Queue shows. Pieces without an
 * image, orientation, or a Project title and slug yield nothing.
 *
 * @param docs - Playground pieces as returned by the Playground pieces query.
 * @param height - Card height in px to crop images to (pass card height × pixel density).
 * @returns Pieces in query order.
 */
export function toPlaygroundPieces(
  docs: PlaygroundPiecesQueryResult,
  height: number,
): Piece[] {
  return docs.flatMap((doc) => {
    if (!doc.projectTitle || !doc.projectSlug || !doc.orientation) return [];
    const id = { slug: doc.projectSlug, title: doc.projectTitle };

    return toPiece(
      id,
      {
        image: doc.image,
        orientation: doc.orientation,
        videoSrc: doc.videoUrl,
        caption: doc.caption,
      },
      height,
    );
  });
}
