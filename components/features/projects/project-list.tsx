// React and Next.js
import Link from "next/link";

export type ProjectListItem = {
  slug: string;
  name: string;
  year?: number;
  discipline: string[];
};

/**
 * List of Projects, each linking to its Work page.
 *
 * @param props.projects - The Projects to list.
 * @param props.activeSlug - Slug of the Project to highlight, if any.
 * @returns The list; the active Project carries `aria-current="page"`.
 */
export function ProjectList({
  projects,
  activeSlug,
}: {
  projects: ProjectListItem[];
  activeSlug?: string;
}) {
  return (
    <ul className="flex flex-col gap-xs text-small font-normal text-foreground">
      {projects.map((project) => {
        const active = project.slug === activeSlug;

        return (
          <li key={project.slug}>
            <Link
              href={`/work/${project.slug}`}
              aria-current={active ? "page" : undefined}
              className="flex items-center justify-between rounded-md bg-surface p-sm hover:bg-inverse-background hover:text-inverse-foreground aria-[current=page]:bg-inverse-background aria-[current=page]:text-inverse-foreground"
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
