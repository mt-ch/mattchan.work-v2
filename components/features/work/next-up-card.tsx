// React and Next.js
import Link from "next/link";

// Shared modules
import { MediaFrame } from "@/components/ui/media-frame";
import type { ProjectsQueryResult } from "@/sanity.types";

type NextProject = ProjectsQueryResult[number];

/**
 * Card linking to the next Project, with its title, disciplines and cover.
 *
 * @param props.project - The Project to link to.
 * @returns The card, or nothing when the Project has no slug.
 */
export function NextUpCard({ project }: { project: NextProject }) {
  const slug = project.slug?.current;
  if (!slug) return null;

  const cover = project.coverImage;

  return (
    <Link
      href={`/work/${slug}`}
      className="group flex flex-row items-center justify-between gap-xs rounded-md bg-surface p-sm hover:bg-inverse-background hover:text-inverse-foreground"
    >
      <div className="flex flex-col gap-2xs">
        <span className="text-small text-foreground group-hover:text-background">
          Next up (Scroll)
        </span>
        <span className="text-small text-muted">{project.title}</span>
        <span className="text-small text-muted">
          {(project.discipline ?? []).join(" + ")}
        </span>
      </div>
      {cover?.asset ? (
        <div className="size-18">
          <MediaFrame image={cover} alt={project.title ?? ""} ratio="square" />
        </div>
      ) : null}
    </Link>
  );
}
