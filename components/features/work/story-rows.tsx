// Third-party libraries
import { PortableText } from "next-sanity";

// Shared modules
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

// The aspect ratio belongs to the row (3:2 for now); cells just fill it, so
// every cell in a row shares one height.
const ROW_ASPECT = 3 / 2;

/**
 * An image cell, cropped to fill its row.
 *
 * @param props.cell - The image cell.
 * @param props.fill - How the image fills the row.
 * @returns The image, or nothing when the cell has no image asset.
 */
function ImageCellView({ cell, fill }: { cell: ImageCell; fill: FillProps }) {
  const image = cell.image;
  if (!image?.asset) return null;

  return <MediaFrame image={image} alt={image.alt ?? ""} {...fill} />;
}

/**
 * A video cell: the poster image with the video playing over it.
 *
 * @param props.cell - The video cell.
 * @param props.fill - How the poster fills the row.
 * @returns The poster and video, or nothing when the cell has no poster asset.
 */
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

/**
 * Builds a heading cell's anchor ID from its block key, for section nav.
 *
 * @param key - The cell's `_key`.
 * @returns A stable element ID.
 */
export function textCellId(key: string) {
  return `block-${key}`;
}

/**
 * Collects the heading cells of a story as section-nav entries.
 *
 * @param story - The Project's story rows.
 * @returns One entry per heading cell, in order.
 */
export function getSections(story: Story) {
  return (story ?? []).flatMap((row) =>
    (row.items ?? []).flatMap((cell) =>
      cell._type === "textCell" && cell.heading
        ? [{ id: textCellId(cell._key), label: cell.heading }]
        : [],
    ),
  );
}

/**
 * A text cell: optional heading above portable-text content.
 *
 * @param props.cell - The text cell.
 * @returns The heading, with an anchor ID, and the content.
 */
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

/**
 * Renders a cell by its type.
 *
 * @param props.cell - The cell to render.
 * @param props.fill - How media in the cell fills its row.
 * @returns The matching view, or nothing for an unknown cell type.
 */
function CellView({ cell, fill }: { cell: Cell; fill: FillProps }) {
  if (cell._type === "imageCell")
    return <ImageCellView cell={cell} fill={fill} />;
  if (cell._type === "videoCell")
    return <VideoCellView cell={cell} fill={fill} />;
  if (cell._type === "textCell") return <TextCellView cell={cell} />;

  return null;
}

/**
 * Renders a Project's story as a stack of one- or two-cell rows.
 *
 * @param props.story - The Project's story rows.
 * @returns The rows. Media-only pairs stay two-up on mobile; rows with text
 * stack there, each cell keeping its own ratio.
 */
export function StoryRows({ story }: { story: Story }) {
  return (
    <>
      {(story ?? []).map((row) => {
        const twoUp = row.columns === 2;
        const mediaOnly = (row.items ?? []).every(
          (item) => item._type !== "textCell",
        );
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
