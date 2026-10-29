"use client";

// React and Next.js
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Local modules
import { ENTRANCE_CONFIG } from "./entrance/entrance-config";
import { useEntrance } from "./entrance/entrance-context";
import { STACK_INDEX_ATTRIBUTE } from "./entrance/entrance-play";
import { useActiveProject } from "./active-project";
import type { StreamTile } from "./stream-data";
import { createStream } from "./stream-motion";
import { TileVideo } from "@/components/ui/tile-video";

/** The copy of the set that rests at the viewport centre; the one announced and stacked. */
const REAL_COPY = 1;

/**
 * One Project tile in the stream. Repeated copies are hidden from assistive
 * tech and the tab order so each Project is announced once.
 *
 * @param props.tile - The Project tile to show.
 * @param props.copy - Which repeat of the set this tile belongs to; 1 is the real one, the copy at the centre when the stream rests.
 * @param props.index - The tile's place in the set.
 * @returns A link to the Project's Work page.
 */
function StreamTileLink({
  tile,
  copy,
  index,
}: {
  tile: StreamTile;
  copy: number;
  index: number;
}) {
  // Copy 1 sits at the viewport centre at rest, so its first tiles are the
  // Entrance stack and the accessible copy: fetch them first
  const inStack = copy === REAL_COPY && index < ENTRANCE_CONFIG.stackSize;

  return (
    <Link
      href={`/work/${tile.slug}`}
      data-entrance="tile"
      {...(inStack && { [STACK_INDEX_ATTRIBUTE]: index })}
      draggable={false}
      aria-hidden={copy !== REAL_COPY || undefined}
      tabIndex={copy !== REAL_COPY ? -1 : undefined}
      className="relative block shrink-0 overflow-hidden rounded-md"
    >
      <Image
        src={tile.src}
        alt={copy === REAL_COPY ? tile.title : ""}
        width={tile.width}
        height={tile.height}
        placeholder={tile.blurDataURL ? "blur" : "empty"}
        blurDataURL={tile.blurDataURL}
        sizes="(min-width: 1024px) 66vw, 0px"
        preload={inStack}
        fetchPriority={inStack ? "high" : undefined}
        draggable={false}
        className="aspect-3/2 h-auto w-full object-cover"
      />
      {tile.videoSrc ? <TileVideo src={tile.videoSrc} /> : null}
    </Link>
  );
}

/**
 * Runs the stream's motion against its two elements.
 *
 * @param tiles - The Project tiles to loop.
 * @returns The element refs and how many copies of the set to render.
 */
function useStream(tiles: StreamTile[]) {
  const { setSlug } = useActiveProject();
  const { registerController } = useEntrance();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(3);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || tiles.length === 0) return;

    const stream = createStream({
      viewport,
      track,
      tiles,
      onActiveSlug: setSlug,
      onCopiesNeeded: (needed) => setCopies((c) => Math.max(c, needed)),
    });

    // The Entrance starts the stream when it completes
    const unregister = registerController(stream);

    return () => {
      unregister();
      stream.destroy();
    };
  }, [tiles, setSlug, registerController]);

  return { viewportRef, trackRef, copies };
}

/**
 * Desktop Landing stream: Project tiles flowing vertically in an endless loop.
 * Wheel and touch input anywhere on the window boosts the flow, and the Project
 * at the viewport centre becomes the active one.
 *
 * @param props.tiles - The Project tiles to loop.
 * @returns The stream, hidden below the `lg` breakpoint.
 */
export function ImageStream({ tiles }: { tiles: StreamTile[] }) {
  const { viewportRef, trackRef, copies } = useStream(tiles);

  return (
    <div
      ref={viewportRef}
      data-entrance="stream"
      className="hidden h-full overflow-hidden lg:block"
      style={{ touchAction: "none" }}
    >
      <div
        ref={trackRef}
        className="flex flex-col gap-sm will-change-transform"
      >
        {Array.from({ length: copies }, (_, copy) =>
          tiles.map((tile, index) => (
            <StreamTileLink
              key={`${copy}-${tile.slug}`}
              tile={tile}
              copy={copy}
              index={index}
            />
          )),
        )}
      </div>
    </div>
  );
}
