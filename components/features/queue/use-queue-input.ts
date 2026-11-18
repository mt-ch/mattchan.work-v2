// React and Next.js
import { useEffect, useRef, type RefObject } from "react";

// Local modules
import type { QueueConfig } from "./config";
import { attachInput } from "./queue-handlers";
import type { QueueControls } from "./use-queue-position";

/**
 * Wires wheel, mouse and touch drag, hover, focus and arrow keys to the Queue.
 * A drag past the threshold swallows the click that follows, so it never
 * navigates; a plain click goes through.
 *
 * @param target - The element that receives input.
 * @param controls - What input does to the Queue's motion.
 * @param config - Queue config; read fresh, so panel edits apply live.
 * @param viewportHeight - Viewport height in px, to turn pixels into cards.
 */
export function useQueueInput(
  target: RefObject<HTMLElement | null>,
  controls: QueueControls,
  config: QueueConfig,
  viewportHeight: number,
) {
  const latest = useRef({ config, height: viewportHeight });

  useEffect(() => {
    latest.current = { config, height: viewportHeight };
  });

  useEffect(() => {
    const el = target.current;
    if (!el) return;

    return attachInput(el, controls, () => latest.current);
  }, [target, controls]);
}
