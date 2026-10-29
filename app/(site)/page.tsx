// React and Next.js
import type { Metadata } from "next";

// Third-party libraries
import type { Image } from "sanity";

// Shared modules
import {
  ActiveProjectList,
  ActiveProjectProvider,
} from "@/components/features/landing/active-project";
import { LandingEntrance } from "@/components/features/landing/entrance/landing-entrance";
import { ImageStream } from "@/components/features/landing/image-stream";
import { MobileCarousel } from "@/components/features/landing/mobile-carousel";
import {
  bioToText,
  toProjectListItems,
} from "@/components/features/landing/sidebar-data";
import { toStreamTiles } from "@/components/features/landing/stream-data";
import type { ProjectListItem } from "@/components/features/projects/project-list";
import { AboutIdentity } from "@/components/layout/about-identity";
import { Availability } from "@/components/ui/availability";
import { getAbout, getProjects } from "@/lib/sanity";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { resolveSeo, type SeoObject } from "@/lib/seo/resolveSeo";

type About = Awaited<ReturnType<typeof getAbout>>;

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
 * The Landing sidebar: identity, links, the active Project list (desktop
 * only), then the owner's bio and availability.
 *
 * @param props.about - The About record, or null when none exists yet.
 * @param props.projects - The Projects to list.
 * @returns The sidebar.
 */
function LandingSidebar({
  about,
  projects,
}: {
  about: About;
  projects: ProjectListItem[];
}) {
  return (
    <aside
      data-entrance="sidebar"
      className="relative col-span-12 flex flex-col gap-4xl pt-sm pb-4xl lg:sticky lg:top-0 lg:order-2 lg:col-span-4 lg:h-full lg:shrink-0 lg:justify-between lg:self-start lg:py-sm"
    >
      <AboutIdentity about={about} />

      <div className="absolute top-1/2 hidden w-full -translate-y-1/2 lg:block">
        <ActiveProjectList projects={projects} />
      </div>

      <div className="flex flex-col gap-sm">
        <p className="text-small whitespace-pre-line text-foreground">
          {bioToText(about?.bio ?? null)}
        </p>
        {about?.availability?.status ? (
          <Availability isAvailable={about.availability.isAvailable ?? false}>
            {about.availability.status}
          </Availability>
        ) : null}
      </div>
    </aside>
  );
}

/**
 * The Landing page at `/`: sidebar with the owner's details and Project list,
 * beside the Project stream (desktop) or carousel (mobile).
 *
 * @returns The Landing page.
 */
export default async function HomePage() {
  const [about, projects] = await Promise.all([getAbout(), getProjects()]);

  const listItems = toProjectListItems(projects);
  const tiles = toStreamTiles(projects);

  return (
    <ActiveProjectProvider initialSlug={tiles[0]?.slug ?? listItems[0]?.slug}>
      <LandingEntrance>
        <div className="flex h-dvh flex-col justify-between overflow-hidden px-sm lg:grid lg:grid-cols-12 lg:grid-rows-1 lg:gap-sm">
          <LandingSidebar about={about} projects={listItems} />
          <main className="h-full pb-sm lg:order-1 lg:col-span-8 lg:flex lg:flex-1 lg:flex-col lg:gap-sm lg:pb-0">
            <ImageStream tiles={tiles} />
            <MobileCarousel tiles={tiles} />
          </main>
        </div>
      </LandingEntrance>
    </ActiveProjectProvider>
  );
}
