import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Image } from "sanity";

import { toSiteLinks } from "@/components/features/landing/sidebar-data";
import { ProjectMeta } from "@/components/features/work/project-meta";
import { StoryRows } from "@/components/features/work/story-rows";
import { SiteShell } from "@/components/layout/site-shell";
import { getAbout, getProject, getProjectSlugs } from "@/lib/sanity";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { resolveSeo, type SeoObject } from "@/lib/seo/resolveSeo";

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [about, project] = await Promise.all([getAbout(), getProject(slug)]);
  if (!project) return {};
  const seo = resolveSeo(
    {
      title: project.title,
      summary: project.summary,
      coverImage: project.coverImage as Image | null,
      seo: project.seo as SeoObject | null,
    },
    {
      siteName: about?.siteName ?? about?.name,
      defaultMetaDescription: about?.defaultMetaDescription,
      defaultOgImage: about?.defaultOgImage as Image | null | undefined,
    },
  );
  return buildMetadata(seo, `/work/${slug}`);
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [about, project] = await Promise.all([getAbout(), getProject(slug)]);
  if (!project) notFound();

  return (
    <SiteShell
      identity={{ name: about?.name ?? "", headline: about?.headline ?? "" }}
      links={toSiteLinks({
        email: about?.email ?? null,
        githubUrl: about?.githubUrl ?? null,
        linkedinUrl: about?.linkedinUrl ?? null,
        resumeUrl: about?.resumeUrl ?? null,
      })}
      bottom={
        <>
          <ProjectMeta
            title={project.title ?? ""}
            year={
              project.dateCompleted
                ? new Date(project.dateCompleted).getUTCFullYear()
                : undefined
            }
            discipline={project.discipline ?? []}
            summary={project.summary ?? ""}
          />
        </>
      }
    >
      <div className="gap-sm py-sm flex flex-col">
        <Link
          href="/"
          className="text-small text-foreground bg-surface p-sm hover:bg-inverse-background hover:text-inverse-foreground self-start rounded-md"
        >
          Return
        </Link>
        <StoryRows story={project.story} />
      </div>
    </SiteShell>
  );
}
