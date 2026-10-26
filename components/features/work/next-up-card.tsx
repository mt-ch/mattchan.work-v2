import Image from "next/image";
import Link from "next/link";

import { urlFor } from "@/lib/sanity/image";
import type { OtherProjectsQueryResult } from "@/sanity.types";

type NextProject = OtherProjectsQueryResult[number];

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
      {cover?.asset ? (
        <div className="relative aspect-3/2 overflow-hidden rounded-md">
          <Image
            src={urlFor(cover as Parameters<typeof urlFor>[0])
              .width(1600)
              .height(1067)
              .fit("crop")
              .auto("format")
              .url()}
            alt=""
            fill
            placeholder={cover.metadata?.lqip ? "blur" : "empty"}
            blurDataURL={cover.metadata?.lqip ?? undefined}
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <span className="text-small">{project.title}</span>
      <span className="text-small opacity-70">
        {(project.discipline ?? []).join(", ")}
      </span>
    </Link>
  );
}
