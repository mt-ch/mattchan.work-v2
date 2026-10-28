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

type FillProps = { aspect: number; sizes: string; className: string };

function ImageCellView({ cell, fill }: { cell: ImageCell; fill: FillProps }) {
  const image = cell.image;
  if (!image?.asset) return null;
  return <MediaFrame image={image} alt={image.alt ?? ""} {...fill} />;
}

function VideoCellView({ cell, fill }: { cell: VideoCell; fill: FillProps }) {
  const poster = cell.poster;
  if (!poster?.asset) return null;
  return (
    <MediaFrame image={poster} alt={cell.label ?? ""} {...fill}>
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
      className="flex h-full scroll-mt-sm flex-col justify-end gap-sm py-lg text-foreground lg:py-0"
    >
      {cell.heading ? (
        <h2 className="text-small text-foreground">{cell.heading}</h2>
      ) : null}
      <div className="flex flex-col gap-xs text-small font-light text-muted">
        <PortableText value={cell.content ?? []} />
      </div>
    </div>
  );
}

function CellView({ cell, fill }: { cell: Cell; fill: FillProps }) {
  if (cell._type === "imageCell")
    return <ImageCellView cell={cell} fill={fill} />;
  if (cell._type === "videoCell")
    return <VideoCellView cell={cell} fill={fill} />;
  if (cell._type === "textCell") return <TextCellView cell={cell} />;
  return null;
}

// The aspect ratio belongs to the row (3:2 for now); cells just fill it, so
// every cell in a row shares one height.
const ROW_ASPECT = 3 / 2;

export function StoryRows({ story }: { story: Story }) {
  return (
    <>
      {(story ?? []).map((row) => {
        const twoUp = row.columns === 2;
        // Media-only pairs stay two-up on mobile; rows with text stack.
        const mediaOnly = (row.items ?? []).every(
          (item) => item._type !== "textCell",
        );
        // Rows with text stack on mobile, where each cell keeps its own ratio.
        const stacked = twoUp && !mediaOnly;
        const columns = twoUp ? 2 : 1;
        const fill: FillProps = {
          aspect: ROW_ASPECT / columns,
          sizes: twoUp
            ? "(min-width: 1024px) 33vw, 50vw"
            : "(min-width: 1024px) 66vw, 100vw",
          className: stacked ? "aspect-3/2 lg:aspect-auto" : "",
        };
        return (
          <div
            key={row._key}
            className={`grid items-start gap-sm ${stacked ? "lg:aspect-3/2" : "aspect-3/2"} ${
              twoUp
                ? mediaOnly
                  ? "grid-cols-2"
                  : "grid-cols-1 lg:grid-cols-2"
                : "grid-cols-1"
            }`}
          >
            {(row.items ?? []).map((cell) => (
              <CellView key={cell._key} cell={cell} fill={fill} />
            ))}
          </div>
        );
      })}
    </>
  );
}
