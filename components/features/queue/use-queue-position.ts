// React and Next.js
import { useEffect, useState } from "react";

// Third-party libraries
import { gsap } from "gsap";

// Local modules
import type { QueueConfig } from "./config";
import { impulseFor, isPaused } from "./queue-input";
import { isStill, stepHover, type HoverState } from "./queue-hover";
import { measureSpeed, stepQueue, type QueueMotion } from "./queue-step";

/** What input can do to the Queue's motion. */
export type QueueControls = {
  /** Moves the position directly, as a drag does, and stops any momentum. */
  moveBy: (cards: number) => void;
  /** Sets the momentum, in cards per second, when a drag is let go. */
  fling: (velocity: number) => void;
  /** Adds momentum that coasts the given number of cards. */
  kick: (cards: number) => void;
  /** Holds the drift while true (pointer down, hover, focus). */
  hold: (on: boolean) => void;
  /** Reports the card under the pointer or focus, by key, or null when none. */
  hover: (key: string | null) => void;
};

/** Mutable state shared by the ticker and the controls. */
type Core = {
  motion: QueueMotion;
  holds: boolean;
  speed: number;
  hovered: string | null;
  hoverState: HoverState;
  resumeAt: number;
  config: QueueConfig;
  reduced: boolean;
};

/**
 * Builds the shared state and the controls that push it around.
 *
 * @param config - The initial config.
 * @returns The core and its controls.
 */
function createCore(config: QueueConfig) {
  const core: Core = {
    motion: { position: 0, velocity: 0, drift: 1 },
    holds: false,
    speed: 0,
    hovered: null,
    hoverState: { key: null, amount: 0 },
    resumeAt: 0,
    config,
    reduced: false,
  };

  // Restart the resume delay, so the drift waits after any input
  const touch = () => {
    core.resumeAt = gsap.ticker.time + core.config.resumeDelay;
  };
  const set = (patch: Partial<QueueMotion>) => {
    core.motion = { ...core.motion, ...patch };
    touch();
  };

  const controls: QueueControls = {
    moveBy: (cards) =>
      set({ position: core.motion.position + cards, velocity: 0 }),
    fling: (velocity) => set({ velocity }),
    kick: (cards) =>
      set({
        velocity: core.motion.velocity + impulseFor(cards, core.config),
      }),
    hold: (on) => {
      core.holds = on;
      if (!on) touch();
    },
    hover: (key) => {
      core.hovered = key;
    },
  };

  // Take the latest config and motion preference each render
  const apply = (next: QueueConfig, reduced: boolean) => {
    core.config = next;
    core.reduced = reduced;
  };

  return { core, controls, apply };
}

/**
 * Eases the hover effect one frame: in while a card is hovered and the Queue is still.
 *
 * @param core - The shared state.
 * @param dt - Seconds since the previous frame.
 * @returns The new hover state.
 */
function easeHover(core: Core, dt: number): HoverState {
  return stepHover({
    state: core.hoverState,
    hovered: core.hovered,
    still: isStill(core.speed),
    rate: core.config.hoverRate,
    dt,
  });
}

/**
 * Builds the ticker callback: steps the motion by the frame time, measures
 * the speed, eases the hover effect and publishes the reading.
 *
 * @param core - The shared state.
 * @param publish - Receives each frame's reading.
 * @returns The callback to add to the GSAP ticker.
 */
function createTick(
  core: Core,
  publish: (reading: {
    position: number;
    speed: number;
    hover: HoverState;
  }) => void,
) {
  return (time: number, deltaTime: number) => {
    const before = core.motion.position;
    core.motion = stepQueue({
      motion: core.motion,
      paused: isPaused({
        holds: core.holds,
        now: time,
        resumeAt: core.resumeAt,
      }),
      reduced: core.reduced,
      dt: deltaTime / 1000,
      config: core.config,
    });

    // Measure the speed, drift and drags included, for velocity coupling
    core.speed = measureSpeed({
      previous: core.speed,
      moved: core.motion.position - before,
      dt: deltaTime / 1000,
    });
    core.hoverState = easeHover(core, deltaTime / 1000);

    publish({
      position: core.motion.position,
      speed: core.speed,
      hover: core.hoverState,
    });
  };
}

/**
 * Runs the Queue's position on the GSAP ticker: it drifts by itself, carries
 * input momentum, and pauses the drift while input holds it.
 *
 * @param config - Queue config; read fresh each frame, so panel edits apply live.
 * @param reduced - When true the drift is off.
 * @returns The scroll position as a fractional card index, its speed in cards per second, the hover effect's card and amount, and the controls input drives it with.
 */
export function useQueuePosition(config: QueueConfig, reduced: boolean) {
  const [{ position, speed, hover }, setReading] = useState({
    position: 0,
    speed: 0,
    hover: { key: null, amount: 0 } as HoverState,
  });
  const [{ core, controls, apply }] = useState(() => createCore(config));

  useEffect(() => {
    apply(config, reduced);
  });

  useEffect(() => {
    const tick = createTick(core, setReading);

    gsap.ticker.add(tick);

    return () => gsap.ticker.remove(tick);
  }, [core]);

  return { position, speed, hover, controls };
}
