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
      className={`lg:gap-sm p-sm flex min-h-screen flex-col justify-between lg:grid lg:grid-cols-12 lg:py-0`}
    >
      <aside
        className={`gap-4xl lg:py-sm relative col-span-12 flex flex-col lg:sticky lg:top-0 lg:order-2 lg:col-span-4 lg:h-dvh lg:shrink-0 lg:justify-between lg:self-start`}
      >
        <div className="gap-2xs flex flex-col">
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

        <div className="gap-sm flex flex-col">
          {/* <SectionNav sections={sections} /> */}
          {nextProject ? (
            <div className="hidden lg:block">
              <NextUpCard project={nextProject} />
            </div>
          ) : null}
        </div>
      </aside>
      <main className="gap-sm lg:py-sm flex h-full flex-col lg:order-1 lg:col-span-8 lg:flex-1">
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
