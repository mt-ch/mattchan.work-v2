"use client";

// React and Next.js
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Shared modules
import { useMotionAllowed } from "@/lib/motion/use-motion-allowed";

// Local modules
import type { Tile } from "./layout";

/**
 * Muted looping video over a tile's poster. It never decides for itself when
 * to play: the motion layer plays the few nearest the centre. Not rendered at
 * all under reduced motion, so the poster stays.
 *
 * @param props.tileKey - The tile's key, which the motion layer finds the video by.
 * @param props.src - URL of the video file.
 * @returns The video, or nothing when motion is not allowed.
 */
function PlaygroundVideo({ tileKey, src }: { tileKey: string; src: string }) {
  const [playing, setPlaying] = useState(false);
  const allowed = useMotionAllowed();

  if (!allowed) return null;

  return (
    <video
      data-video-key={tileKey}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      tabIndex={-1}
      draggable={false}
      onPlaying={() => setPlaying(true)}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
        playing ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}

/**
 * The clickable face of a tile: media, then the vertical Project name and
 * running index beside it.
 *
 * @param props.tile - The tile to draw.
 * @returns A link to the Project's Work page.
 */
function TileFace({ tile }: { tile: Tile }) {
  const { piece } = tile;

  return (
    <Link
      href={`/work/${piece.slug}`}
      draggable={false}
      className="group relative block h-full w-full rounded-r-md bg-surface py-2xs pl-2xs transition-transform duration-300 hover:scale-[1.02]"
    >
      <span className="relative block h-full w-full overflow-hidden rounded-sm">
        <Image
          src={piece.src}
          alt=""
          fill
          placeholder={piece.blurDataURL ? "blur" : "empty"}
          blurDataURL={piece.blurDataURL}
          sizes={`${tile.width}px`}
          draggable={false}
          className="object-cover"
        />
        {piece.videoSrc ? (
          <PlaygroundVideo tileKey={tile.key} src={piece.videoSrc} />
        ) : null}
      </span>
      <span className="type-mono-caption absolute top-0 right-full flex h-full items-start justify-between rounded-l-md bg-surface px-xs py-xs uppercase transition-colors duration-300 [writing-mode:sideways-lr] group-hover:text-foreground">
        <span className="text-foreground">{piece.title}</span>
        <span aria-hidden className="text-muted">
          {tile.label}
        </span>
      </span>
    </Link>
  );
}

/**
 * One tile on the canvas, wrapped in layers so position, velocity effects and
 * the intro each own their own transform.
 *
 * @param props.tile - The tile to draw, with its world position.
 * @returns The positioned tile.
 */
export function PlaygroundTile({ tile }: { tile: Tile }) {
  return (
    <div
      data-tile
      data-world-x={tile.worldX}
      data-world-y={tile.worldY}
      className="absolute top-0 left-0"
      style={
        {
          width: tile.width,
          height: tile.height,
          transform: `translate3d(${tile.worldX}px, ${tile.worldY}px, 0)`,
          "--depth-x": tile.depth.x,
          "--depth-y": tile.depth.y,
        } as React.CSSProperties
      }
    >
      <div
        className="h-full w-full"
        style={{
          transform:
            "translate3d(calc(var(--shift-x, 0px) * var(--depth-x)), calc(var(--shift-y, 0px) * var(--depth-y)), 0) skew(var(--skew-x, 0deg), var(--skew-y, 0deg))",
        }}
      >
        <div data-intro className="h-full w-full">
          <TileFace tile={tile} />
        </div>
      </div>
    </div>
  );
}
