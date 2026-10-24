import Link from "next/link";

export type ProjectListItem = {
  slug: string;
  name: string;
  year?: number;
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
    <ul className="text-small text-foreground gap-xs flex flex-col font-normal">
      {projects.map((project) => {
        const active = project.slug === activeSlug;
        return (
          <li key={project.slug}>
            <Link
              href={`/work/${project.slug}`}
              aria-current={active ? "page" : undefined}
              className="p-sm bg-surface hover:bg-inverse-background hover:text-inverse-foreground aria-[current=page]:bg-inverse-background aria-[current=page]:text-inverse-foreground flex items-center justify-between rounded-md"
            >
              <span>{project.name}</span>
              <div className="text-muted">
                {/* <span>{project.year}</span> */}
                <span className="text-right">
                  {project.discipline.join(" + ")}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
