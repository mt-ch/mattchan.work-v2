// Local modules
import type { QueueConfig } from "./config";
import { createDragTracker } from "./queue-drag";
import { pxToCards } from "./queue-input";
import type { QueueControls } from "./use-queue-position";

/** What currently holds the drift. */
type Holds = { pressed: boolean; hovering: boolean; focused: boolean };

/**
 * Creates the wheel, key, hover and focus handlers of the Queue.
 *
 * @param controls - What input does to the Queue's motion.
 * @param holds - Hold flags these handlers set; shared with the drag tracker.
 * @param sync - Tells the Queue to re-read the flags after they change.
 * @param read - Returns the live config and viewport height.
 * @returns The handlers.
 */
function createHandlers(
  controls: QueueControls,
  holds: Holds,
  sync: () => void,
  read: () => { config: QueueConfig; height: number },
) {
  return {
    wheel(e: WheelEvent) {
      e.preventDefault();
      const px = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const { config, height } = read();
      controls.kick(pxToCards(-px, config, height));
    },
    key(e: KeyboardEvent) {
      const forward = e.key === "ArrowLeft" || e.key === "ArrowUp";
      const back = e.key === "ArrowRight" || e.key === "ArrowDown";
      if (!forward && !back) return;
      e.preventDefault();
      controls.kick(forward ? 1 : -1);
    },
    over(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      holds.hovering = e.target instanceof Element && !!e.target.closest("a");
      sync();
    },
    leave() {
      holds.hovering = false;
      sync();
    },
    focus(e: FocusEvent) {
      holds.focused = e.type === "focusin";
      sync();
    },
  };
}

/**
 * Attaches every Queue input listener to an element and the window.
 *
 * @param el - The element that receives input.
 * @param controls - What input does to the Queue's motion.
 * @param read - Returns the live config and viewport height.
 * @returns A function that removes the listeners.
 */
export function attachInput(
  el: HTMLElement,
  controls: QueueControls,
  read: () => { config: QueueConfig; height: number },
): () => void {
  // Press, hover and focus each hold the drift; it resumes when all let go
  const holds = { pressed: false, hovering: false, focused: false };
  const sync = () => controls.hold(Object.values(holds).some(Boolean));
  const drag = createDragTracker(controls, read, (on) => {
    holds.pressed = on;
    sync();
  });

  const handlers = createHandlers(controls, holds, sync, read);

  const listeners: [EventTarget, string, EventListener, unknown?][] = [
    [el, "wheel", handlers.wheel as EventListener, { passive: false }],
    [el, "pointerdown", drag.down as EventListener],
    [el, "pointerover", handlers.over as EventListener],
    [el, "pointerleave", handlers.leave],
    [el, "click", drag.click as EventListener, true],
    [el, "keydown", handlers.key as EventListener],
    [el, "focusin", handlers.focus as EventListener],
    [el, "focusout", handlers.focus as EventListener],
    [window, "pointermove", drag.move as EventListener],
    [window, "pointerup", drag.up],
    [window, "pointercancel", drag.up],
  ];
  for (const [t, type, fn, opts] of listeners) {
    t.addEventListener(type, fn, opts as AddEventListenerOptions);
  }

  return () => {
    for (const [t, type, fn, opts] of listeners) {
      t.removeEventListener(type, fn, opts as AddEventListenerOptions);
    }
  };
}
