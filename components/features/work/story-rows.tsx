import { PortableText } from "next-sanity";

import { MediaFrame } from "@/components/ui/media-frame";
import { TileVideo } from "@/components/ui/tile-video";
import type { ProjectBySlugQueryResult } from "@/sanity.types";

type Story = NonNullable<ProjectBySlugQueryResult>["story"];
type Row = NonNullable<Story>[number];
type Cell = NonNullable<Row["items"]>[number];
type ImageCell = Extract<Cell, { _type: "imageCell" }>;
type TextCell = Extract<Cell, { _type: "textCell" }>;
type VideoCell = Extract<Cell, { _type: "videoCell" }>;

function ImageCellView({ cell }: { cell: ImageCell }) {
  const image = cell.image;
  if (!image?.asset) return null;
  return <MediaFrame image={image} alt={image.alt ?? ""} />;
}

function VideoCellView({ cell }: { cell: VideoCell }) {
  const poster = cell.poster;
  if (!poster?.asset) return null;
  return (
    <MediaFrame image={poster} alt={cell.label ?? ""}>
      {cell.videoUrl ? (
        <TileVideo src={cell.videoUrl} label={cell.label ?? undefined} />
      ) : null}
    </MediaFrame>
  );
}

// Heading cells get a stable id from the block key for section nav anchors.
export function textCellId(key: string) {
  return `block-${key}`;
}

/** Heading cells of a story, in order, as section-nav entries. */
export function getSections(story: Story) {
  return (story ?? []).flatMap((row) =>
    (row.items ?? []).flatMap((cell) =>
      cell._type === "textCell" && cell.heading
        ? [{ id: textCellId(cell._key), label: cell.heading }]
        : [],
    ),
  );
}

function TextCellView({ cell }: { cell: TextCell }) {
  return (
    <div
      id={cell.heading ? textCellId(cell._key) : undefined}
      className="gap-sm bg-surface p-sm text-foreground scroll-mt-sm flex flex-col rounded-md"
    >
      {cell.heading ? (
        <h2 className="text-subheading">{cell.heading}</h2>
      ) : null}
      <div className="text-body gap-sm flex flex-col">
        <PortableText value={cell.content ?? []} />
      </div>
    </div>
  );
}

function CellView({ cell }: { cell: Cell }) {
  if (cell._type === "imageCell") return <ImageCellView cell={cell} />;
  if (cell._type === "videoCell") return <VideoCellView cell={cell} />;
  if (cell._type === "textCell") return <TextCellView cell={cell} />;
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
