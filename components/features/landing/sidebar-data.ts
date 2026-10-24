import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faAt, faFile, faLink } from "@fortawesome/free-solid-svg-icons";
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

const platformIcons: Record<string, IconProp> = {
  linkedin: faSquareLinkedin,
  github: faGithub,
};

export function toSiteLinks(about: {
  email: string | null;
  socialLinks: { platform?: string; url?: string }[] | null;
  resumeUrl: string | null;
}): SiteLink[] {
  const links: SiteLink[] = [];
  if (about.email) {
    links.push({ label: "Email", href: `mailto:${about.email}`, icon: faAt });
  }
  for (const { platform, url } of about.socialLinks ?? []) {
    if (!platform || !url) continue;
    links.push({
      label: platform,
      href: url,
      icon: platformIcons[platform.toLowerCase()] ?? faLink,
    });
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
