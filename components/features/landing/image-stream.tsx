"use client";

import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useActiveProject } from "./active-project";
import type { StreamTile } from "./stream-data";
import {
  BASE_SPEED,
  activeTileIndex,
  decayBoost,
  wrapOffset,
} from "./stream-math";

gsap.registerPlugin(Observer);

/** Longest frame the ticker will integrate, so resuming a tab never jumps. */
const MAX_DT = 0.1;
/** Converts wheel/drag delta (px) into boost velocity (px/s). */
const BOOST_GAIN = 12;

export function ImageStream({ tiles }: { tiles: StreamTile[] }) {
  const { setSlug } = useActiveProject();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(3);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || tiles.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let offset = 0;
    let boost = 0;
    let setHeight = 0;
    let viewportHeight = 0;
    let boxes: { top: number; height: number }[] = [];
    let activeSlug = "";

    const measure = () => {
      viewportHeight = viewport.clientHeight;
      const first = Array.from(track.children).slice(0, tiles.length);
      const nextTop = track.children[tiles.length] as HTMLElement | undefined;
      boxes = first.map((el) => ({
        top: (el as HTMLElement).offsetTop,
        height: (el as HTMLElement).offsetHeight,
      }));
      setHeight = nextTop ? nextTop.offsetTop : 0;
      if (setHeight > 0) {
        const needed = Math.ceil(viewportHeight / setHeight) + 2;
        setCopies((c) => (needed > c ? needed : c));
      }
    };

    const render = () => {
      if (setHeight <= 0) return;
      offset = wrapOffset(offset, setHeight);
      gsap.set(track, { y: -offset });
      const index = activeTileIndex(offset, viewportHeight, boxes, setHeight);
      const slug = tiles[index].slug;
      if (slug !== activeSlug) {
        activeSlug = slug;
        setSlug(slug);
      }
    };

    measure();
    // Start with the first Project at the centre of the viewport.
    if (boxes[0]) {
      offset = boxes[0].top + boxes[0].height / 2 - viewportHeight / 2;
    }
    render();

    const resize = new ResizeObserver(() => {
      measure();
      render();
    });
    resize.observe(viewport);
    resize.observe(track);

    const tick = (_time: number, deltaMs: number) => {
      if (document.hidden || reduced.matches || setHeight <= 0) return;
      const dt = Math.min(deltaMs / 1000, MAX_DT);
      boost = decayBoost(boost, dt);
      offset += (BASE_SPEED + boost) * dt;
      render();
    };
    gsap.ticker.add(tick);

    // wheelSpeed -1 makes wheel-down and finger-drag-up both negative, so
    // `-deltaY` is the direction the stream should flow.
    const observer = Observer.create({
      target: viewport,
      type: "wheel,touch",
      wheelSpeed: -1,
      tolerance: 1,
      preventDefault: true,
      onChangeY: (self) => {
        const delta = -self.deltaY;
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
  }, [tiles, setSlug]);

  return (
    <div
      ref={viewportRef}
      className="hidden h-full overflow-hidden lg:block"
      style={{ touchAction: "none" }}
    >
      <div
        ref={trackRef}
        className="gap-sm flex flex-col will-change-transform"
      >
        {Array.from({ length: copies }, (_, copy) =>
          tiles.map((tile) => (
            <Link
              key={`${copy}-${tile.slug}`}
              href={`/work/${tile.slug}`}
              draggable={false}
              aria-hidden={copy > 0 || undefined}
              tabIndex={copy > 0 ? -1 : undefined}
              className="block shrink-0 overflow-hidden rounded-md"
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
                className="aspect-16/9 h-auto w-full object-cover"
              />
            </Link>
          )),
        )}
      </div>
    </div>
  );
}
