// React and Next.js
import type { Metadata } from "next";

// Third-party libraries
import type { Image } from "sanity";

// Shared modules
import {
  ActiveProjectList,
  ActiveProjectProvider,
} from "@/components/features/landing/active-project";
import { ImageStream } from "@/components/features/landing/image-stream";
import { MobileCarousel } from "@/components/features/landing/mobile-carousel";
import {
  bioToText,
  toProjectListItems,
  toSiteLinks,
} from "@/components/features/landing/sidebar-data";
import { toStreamTiles } from "@/components/features/landing/stream-data";
import { SiteShell } from "@/components/layout/site-shell";
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
 * The sidebar's lower section: the owner's bio and availability.
 *
 * @param props.about - The About record, or null when none exists yet.
 * @returns The bio text, plus the availability badge when a status is set.
 */
function SidebarBottom({ about }: { about: About }) {
  return (
    <>
      <p className="text-small text-foreground whitespace-pre-line">
        {bioToText(about?.bio ?? null)}
      </p>
      {about?.availability?.status ? (
        <Availability isAvailable={about.availability.isAvailable ?? false}>
          {about.availability.status}
        </Availability>
      ) : null}
    </>
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
      <SiteShell
        fixed
        identity={{ name: about?.name ?? "", headline: about?.headline ?? "" }}
        links={toSiteLinks({
          email: about?.email ?? null,
          githubUrl: about?.githubUrl ?? null,
          linkedinUrl: about?.linkedinUrl ?? null,
          resumeUrl: about?.resumeUrl ?? null,
        })}
        middle={
          <div className="hidden lg:block">
            <ActiveProjectList projects={listItems} />
          </div>
        }
        bottom={<SidebarBottom about={about} />}
      >
        <ImageStream tiles={tiles} />
        <MobileCarousel tiles={tiles} />
      </SiteShell>
    </ActiveProjectProvider>
  );
}
