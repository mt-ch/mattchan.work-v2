"use client";

// React and Next.js
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Local modules
import { startCarousel } from "./carousel-motion";
import type { StreamTile } from "./stream-data";
import { TileVideo } from "./tile-video";

/** Swipe distance (px) past which the gesture is a drag, not a tap. */
const TAP_SLOP = 8;

/**
 * One Project slide in the carousel. Repeated copies are hidden from
 * assistive tech and the tab order so each Project is announced once.
 *
 * @param props.tile - The Project tile to show.
 * @param props.copy - Which repeat of the set this slide belongs to; 0 is the real one.
 * @returns A link to the Project's Work page.
 */
function CarouselSlide({ tile, copy }: { tile: StreamTile; copy: number }) {
  return (
    <Link
      href={`/work/${tile.slug}`}
      draggable={false}
      aria-hidden={copy > 0 || undefined}
      tabIndex={copy > 0 ? -1 : undefined}
      className="relative block aspect-4/5 h-full shrink-0 overflow-hidden rounded-md"
    >
      <Image
        src={tile.src}
        alt={copy === 0 ? tile.title : ""}
        fill
        placeholder={tile.blurDataURL ? "blur" : "empty"}
        blurDataURL={tile.blurDataURL}
        sizes="(min-width: 1024px) 0px, 27vh"
        draggable={false}
        className="object-cover"
      />
      {tile.videoSrc ? <TileVideo src={tile.videoSrc} /> : null}
      <div className="absolute inset-0 bg-black/30" />
      <div className="p-xs text-foreground m-xs bg-background/50 absolute top-0 inline-block rounded-md backdrop-blur-sm">
        <div className="text-small text-foreground">{tile.title}</div>
      </div>
    </Link>
  );
}

/**
 * Runs the carousel's motion against its two elements and tracks swipes so a
 * drag is not mistaken for a tap.
 *
 * @param tiles - The Project tiles to loop.
 * @returns The element refs, how many copies of the set to render, and a click
 * handler that swallows clicks ending a swipe.
 */
function useCarousel(tiles: StreamTile[]) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const movedRef = useRef(0);
  const [copies, setCopies] = useState(3);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || tiles.length === 0) return;

    return startCarousel({
      viewport,
      track,
      tileCount: tiles.length,
      onPress: () => {
        movedRef.current = 0;
      },
      onSwipe: (distance) => {
        movedRef.current += distance;
      },
      onCopiesNeeded: (needed) => setCopies((c) => Math.max(c, needed)),
    });
  }, [tiles]);

  // A swipe that ends on a slide must not navigate.
  const swallowSwipeClick = (event: React.MouseEvent) => {
    if (movedRef.current > TAP_SLOP) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return { viewportRef, trackRef, copies, swallowSwipeClick };
}

/**
 * Mobile Landing carousel: the desktop stream's motion model, horizontally.
 * Constant base speed, swipes add velocity that eases back, seamless loop.
 * Neighbouring slides peek at both edges.
 *
 * @param props.tiles - The Project tiles to loop.
 * @returns The carousel, hidden from the `lg` breakpoint up.
 */
export function MobileCarousel({ tiles }: { tiles: StreamTile[] }) {
  const { viewportRef, trackRef, copies, swallowSwipeClick } =
    useCarousel(tiles);

  return (
    <div
      ref={viewportRef}
      className="-mx-sm h-[45dvh] shrink-0 overflow-hidden lg:hidden"
      style={{ touchAction: "none" }}
      onClickCapture={swallowSwipeClick}
    >
      <div ref={trackRef} className="gap-sm flex h-full will-change-transform">
        {Array.from({ length: copies }, (_, copy) =>
          tiles.map((tile) => (
            <CarouselSlide
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
