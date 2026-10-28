"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Muted looping cover video laid over a tile's poster image. Plays only while
 * on screen, fades in once frames are playing, and is not rendered at all for
 * reduced-motion users, who keep the poster.
 */
export function TileVideo({ src, label }: { src: string; label?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAllowed(!reduced.matches);
    sync();
    reduced.addEventListener("change", sync);
    return () => reduced.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!allowed || !video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [allowed]);

  if (!allowed) return null;

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden={label ? undefined : true}
      aria-label={label || undefined}
      tabIndex={-1}
      draggable={false}
      onPlaying={() => setPlaying(true)}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
        playing ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
