// Local modules
import type { Tile } from "./layout";

/**
 * Chooses which video tiles should play: those on screen, nearest the centre
 * first, up to the cap.
 *
 * @param tiles - Tiles near the viewport, with screen positions.
 * @param viewport - Viewport width and height in px.
 * @param max - Most videos allowed to play at once.
 * @returns Keys of the tiles whose video should play.
 */
export function pickPlaying(
  tiles: Tile[],
  viewport: { width: number; height: number },
  max: number,
): Set<string> {
  const centre = { x: viewport.width / 2, y: viewport.height / 2 };

  const onScreen = tiles.filter(
    (t) =>
      t.piece.videoSrc &&
      t.x + t.width > 0 &&
      t.x < viewport.width &&
      t.y + t.height > 0 &&
      t.y < viewport.height,
  );
  const distance = (t: Tile) =>
    Math.hypot(t.x + t.width / 2 - centre.x, t.y + t.height / 2 - centre.y);

  return new Set(
    onScreen
      .sort((a, b) => distance(a) - distance(b))
      .slice(0, Math.max(0, max))
      .map((t) => t.key),
  );
}

/**
 * Plays the chosen tiles' videos and pauses every other one in the track.
 *
 * @param track - Element containing the tiles, each video marked `data-video-key`.
 * @param playing - Keys of the tiles whose video should play.
 */
export function applyPlaying(track: HTMLElement, playing: Set<string>) {
  const videos = track.querySelectorAll<HTMLVideoElement>("[data-video-key]");

  for (const video of videos) {
    if (playing.has(video.dataset.videoKey ?? "")) {
      if (video.paused) video.play().catch(() => {});
    } else if (!video.paused) {
      video.pause();
    }
  }
}
