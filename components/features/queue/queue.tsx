"use client";

// React and Next.js
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";

// Shared modules
import { TileVideo } from "@/components/ui/tile-video";
import { useDesktop } from "@/lib/motion/use-desktop";
import { useMotionAllowed } from "@/lib/motion/use-motion-allowed";

// Local modules
import type { Piece } from "../playground/playground-data";
import type { QueueConfig } from "./config";
import { layoutQueue, type QueueCard } from "./queue-layout";
import { pickQueuePlaying } from "./queue-video";
import { resolveConfig } from "./resolve-config";
import { useQueueConfig } from "./use-queue-config";
import { useQueueInput } from "./use-queue-input";
import { useQueuePosition, type QueueControls } from "./use-queue-position";

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
 * A ref for the Queue's root element, with input wired to it.
 *
 * @param controls - What input does to the Queue's motion.
 * @param config - Queue config.
 * @param height - Viewport height in px.
 * @returns The ref to put on the root element.
 */
function useQueueRoot(
  controls: QueueControls,
  config: QueueConfig,
  height: number,
) {
  const root = useRef<HTMLDivElement>(null);
  useQueueInput(root, controls, config, height);

  return root;
}

/**
 * Lays out the cards for the pieces at a position.
 *
 * @param pieces - Playground pieces.
 * @param config - Queue config.
 * @param position - Scroll position as a fractional card index.
 * @param velocity - Signed scroll speed in cards per second.
 * @param viewport - Viewport size in px.
 * @returns The visible cards.
 */
function layoutPieces(
  pieces: Piece[],
  config: QueueConfig,
  position: number,
  velocity: number,
  viewport: { width: number; height: number },
) {
  return layoutQueue({
    count: pieces.length,
    orientations: pieces.map((piece) => piece.orientation),
    config,
    position,
    velocity,
    viewport,
  });
}

/**
 * One card of the Queue: the piece's poster, linking to its Project.
 *
 * @param props.card - Where and how to draw the card.
 * @param props.piece - The piece the card shows.
 * @param props.playing - Whether the card's video should play; otherwise only the poster shows.
 * @returns The positioned card.
 */
function QueueItem({
  card,
  piece,
  playing,
}: {
  card: QueueCard;
  piece: Piece;
  playing: boolean;
}) {
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
        transform: `translate3d(${card.x}px, ${card.y}px, ${card.z}px) rotateY(${card.rotateY}deg) skewX(${card.skew}deg) scale(${card.scale})`,
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
      {playing && piece.videoSrc ? <TileVideo src={piece.videoSrc} /> : null}
    </Link>
  );
}

/**
/**
 * The perspective layer that holds every card.
 *
 * @param props.cards - The laid-out cards.
 * @param props.pieces - Playground pieces the cards show.
 * @param props.config - Queue config.
 * @param props.height - Viewport height in px.
 * @param props.playing - Keys of the cards whose video should play.
 * @returns The 3D stage with its cards.
 */
function QueueFan({
  cards,
  pieces,
  config,
  height,
  playing,
}: {
  cards: QueueCard[];
  pieces: Piece[];
  config: QueueConfig;
  height: number;
  playing: Set<string>;
}) {
  return (
    <div
      className="absolute inset-0"
      style={{
        perspective: `${config.perspective * height * config.cardHeight}px`,
        transformStyle: "preserve-3d",
      }}
    >
      {cards.map((card) => (
        <QueueItem
          key={card.key}
          card={card}
          piece={pieces[card.pieceIndex]}
          playing={playing.has(card.key)}
        />
      ))}
    </div>
  );
}

/**
 * The tuned config, adjusted for narrow screens and reduced motion.
 *
 * @returns The config to render with, and whether motion is reduced.
 */
function useResolvedConfig() {
  const tuned = useQueueConfig();
  const reduced = !useMotionAllowed();
  const mobile = !useDesktop();

  return { config: resolveConfig(tuned, { mobile, reduced }), reduced };
}

/**
 * The Landing's Queue: a diagonal fan of cards in perspective, 4:5 unless the config honours orientation.
 * Every card links to its Project. It drifts right to left by itself, and follows wheel, drag, touch and arrow keys. `?debug` opens a tuning panel.
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
  const { config, reduced } = useResolvedConfig();
  const { position, speed, controls } = useQueuePosition(config, reduced);
  const root = useQueueRoot(controls, config, viewport.height);
  const cards = layoutPieces(
    pieces,
    config,
    position,
    reduced ? 0 : speed,
    viewport,
  );
  const playing = pickQueuePlaying(cards, (i) => Boolean(pieces[i].videoSrc));

  return (
    <div
      ref={root}
      className="fixed inset-0 touch-none overflow-clip select-none"
    >
      <h1 className="sr-only">{heading}</h1>
      <QueueFan
        cards={cards}
        pieces={pieces}
        config={config}
        height={viewport.height}
        playing={playing}
      />
    </div>
  );
}
