"use client";

// React and Next.js
import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Local modules
import { resolveConfig } from "./config";
import { openDebugPanel } from "./debug-panel";
import type { Tile } from "./layout";
import { startPlayground, type PlaygroundController } from "./motion";
import type { Piece } from "./playground-data";
import { PlaygroundTile } from "./playground-tile";

/**
 * Visually hidden heading and Project list, for screen readers and search
 * engines. The links stay out of the tab order: the tiles are the tab stops.
 *
 * @param props.heading - Text of the page's h1.
 * @param props.pieces - Pieces, from which the distinct Projects are listed.
 * @returns The hidden heading and list.
 */
function ProjectIndex({
  heading,
  pieces,
}: {
  heading: string;
  pieces: Piece[];
}) {
  const projects = [...new Map(pieces.map((p) => [p.slug, p.title]))];

  return (
    <div className="sr-only">
      <h1>{heading}</h1>
      <ul>
        {projects.map(([slug, title]) => (
          <li key={slug}>
            <a href={`/work/${slug}`} tabIndex={-1}>
              {title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Dot grid: sized by CSS variables the motion layer keeps in step with the config. */
const DOT_GRID_STYLE: React.CSSProperties = {
  inset: "calc(var(--dot-spacing, 40px) * -1)",
  backgroundImage:
    "radial-gradient(circle, color-mix(in srgb, var(--foreground) calc(var(--dot-opacity, 0.18) * 100%), transparent) 1px, transparent 1.5px)",
  backgroundSize: "var(--dot-spacing, 40px) var(--dot-spacing, 40px)",
};

/**
 * Runs the canvas motion for the lifetime of the component. Opens the debug
 * panel alongside when `?debug` is set, and plays the intro once, as soon as
 * the first tiles are in the DOM.
 *
 * @param pieces - Everything the canvas can show.
 * @returns Refs for the canvas elements, and the tiles currently near the viewport.
 */
function useCanvas(pieces: Piece[]) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<PlaygroundController | null>(null);
  const introPlayed = useRef(false);
  const [tiles, setTiles] = useState<Tile[]>([]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const scaler = scalerRef.current;
    const track = trackRef.current;
    const dots = dotsRef.current;
    if (!viewport || !scaler || !track || !dots || pieces.length === 0) return;

    const config = resolveConfig();
    const controller = startPlayground({
      viewport,
      scaler,
      track,
      dots,
      pieces,
      config,
      onTiles: setTiles,
    });
    controllerRef.current = controller;
    const panel = openDebugPanel(config, controller.refresh);

    return () => {
      controller.stop();
      void panel.then((dispose) => dispose?.());
    };
  }, [pieces]);

  useLayoutEffect(() => {
    if (introPlayed.current || tiles.length === 0) return;

    introPlayed.current = true;
    controllerRef.current?.intro();
  }, [tiles]);

  return { viewportRef, scalerRef, trackRef, dotsRef, tiles };
}

/**
 * The Landing's experimental infinite canvas of Project media. Drag, scroll,
 * touch or use the arrow keys to pan; clicking a tile opens that Project.
 * Add `?debug` to the URL to tune it live.
 *
 * @param props.pieces - Everything the canvas can show.
 * @param props.heading - Text of the visually hidden h1.
 * @returns The canvas.
 */
export function Playground({
  pieces,
  heading,
}: {
  pieces: Piece[];
  heading: string;
}) {
  const { viewportRef, scalerRef, trackRef, dotsRef, tiles } =
    useCanvas(pieces);

  return (
    <div
      ref={viewportRef}
      className="fixed inset-0 cursor-grab overflow-clip active:cursor-grabbing"
      style={{ touchAction: "none" }}
    >
      <ProjectIndex heading={heading} pieces={pieces} />
      <div ref={scalerRef} className="absolute inset-0 will-change-transform">
        <div
          ref={dotsRef}
          aria-hidden
          className="pointer-events-none absolute opacity-0"
          style={DOT_GRID_STYLE}
        />
        <div
          ref={trackRef}
          className="absolute top-0 left-0 will-change-transform"
        >
          {tiles.map((tile) => (
            <PlaygroundTile key={tile.key} tile={tile} />
          ))}
        </div>
      </div>
    </div>
  );
}
