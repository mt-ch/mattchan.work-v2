// Local modules
import type { QueueConfig } from "./config";
import { DRAG_THRESHOLD, blendVelocity, pxToCards } from "./queue-input";
import type { QueueControls } from "./use-queue-position";

/** Tracks one press-and-drag at a time, deciding drag versus click. */
export type DragTracker = {
  /** Starts a press at the event's position. */
  down: (e: PointerEvent) => void;
  /** Follows the pointer; moves the Queue once past the threshold. */
  move: (e: PointerEvent) => void;
  /** Ends the press; a drag flings the Queue with the pointer's speed. */
  up: () => void;
  /** Swallows the click that ends a drag, so it never navigates. */
  click: (e: MouseEvent) => void;
};

/**
 * Creates a drag tracker for mouse and touch.
 *
 * @param controls - What input does to the Queue's motion.
 * @param read - Returns the live config and viewport height.
 * @param onHold - Called with true while a press is down, false when it ends.
 * @returns The tracker's handlers.
 */
export function createDragTracker(
  controls: QueueControls,
  read: () => { config: QueueConfig; height: number },
  onHold: (pressed: boolean) => void,
): DragTracker {
  let pressed = false;
  let dragged = false;
  let travelled = 0;
  let last = { x: 0, time: 0 };
  let velocity = 0;

  return {
    down(e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      pressed = true;
      dragged = false;
      travelled = 0;
      velocity = 0;
      last = { x: e.clientX, time: e.timeStamp };
      onHold(true);
    },
    move(e) {
      if (!pressed) return;
      const dx = e.clientX - last.x;
      travelled += Math.abs(dx);
      if (travelled > DRAG_THRESHOLD) dragged = true;
      if (!dragged) return;

      // Follow the pointer, and keep a running estimate of its speed
      const { config, height } = read();
      const cards = pxToCards(dx, config, height);
      velocity = blendVelocity(
        velocity,
        cards,
        (e.timeStamp - last.time) / 1000,
      );
      controls.moveBy(cards);
      last = { x: e.clientX, time: e.timeStamp };
    },
    up() {
      if (!pressed) return;
      pressed = false;
      if (dragged) controls.fling(velocity);
      onHold(false);
    },
    click(e) {
      if (!dragged) return;
      e.preventDefault();
      e.stopPropagation();
      dragged = false;
    },
  };
}
