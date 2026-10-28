// React and Next.js
import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Third-party libraries
import type { Image } from "sanity";

// Shared modules
import { NextUpCard } from "@/components/features/work/next-up-card";
import { ProjectMeta } from "@/components/features/work/project-meta";
import { StoryRows } from "@/components/features/work/story-rows";
import { AboutIdentity } from "@/components/layout/about-identity";
import {
  getAbout,
  getProject,
  getProjects,
  getProjectSlugs,
} from "@/lib/sanity";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { resolveSeo, type SeoObject } from "@/lib/seo/resolveSeo";

type About = Awaited<ReturnType<typeof getAbout>>;
type Project = NonNullable<Awaited<ReturnType<typeof getProject>>>;
type NextProject = Awaited<ReturnType<typeof getProjects>>[number];

/**
 * Lists every Project slug so Work pages are prerendered.
 *
 * @returns One `{ slug }` params object per Project.
 */
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();

  return slugs.map((slug) => ({ slug }));
}

/**
 * Builds a Work page's metadata from its Project and the About defaults.
 *
 * @param props.params - Route params containing the Project slug.
 * @returns Next metadata, or an empty object when the Project doesn't exist.
 */
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

/**
 * The Work page's sidebar: identity, links, the Project's details, and
 * (desktop only) a card for the next Project.
 *
 * @param props.about - The About record, or null when none exists yet.
 * @param props.project - The Project being shown.
 * @param props.nextProject - The Project to link to next, if there is another.
 * @returns The sidebar.
 */
function WorkSidebar({
  about,
  project,
  nextProject,
}: {
  about: About;
  project: Project;
  nextProject?: NextProject;
}) {
  return (
    <aside className="relative col-span-12 flex flex-col gap-4xl lg:sticky lg:top-0 lg:order-2 lg:col-span-4 lg:h-dvh lg:shrink-0 lg:justify-between lg:self-start lg:py-sm">
      <AboutIdentity about={about} />

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
  );
}

/**
 * Picks the Project after the current one, wrapping from last to first.
 *
 * @param projects - Every Project, in display order.
 * @param current - The Project being shown.
 * @returns The next Project, or undefined when it is the only one.
 */
function pickNextProject(projects: NextProject[], current: Project) {
  if (projects.length <= 1) return undefined;

  const index = projects.findIndex((p) => p._id === current._id);

  return projects[(index + 1) % projects.length];
}

/**
 * A Project's Work page: sidebar with its details, beside the story rows.
 *
 * @param props.params - Route params containing the Project slug.
 * @returns The Work page, or a 404 when the Project doesn't exist.
 */
export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [about, project] = await Promise.all([getAbout(), getProject(slug)]);
  if (!project) notFound();

  const projects = await getProjects();
  const nextProject = pickNextProject(projects, project);

  return (
    <div className="flex min-h-screen flex-col justify-between p-sm lg:grid lg:grid-cols-12 lg:gap-sm lg:py-0">
      <WorkSidebar about={about} project={project} nextProject={nextProject} />
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
