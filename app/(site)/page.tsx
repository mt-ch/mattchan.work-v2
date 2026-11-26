// React and Next.js
import type { Metadata } from "next";

// Third-party libraries
import type { Image } from "sanity";

// Shared modules
import { toPlaygroundPieces } from "@/components/features/playground/playground-data";
import { Queue } from "@/components/features/queue/queue";
import { getAbout, getPlaygroundPieces } from "@/lib/sanity";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { resolveSeo, type SeoObject } from "@/lib/seo/resolveSeo";
import { AboutIdentity } from "@/components/features/about-identity";

/** Height in px the card images are cropped to; next/image trims it per device. */
const CARD_IMAGE_HEIGHT = 1200;

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
 * The Landing page at `/`: the Queue, a diagonal fan of cards from Playground
 * pieces.
 *
 * @returns The Landing page.
 */
export default async function HomePage() {
  const [about, docs] = await Promise.all([getAbout(), getPlaygroundPieces()]);

  // Every Queue card is 4:5, so crop each piece as portrait around its hotspot
  const portraitDocs = docs.map((doc) => ({
    ...doc,
    orientation: "portrait" as const,
  }));
  const pieces = toPlaygroundPieces(portraitDocs, CARD_IMAGE_HEIGHT);
  const name = about?.siteName ?? about?.name;

  return (
    <main>
      <aside className="relative col-span-12 flex flex-col gap-4xl lg:sticky lg:top-0 lg:order-2 lg:col-span-4 lg:h-dvh lg:shrink-0 lg:justify-between lg:self-start lg:py-sm">
        <AboutIdentity about={about} />
      </aside>
      <Queue
        pieces={pieces}
        heading={name ? `${name}: selected work` : "Selected work"}
      />
    </main>
  );
}
