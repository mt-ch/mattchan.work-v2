"use client";

// React and Next.js
import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether motion is allowed, following the user's reduced-motion
 * preference as it changes.
 *
 * @returns False until mounted and whenever reduced motion is requested.
 */
function useMotionAllowed() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAllowed(!reduced.matches);

    sync();
    reduced.addEventListener("change", sync);

    return () => reduced.removeEventListener("change", sync);
  }, []);

  return allowed;
}

/**
 * Plays the video while it is on screen and pauses it when it leaves.
 *
 * @param videoRef - Ref to the video element.
 * @param enabled - Whether playback is allowed at all.
 */
function usePlayWhenVisible(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    const video = videoRef.current;
    if (!enabled || !video) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
    observer.observe(video);

    return () => observer.disconnect();
  }, [videoRef, enabled]);
}

/**
 * Muted looping cover video laid over a tile's poster image. Plays only while
 * on screen, fades in once frames are playing, and is not rendered at all for
 * reduced-motion users, who keep the poster.
 *
 * @param props.src - URL of the video file.
 * @returns The video, or nothing when motion is not allowed.
 */
export function TileVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const allowed = useMotionAllowed();

  usePlayWhenVisible(videoRef, allowed);

  if (!allowed) return null;

  return (
    <video
      ref={videoRef}
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
