// Local modules
import type { QueueCard } from "./queue-layout";

/** Most videos the Queue plays at once: the focus card plus one neighbour. */
export const MAX_QUEUE_VIDEOS = 2;

/**
 * Chooses which cards play video: the focus card, plus the neighbour nearer
 * the front. Only cards whose piece has a video are chosen.
 *
 * @param cards - The visible cards from the layout.
 * @param hasVideo - Whether the piece at a piece index has a video.
 * @returns Keys of the cards whose video should play.
 */
export function pickQueuePlaying(
  cards: QueueCard[],
  hasVideo: (pieceIndex: number) => boolean,
): Set<string> {
  const focus = cards.find((card) => card.focus);
  if (!focus) return new Set();

  // Keys are consecutive integers, so neighbours sit one key either side
  const focusKey = Number(focus.key);
  const neighbour = cards
    .filter((card) => Math.abs(Number(card.key) - focusKey) === 1)
    .sort((a, b) => a.depthRank - b.depthRank)[0];

  return new Set(
    [focus, neighbour]
      .filter((card) => card && hasVideo(card.pieceIndex))
      .slice(0, MAX_QUEUE_VIDEOS)
      .map((card) => card.key),
  );
}
