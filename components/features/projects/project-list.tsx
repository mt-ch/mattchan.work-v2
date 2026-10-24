import Link from "next/link";

export type ProjectListItem = {
  slug: string;
  name: string;
  year: number;
  discipline: string[];
};

export function ProjectList({
  projects,
  activeSlug,
}: {
  projects: ProjectListItem[];
  activeSlug?: string;
}) {
  return (
    <ul className="text-mono-caption font-mono">
      {projects.map((project) => {
        const active = project.slug === activeSlug;
        return (
          <li key={project.slug}>
            <Link
              href={`/work/${project.slug}`}
              aria-current={active ? "page" : undefined}
              className="gap-grid-gap px-sm py-xs hover:bg-inverse-background hover:text-inverse-foreground aria-[current=page]:bg-inverse-background aria-[current=page]:text-inverse-foreground grid grid-cols-[1fr_auto_1fr]"
            >
              <span>{project.name}</span>
              <span>{project.year}</span>
              <span className="text-right">
                {project.discipline.join(" + ")}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
