// Local modules
import type { QueueConfig } from "./config";
import { createDragTracker } from "./queue-drag";
import { pxToCards } from "./queue-input";
import { createCardProbe } from "./queue-probe";
import type { QueueControls } from "./use-queue-position";

/** What currently holds the drift. */
type Holds = { pressed: boolean; hovering: boolean; focused: boolean };

/** The card key under the pointer and the card key with focus, when any. */
type Keys = { pointer: string | null; focus: string | null };

/**
 * Finds the card an event target sits in.
 *
 * @param target - An event target or probed element.
 * @returns The card link element, or null when the target is not inside one.
 */
function cardOf(target: EventTarget | Element | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;

  return target.closest<HTMLElement>("a[data-card-key]");
}

/**
 * Which way an arrow key moves the Queue.
 *
 * @param key - The `KeyboardEvent.key` value.
 * @returns 1 to go forward, -1 to go back, 0 for any other key.
 */
function arrowStep(key: string): number {
  if (key === "ArrowLeft" || key === "ArrowUp") return 1;

  return key === "ArrowRight" || key === "ArrowDown" ? -1 : 0;
}

/**
 * Creates the wheel, key, hover and focus handlers of the Queue.
 *
 * @param controls - What input does to the Queue's motion.
 * @param holds - Hold flags these handlers set; shared with the drag tracker.
 * @param keys - Card keys these handlers set for the hover effect.
 * @param probe - Re-checks the card under a resting pointer.
 * @param sync - Tells the Queue to re-read the flags after they change.
 * @param read - Returns the live config and viewport height.
 * @returns The handlers.
 */
function createHandlers(
  controls: QueueControls,
  holds: Holds,
  keys: Keys,
  probe: ReturnType<typeof createCardProbe>,
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
      const step = arrowStep(e.key);
      if (step === 0) return;
      e.preventDefault();
      controls.kick(step);
    },
    over(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      probe.at(e.clientX, e.clientY);
      const card = cardOf(e.target);
      holds.hovering = card !== null;
      keys.pointer = card?.dataset.cardKey ?? null;
      sync();
    },
    move(e: PointerEvent) {
      if (e.pointerType !== "touch") probe.at(e.clientX, e.clientY);
    },
    leave() {
      probe.stop();
      holds.hovering = false;
      keys.pointer = null;
      sync();
    },
    focus(e: FocusEvent) {
      holds.focused = e.type === "focusin";
      keys.focus = holds.focused
        ? (cardOf(e.target)?.dataset.cardKey ?? null)
        : null;
      sync();
    },
  };
}

/**
 * Creates the hold flags and card keys, and the probe that keeps the pointer's card current.
 *
 * @param controls - What input does to the Queue's motion.
 * @returns The flags, keys, the `sync` that reports them, and the probe.
 */
function createHoldState(controls: QueueControls) {
  // Press, hover and focus each hold the drift; it resumes when all let go
  const holds: Holds = { pressed: false, hovering: false, focused: false };
  const keys: Keys = { pointer: null, focus: null };
  const sync = () => {
    controls.hold(Object.values(holds).some(Boolean));
    controls.hover(keys.pointer ?? keys.focus);
  };

  // Only report a change, so a resting pointer does not keep restarting the resume delay
  const probe = createCardProbe((key) => {
    if (key === keys.pointer) return;
    keys.pointer = key;
    holds.hovering = key !== null;
    sync();
  });

  return { holds, keys, sync, probe };
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
  const { holds, keys, sync, probe } = createHoldState(controls);
  const drag = createDragTracker(controls, read, (on) => {
    holds.pressed = on;
    sync();
  });
  const handlers = createHandlers(controls, holds, keys, probe, sync, read);

  const listeners: [EventTarget, string, EventListener, unknown?][] = [
    [el, "wheel", handlers.wheel as EventListener, { passive: false }],
    [el, "pointerdown", drag.down as EventListener],
    [el, "pointerover", handlers.over as EventListener],
    [el, "pointermove", handlers.move as EventListener],
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
    probe.stop();
    for (const [t, type, fn, opts] of listeners) {
      t.removeEventListener(type, fn, opts as AddEventListenerOptions);
    }
  };
}
