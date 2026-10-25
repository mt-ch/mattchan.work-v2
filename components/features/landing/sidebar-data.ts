import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faAt, faFile } from "@fortawesome/free-solid-svg-icons";
import { faGithub, faSquareLinkedin } from "@fortawesome/free-brands-svg-icons";

import type { ProjectListItem } from "@/components/features/projects/project-list";

export type SiteLink = { label: string; href: string; icon: IconProp };

type ProjectInput = {
  title: string | null;
  slug: { current?: string } | null;
  discipline: string[] | null;
  dateCompleted: string | null;
};

export function toProjectListItems(
  projects: ProjectInput[],
): ProjectListItem[] {
  return projects.flatMap((project) => {
    if (!project.title || !project.slug?.current) return [];
    return [
      {
        slug: project.slug.current,
        name: project.title,
        year: project.dateCompleted
          ? new Date(project.dateCompleted).getUTCFullYear()
          : undefined,
        discipline: project.discipline ?? [],
      },
    ];
  });
}

export function toSiteLinks(about: {
  email: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  resumeUrl: string | null;
}): SiteLink[] {
  const links: SiteLink[] = [];
  if (about.email) {
    links.push({ label: "Email", href: `mailto:${about.email}`, icon: faAt });
  }
  if (about.linkedinUrl) {
    links.push({
      label: "LinkedIn",
      href: about.linkedinUrl,
      icon: faSquareLinkedin,
    });
  }
  if (about.githubUrl) {
    links.push({ label: "GitHub", href: about.githubUrl, icon: faGithub });
  }
  if (about.resumeUrl) {
    links.push({ label: "Resume", href: about.resumeUrl, icon: faFile });
  }
  return links;
}

export function bioToText(
  bio: { children?: { text?: string }[] }[] | null,
): string {
  return (bio ?? [])
    .map((block) => (block.children ?? []).map((c) => c.text ?? "").join(""))
    .join("\n\n");
}
