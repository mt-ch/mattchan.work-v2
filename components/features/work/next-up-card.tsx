import Link from "next/link";

import { MediaFrame } from "@/components/ui/media-frame";
import type { ProjectsQueryResult } from "@/sanity.types";

type NextProject = ProjectsQueryResult[number];

export function NextUpCard({ project }: { project: NextProject }) {
  const slug = project.slug?.current;
  if (!slug) return null;
  const cover = project.coverImage;
  return (
    <Link
      href={`/work/${slug}`}
      className="group gap-xs bg-surface p-sm hover:bg-inverse-background hover:text-inverse-foreground flex flex-row items-center justify-between rounded-md"
    >
      <div className="gap-2xs flex flex-col">
        <span className="text-small text-foreground group-hover:text-background">Next up (Scroll)</span>
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
