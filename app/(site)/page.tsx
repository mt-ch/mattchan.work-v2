// React and Next.js
import type { Metadata } from "next";

// Third-party libraries
import type { Image } from "sanity";

// Shared modules
import { toPlaygroundPieces } from "@/components/features/queue/queue-data";
import { Queue } from "@/components/features/queue/queue";
import { getAbout, getPlaygroundPieces } from "@/lib/sanity";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { resolveSeo, type SeoObject } from "@/lib/seo/resolveSeo";
import { AboutIdentity } from "@/components/layout/about-identity";

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

  // Each piece is cropped to its own orientation, which the Queue honours
  const pieces = toPlaygroundPieces(docs, CARD_IMAGE_HEIGHT);
  const name = about?.siteName ?? about?.name;

  return (
    <main className="flex min-h-screen grid-rows-2 flex-col justify-between p-sm lg:grid lg:grid-cols-12 lg:gap-sm lg:p-xs">
      <div className="relative col-span-12 flex flex-col gap-4xl lg:top-0 lg:col-span-4 lg:shrink-0">
        <AboutIdentity about={about} />
      </div>

      <p className="type-mono-caption relative z-10 col-span-2 col-start-11 text-right whitespace-pre-line text-foreground mix-blend-difference">
        14:55:35 GMT London
      </p>

      <p className="type-mono-caption relative z-10 col-span-6 row-start-2 self-end col-start-7 text-right whitespace-pre-line text-foreground mix-blend-difference">
        Available for collaborations or full time roles
      </p>
      <Queue
        pieces={pieces}
        heading={name ? `${name}: selected work` : "Selected work"}
      />
    </main>
  );
}
