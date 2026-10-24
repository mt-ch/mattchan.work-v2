import {
  bioToText,
  toProjectListItems,
  toSiteLinks,
} from "@/components/features/landing/sidebar-data";
import { ProjectList } from "@/components/features/projects/project-list";
import { SiteShell } from "@/components/layout/site-shell";
import { Availability } from "@/components/ui/availability";
import { getAbout, getProjects } from "@/lib/sanity";

export default async function HomePage() {
  const [about, projects] = await Promise.all([getAbout(), getProjects()]);

  return (
    <SiteShell
      fixed
      identity={{ name: about?.name ?? "", headline: about?.headline ?? "" }}
      links={toSiteLinks({
        email: about?.email ?? null,
        socialLinks: about?.socialLinks ?? null,
        resumeUrl: about?.resumeUrl ?? null,
      })}
      middle={
        <div className="hidden lg:block">
          <ProjectList projects={toProjectListItems(projects)} />
        </div>
      }
      bottom={
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
      }
    >
      {/* TODO(#13): Landing sections. */}
      {null}
    </SiteShell>
  );
}
