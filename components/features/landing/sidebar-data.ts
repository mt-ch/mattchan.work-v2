import type { ProjectListItem } from "@/components/features/projects/project-list";

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

export function bioToText(
  bio: { children?: { text?: string }[] }[] | null,
): string {
  return (bio ?? [])
    .map((block) => (block.children ?? []).map((c) => c.text ?? "").join(""))
    .join("\n\n");
}
