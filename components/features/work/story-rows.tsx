import Image from "next/image";

import { urlFor } from "@/lib/sanity/image";
import type { ProjectBySlugQueryResult } from "@/sanity.types";

type Story = NonNullable<ProjectBySlugQueryResult>["story"];
type Row = NonNullable<Story>[number];
type Cell = NonNullable<Row["items"]>[number];
type ImageCell = Extract<Cell, { _type: "imageCell" }>;

const MEDIA_WIDTH = 1600;
const MEDIA_HEIGHT = 1067;

function ImageCellView({ cell }: { cell: ImageCell }) {
  const image = cell.image;
  if (!image?.asset) return null;
  return (
    <div className="relative aspect-3/2 overflow-hidden rounded-md">
      <Image
        src={urlFor(image as Parameters<typeof urlFor>[0])
          .width(MEDIA_WIDTH)
          .height(MEDIA_HEIGHT)
          .fit("crop")
          .auto("format")
          .url()}
        alt={image.alt ?? ""}
        fill
        placeholder={image.metadata?.lqip ? "blur" : "empty"}
        blurDataURL={image.metadata?.lqip ?? undefined}
        sizes="(min-width: 1024px) 66vw, 100vw"
        className="object-cover"
      />
    </div>
  );
}

// Video and text cells are skipped until their renderers land.
function CellView({ cell }: { cell: Cell }) {
  if (cell._type === "imageCell") return <ImageCellView cell={cell} />;
  return null;
}

export function StoryRows({ story }: { story: Story }) {
  return (
    <>
      {(story ?? []).map((row) => {
        const twoUp = row.columns === 2;
        // Media-only pairs stay two-up on mobile; rows with text stack.
        const mediaOnly = (row.items ?? []).every(
          (item) => item._type !== "textCell",
        );
        return (
          <div
            key={row._key}
            className={`gap-sm grid items-start ${
              twoUp
                ? mediaOnly
                  ? "grid-cols-2"
                  : "grid-cols-1 lg:grid-cols-2"
                : "grid-cols-1"
            }`}
          >
            {(row.items ?? []).map((cell) => (
              <CellView key={cell._key} cell={cell} />
            ))}
          </div>
        );
      })}
    </>
  );
}
