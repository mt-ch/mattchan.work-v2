// Third-party libraries
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faGithub, faSquareLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faAt, faFile } from "@fortawesome/free-solid-svg-icons";

// Shared modules
import type { ProjectListItem } from "@/components/features/projects/project-list";

export type SiteLink = { label: string; href: string; icon: IconProp };

type ProjectInput = {
  title: string | null;
  slug: { current?: string } | null;
  discipline: string[] | null;
  dateCompleted: string | null;
};

/**
 * Maps Projects to sidebar list items. Projects without a title or slug are
 * left out.
 *
 * @param projects - Projects as returned by the projects query.
 * @returns One list item per listable Project, in order, with the year derived
 * from `dateCompleted`.
 */
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

/**
 * Builds the sidebar's icon links from the About record. Links the owner
 * hasn't filled in are left out.
 *
 * @param about - The contact fields from the About record.
 * @returns Email, LinkedIn, GitHub and Resume links, in that order.
 */
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

/**
 * Flattens portable-text bio blocks into plain text.
 *
 * @param bio - The About record's bio blocks, or null when unset.
 * @returns The text of each block, separated by a blank line.
 */
export function bioToText(
  bio: { children?: { text?: string }[] }[] | null,
): string {
  return (bio ?? [])
    .map((block) => (block.children ?? []).map((c) => c.text ?? "").join(""))
    .join("\n\n");
}
