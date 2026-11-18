"use client";

// React and Next.js
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useState } from "react";

// Local modules
import type { Piece } from "../playground/playground-data";
import { layoutQueue, type QueueCard } from "./queue-layout";
import { useQueueConfig } from "./use-queue-config";

/** Viewport assumed until the real size is measured on the client. */
const DEFAULT_VIEWPORT = { width: 1440, height: 900 };

/**
 * Tracks the viewport size, so the layout can size cards from it.
 *
 * @returns The viewport width and height in px.
 */
function useViewport() {
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);

  useLayoutEffect(() => {
    const measure = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });

    measure();
    window.addEventListener("resize", measure);

    return () => window.removeEventListener("resize", measure);
  }, []);

  return viewport;
}

/**
 * One card of the Queue: the piece's poster, linking to its Project.
 *
 * @param props.card - Where and how to draw the card.
 * @param props.piece - The piece the card shows.
 * @returns The positioned card.
 */
function QueueItem({ card, piece }: { card: QueueCard; piece: Piece }) {
  return (
    <Link
      href={`/work/${piece.slug}`}
      aria-label={piece.title}
      draggable={false}
      className="absolute top-1/2 left-1/2 block overflow-hidden rounded-md bg-surface"
      style={{
        width: card.width,
        height: card.height,
        marginLeft: -card.width / 2,
        marginTop: -card.height / 2,
        opacity: card.opacity,
        zIndex: 1000 - card.depthRank,
        transform: `translate3d(${card.x}px, ${card.y}px, ${card.z}px) rotateY(${card.rotateY}deg) scale(${card.scale})`,
      }}
    >
      <Image
        src={piece.src}
        alt=""
        fill
        placeholder={piece.blurDataURL ? "blur" : "empty"}
        blurDataURL={piece.blurDataURL}
        sizes={`${Math.round(card.width)}px`}
        draggable={false}
        className="object-cover select-none"
      />
    </Link>
  );
}

/**
 * The Landing's Queue: a diagonal fan of cards in perspective, 4:5 unless the config honours orientation.
 * Every card links to its Project. Static for now; it does not move yet. `?debug` opens a tuning panel.
 *
 * @param props.pieces - Playground pieces, in Sanity order.
 * @param props.heading - Text of the visually hidden h1.
 * @returns The Queue.
 */
export function Queue({
  pieces,
  heading,
}: {
  pieces: Piece[];
  heading: string;
}) {
  const viewport = useViewport();
  const config = useQueueConfig();
  const cards = layoutQueue({
    count: pieces.length,
    orientations: pieces.map((piece) => piece.orientation),
    config,
    position: 0,
    viewport,
  });

  return (
    <div className="fixed inset-0 overflow-clip">
      <h1 className="sr-only">{heading}</h1>
      <div
        className="absolute inset-0"
        style={{
          perspective: `${config.perspective * viewport.height * config.cardHeight}px`,
          transformStyle: "preserve-3d",
        }}
      >
        {cards.map((card) => (
          <QueueItem
            key={card.key}
            card={card}
            piece={pieces[card.pieceIndex]}
          />
        ))}
      </div>
    </div>
  );
}
