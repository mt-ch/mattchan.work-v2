import { urlFor } from "@/lib/sanity/image";

export type StreamTile = {
  slug: string;
  title: string;
  src: string;
  width: number;
  height: number;
  blurDataURL?: string;
};

type ProjectInput = {
  title: string | null;
  slug: { current?: string } | null;
  coverImage: {
    asset?: unknown;
    metadata: { lqip: string | null } | null;
  } | null;
};

export const TILE_WIDTH = 1600;
export const TILE_HEIGHT = 900;

/** Projects lacking a title, slug or cover image have no tile. */
export function toStreamTiles(projects: ProjectInput[]): StreamTile[] {
  return projects.flatMap((project) => {
    const cover = project.coverImage;
    if (!project.title || !project.slug?.current || !cover?.asset) return [];
    return [
      {
        slug: project.slug.current,
        title: project.title,
        // Sanity crops to 16:9 around the Studio hotspot, so no excess pixels.
        src: urlFor(cover as Parameters<typeof urlFor>[0])
          .width(TILE_WIDTH)
          .height(TILE_HEIGHT)
          .fit("crop")
          .auto("format")
          .url(),
        width: TILE_WIDTH,
        height: TILE_HEIGHT,
        blurDataURL: cover.metadata?.lqip ?? undefined,
      },
    ];
  });
}
