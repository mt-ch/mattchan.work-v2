// Shared modules
import { urlFor } from "@/lib/sanity/image";
import type {
  PlaygroundPiecesQueryResult,
  PlaygroundProjectsQueryResult,
} from "@/sanity.types";

// Local modules
import { tileWidthFor, type Orientation } from "./orientation";

/** One image or video the canvas can show, with the Project it belongs to. */
export type Piece = {
  slug: string;
  title: string;
  /** Shape of the tile, chosen on the Playground piece. */
  orientation: Orientation;
  src: string;
  blurDataURL?: string;
  /** Muted looping video; `src` is its poster. */
  videoSrc?: string;
  /** Plain-text caption, kept for the future click-into view; the canvas does not show it. */
  caption?: string;
};

type Project = PlaygroundProjectsQueryResult[number];
type ImageSource = {
  asset?: unknown;
  metadata?: { lqip: string | null } | null;
};

/**
 * Builds a piece from an image, and optionally the video it is the poster of.
 *
 * @param project - Identity of the owning Project.
 * @param image - The image or poster.
 * @param media.image - The image or poster.
 * @param media.orientation - The tile shape.
 * @param media.videoSrc - Video URL, if the piece is a video.
 * @param media.caption - Optional caption.
 * @param height - Tile height in px; the image is cropped to its orientation's width at this height.
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
 * Turns Playground pieces into the pieces the canvas shows. Pieces without an
 * image, orientation, or a Project title and slug yield nothing.
 *
 * @param docs - Playground pieces as returned by the Playground pieces query.
 * @param height - Tile height in px to crop images to (pass tile height × pixel density).
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

/**
 * Flattens Projects into pieces: each cover, then each image and video Cell of
 * its story. No longer used by the Landing, which shows Playground pieces;
 * kept so switching back is trivial. Orientation falls back to portrait, since
 * Project media carries no chosen orientation. Projects lacking a title or
 * slug yield nothing, and neither do Cells without media.
 *
 * @param projects - Projects as returned by the Playground query.
 * @param height - Tile height in px to crop images to (pass tile height × pixel density).
 * @returns Pieces in Project then story order.
 */
export function toPieces(
  projects: PlaygroundProjectsQueryResult,
  height: number,
): Piece[] {
  const orientation: Orientation = "portrait";

  return projects.flatMap((p: Project) => {
    if (!p.title || !p.slug?.current) return [];
    const id = { slug: p.slug.current, title: p.title };

    const cells = (p.story ?? []).flatMap((row) =>
      (row.items ?? []).flatMap((cell) => {
        if (cell._type === "imageCell")
          return toPiece(id, { image: cell.image, orientation }, height);
        if (cell._type === "videoCell")
          return toPiece(
            id,
            { image: cell.poster, orientation, videoSrc: cell.videoUrl },
            height,
          );

        return [];
      }),
    );
    const cover = toPiece(
      id,
      { image: p.coverImage, orientation, videoSrc: p.coverVideoUrl },
      height,
    );

    return [...cover, ...cells];
  });
}
