"use client";

import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { StreamTile } from "./stream-data";
import { BASE_SPEED, decayBoost, wrapOffset } from "./stream-math";
import { TileVideo } from "@/components/ui/tile-video";

gsap.registerPlugin(Observer);

/** Longest frame the ticker will integrate, so resuming a tab never jumps. */
const MAX_DT = 0.1;
/** Converts swipe delta (px) into boost velocity (px/s). */
const BOOST_GAIN = 12;
/** Swipe distance (px) past which the gesture is a drag, not a tap. */
const TAP_SLOP = 8;

/**
 * Mobile Landing carousel: the desktop stream's motion model, horizontally.
 * Constant base speed, swipes add velocity that eases back, seamless loop.
 * Neighbouring slides peek at both edges.
 */
export function MobileCarousel({ tiles }: { tiles: StreamTile[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const movedRef = useRef(0);
  const [copies, setCopies] = useState(3);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || tiles.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let offset = 0;
    let boost = 0;
    let setWidth = 0;
    let viewportWidth = 0;
    let centred = false;

    const measure = () => {
      viewportWidth = viewport.clientWidth;
      const first = track.children[0] as HTMLElement | undefined;
      const next = track.children[tiles.length] as HTMLElement | undefined;
      setWidth = next ? next.offsetLeft : 0;
      if (setWidth > 0) {
        const needed = Math.ceil(viewportWidth / setWidth) + 2;
        setCopies((c) => (needed > c ? needed : c));
      }
      if (first && !centred && viewportWidth > 0) {
        // Start with the first Project centred, neighbours peeking.
        offset = first.offsetLeft + first.offsetWidth / 2 - viewportWidth / 2;
        centred = true;
      }
    };

    const render = () => {
      if (setWidth <= 0) return;
      offset = wrapOffset(offset, setWidth);
      gsap.set(track, { x: -offset });
    };

    measure();
    render();

    const resize = new ResizeObserver(() => {
      measure();
      render();
    });
    resize.observe(viewport);
    resize.observe(track);

    const tick = (_time: number, deltaMs: number) => {
      if (document.hidden || reduced.matches || setWidth <= 0) return;
      const dt = Math.min(deltaMs / 1000, MAX_DT);
      boost = decayBoost(boost, dt);
      offset += (BASE_SPEED + boost) * dt;
      render();
    };
    gsap.ticker.add(tick);

    // Drag-left reports a negative deltaX; the carousel should flow left, so
    // `-deltaX` is the direction to advance.
    const observer = Observer.create({
      target: viewport,
      type: "touch,pointer",
      tolerance: 1,
      onPress: () => {
        movedRef.current = 0;
      },
      onChangeX: (self) => {
        movedRef.current += Math.abs(self.deltaX);
        const delta = -self.deltaX;
        if (reduced.matches) {
          offset += delta;
          render();
        } else {
          boost += delta * BOOST_GAIN;
        }
      },
    });

    return () => {
      observer.kill();
      gsap.ticker.remove(tick);
      resize.disconnect();
    };
  }, [tiles]);

  return (
    <div
      ref={viewportRef}
      className="-mx-sm h-full shrink-0 overflow-hidden lg:hidden"
      style={{ touchAction: "none" }}
      onClickCapture={(event) => {
        // A swipe that ends on a slide must not navigate.
        if (movedRef.current > TAP_SLOP) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <div ref={trackRef} className="gap-sm flex h-full will-change-transform">
        {Array.from({ length: copies }, (_, copy) =>
          tiles.map((tile) => (
            <Link
              key={`${copy}-${tile.slug}`}
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
              <div className="p-xs text-foreground m-xs bg-background/50 absolute top-0 inline-block rounded-md backdrop-blur-sm">
                <div className="text-small text-foreground">{tile.title}</div>
              </div>
            </Link>
          )),
        )}
      </div>
    </div>
  );
}
