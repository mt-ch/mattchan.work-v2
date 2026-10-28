"use client";

// React and Next.js
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Local modules
import { useActiveProject } from "./active-project";
import type { StreamTile } from "./stream-data";
import { startStream } from "./stream-motion";
import { TileVideo } from "@/components/ui/tile-video";

/**
 * One Project tile in the stream. Repeated copies are hidden from assistive
 * tech and the tab order so each Project is announced once.
 *
 * @param props.tile - The Project tile to show.
 * @param props.copy - Which repeat of the set this tile belongs to; 0 is the real one.
 * @returns A link to the Project's Work page.
 */
function StreamTileLink({ tile, copy }: { tile: StreamTile; copy: number }) {
  return (
    <Link
      href={`/work/${tile.slug}`}
      draggable={false}
      aria-hidden={copy > 0 || undefined}
      tabIndex={copy > 0 ? -1 : undefined}
      className="relative block shrink-0 overflow-hidden rounded-md"
    >
      <Image
        src={tile.src}
        alt={copy === 0 ? tile.title : ""}
        width={tile.width}
        height={tile.height}
        placeholder={tile.blurDataURL ? "blur" : "empty"}
        blurDataURL={tile.blurDataURL}
        sizes="(min-width: 1024px) 66vw, 0px"
        draggable={false}
        className="aspect-3/2 h-auto w-full object-cover"
      />
      {tile.videoSrc ? <TileVideo src={tile.videoSrc} /> : null}
    </Link>
  );
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
  const { setSlug } = useActiveProject();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(3);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || tiles.length === 0) return;

    return startStream({
      viewport,
      track,
      tiles,
      onActiveSlug: setSlug,
      onCopiesNeeded: (needed) => setCopies((c) => Math.max(c, needed)),
    });
  }, [tiles, setSlug]);

  return (
    <div
      ref={viewportRef}
      className="hidden h-full overflow-hidden lg:block"
      style={{ touchAction: "none" }}
    >
      <div
        ref={trackRef}
        className="flex flex-col gap-sm will-change-transform"
      >
        {Array.from({ length: copies }, (_, copy) =>
          tiles.map((tile) => (
            <StreamTileLink
              key={`${copy}-${tile.slug}`}
              tile={tile}
              copy={copy}
            />
          )),
        )}
      </div>
    </div>
  );
}
