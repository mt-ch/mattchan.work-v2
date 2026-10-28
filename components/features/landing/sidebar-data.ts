// Shared modules
import type { ProjectListItem } from "@/components/features/projects/project-list";

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
