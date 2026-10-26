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
      className="gap-xs bg-surface p-sm hover:bg-inverse-background hover:text-inverse-foreground flex flex-col rounded-md"
    >
      <span className="text-small">Next up</span>
      {cover?.asset ? <MediaFrame image={cover} alt="" /> : null}
      <span className="text-small">{project.title}</span>
      <span className="text-small opacity-70">
        {(project.discipline ?? []).join(" + ")}
      </span>
    </Link>
  );
}
