import type { Metadata } from "next";
import type { Image } from "sanity";

import {
  bioToText,
  toProjectListItems,
} from "@/components/features/landing/sidebar-data";
import { toSiteLinks } from "@/components/layout/site-links";
import {
  ActiveProjectList,
  ActiveProjectProvider,
} from "@/components/features/landing/active-project";
import { ImageStream } from "@/components/features/landing/image-stream";
import { MobileCarousel } from "@/components/features/landing/mobile-carousel";
import { toStreamTiles } from "@/components/features/landing/stream-data";

import { IdentityCard } from "@/components/layout/identity-card";
import { IconButtonRow } from "@/components/layout/icon-button-row";

import { Availability } from "@/components/ui/availability";
import { getAbout, getProjects } from "@/lib/sanity";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { resolveSeo, type SeoObject } from "@/lib/seo/resolveSeo";

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

export default async function HomePage() {
  const [about, projects] = await Promise.all([getAbout(), getProjects()]);

  const listItems = toProjectListItems(projects);
  const tiles = toStreamTiles(projects);

  return (
    <ActiveProjectProvider initialSlug={tiles[0]?.slug ?? listItems[0]?.slug}>
      <div
        className={`flex h-dvh flex-col justify-between overflow-hidden px-sm lg:grid lg:grid-cols-12 lg:grid-rows-1 lg:gap-sm`}
      >
        <aside
          className={`relative col-span-12 flex flex-col gap-4xl pt-sm pb-4xl lg:sticky lg:top-0 lg:order-2 lg:col-span-4 lg:h-full lg:shrink-0 lg:justify-between lg:self-start lg:py-sm`}
        >
          <div className="flex flex-col gap-2xs">
            <IdentityCard
              name={about?.name ?? ""}
              headline={about?.headline ?? ""}
            />
            <IconButtonRow
              links={toSiteLinks({
                email: about?.email ?? null,
                githubUrl: about?.githubUrl ?? null,
                linkedinUrl: about?.linkedinUrl ?? null,
                resumeUrl: about?.resumeUrl ?? null,
              })}
            />
          </div>

          <div className="absolute top-1/2 hidden w-full -translate-y-1/2 lg:block">
            <ActiveProjectList projects={listItems} />
          </div>

          <div className="flex flex-col gap-sm">
            <p className="text-small whitespace-pre-line text-foreground">
              {bioToText(about?.bio ?? null)}
            </p>
            {about?.availability?.status ? (
              <Availability
                isAvailable={about.availability.isAvailable ?? false}
              >
                {about.availability.status}
              </Availability>
            ) : null}
          </div>
        </aside>
        <main className="h-full pb-sm lg:order-1 lg:col-span-8 lg:flex lg:flex-1 lg:flex-col lg:gap-sm lg:pb-0">
          <ImageStream tiles={tiles} />
          <MobileCarousel tiles={tiles} />
        </main>
      </div>
    </ActiveProjectProvider>
  );
}
