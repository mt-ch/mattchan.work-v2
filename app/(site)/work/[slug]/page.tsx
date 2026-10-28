import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Image } from "sanity";

import { NextUpCard } from "@/components/features/work/next-up-card";
import { ProjectMeta } from "@/components/features/work/project-meta";
import { SectionNav } from "@/components/features/work/section-nav";
import { getSections, StoryRows } from "@/components/features/work/story-rows";
import { toSiteLinks } from "@/components/layout/site-links";
import { IdentityCard } from "@/components/layout/identity-card";
import { IconButtonRow } from "@/components/layout/icon-button-row";

import {
  getAbout,
  getProject,
  getProjects,
  getProjectSlugs,
} from "@/lib/sanity";
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
  const projects = await getProjects();
  const index = projects.findIndex((p) => p._id === project._id);
  const nextProject =
    projects.length > 1 ? projects[(index + 1) % projects.length] : undefined;
  const sections = getSections(project.story);

  return (
    <div
      className={`flex min-h-screen flex-col justify-between p-sm lg:grid lg:grid-cols-12 lg:gap-sm lg:py-0`}
    >
      <aside
        className={`relative col-span-12 flex flex-col gap-4xl lg:sticky lg:top-0 lg:order-2 lg:col-span-4 lg:h-dvh lg:shrink-0 lg:justify-between lg:self-start lg:py-sm`}
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

        <div className="flex flex-col gap-sm">
          {/* <SectionNav sections={sections} /> */}
          {nextProject ? (
            <div className="hidden lg:block">
              <NextUpCard project={nextProject} />
            </div>
          ) : null}
        </div>
      </aside>
      <main className="flex h-full flex-col gap-sm lg:order-1 lg:col-span-8 lg:flex-1 lg:py-sm">
        <StoryRows story={project.story} />
        {nextProject ? (
          <div className="block lg:hidden">
            <NextUpCard project={nextProject} />
          </div>
        ) : null}
      </main>
    </div>
  );
}
