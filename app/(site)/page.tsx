// React and Next.js
import type { Metadata } from "next";

// Third-party libraries
import type { Image } from "sanity";

// Shared modules
import { Playground } from "@/components/features/playground/playground";
import { playgroundConfig } from "@/components/features/playground/config";
import { toPlaygroundPieces } from "@/components/features/playground/playground-data";
import { getAbout, getPlaygroundPieces } from "@/lib/sanity";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { resolveSeo, type SeoObject } from "@/lib/seo/resolveSeo";

/** Pixel density the tile images are cropped for; next/image trims it per device. */
const IMAGE_DENSITY = 2;

/**
 * Builds the Landing page metadata from the About singleton.
 *
 * @returns Next metadata with the title, description and OG image resolved.
 */
export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout();
  const seo = resolveSeo(
    {
      title: about?.siteName ?? about?.name,
      seo: about?.seo as SeoObject | null,
    },
    {
      siteName: about?.siteName ?? about?.name,
      defaultMetaDescription: about?.defaultMetaDescription,
      defaultOgImage: about?.defaultOgImage as Image | null | undefined,
    },
  );

  return buildMetadata(seo, "/");
}

/**
 * The Landing page at `/`: the experimental Playground, an infinite draggable
 * canvas of Playground pieces.
 *
 * @returns The Landing page.
 */
export default async function HomePage() {
  const [about, docs] = await Promise.all([getAbout(), getPlaygroundPieces()]);

  const pieces = toPlaygroundPieces(
    docs,
    playgroundConfig.layout.tileHeight * IMAGE_DENSITY,
  );
  const name = about?.siteName ?? about?.name;

  return (
    <main>
      <Playground
        pieces={pieces}
        heading={name ? `${name}: selected work` : "Selected work"}
      />
    </main>
  );
}
