// React and Next.js
import { useEffect, useState } from "react";

// Third-party libraries
import { gsap } from "gsap";

// Local modules
import type { QueueConfig } from "./config";
import { impulseFor, isPaused } from "./queue-input";
import { stepQueue, type QueueMotion } from "./queue-step";

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
};

/** Mutable state shared by the ticker and the controls. */
type Core = {
  motion: QueueMotion;
  holds: boolean;
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
  };

  // Take the latest config and motion preference each render
  const apply = (next: QueueConfig, reduced: boolean) => {
    core.config = next;
    core.reduced = reduced;
  };

  return { core, controls, apply };
}

/**
 * Runs the Queue's position on the GSAP ticker: it drifts by itself, carries
 * input momentum, and pauses the drift while input holds it.
 *
 * @param config - Queue config; read fresh each frame, so panel edits apply live.
 * @param reduced - When true the drift is off.
 * @returns The scroll position as a fractional card index, and the controls input drives it with.
 */
export function useQueuePosition(config: QueueConfig, reduced: boolean) {
  const [position, setPosition] = useState(0);
  const [{ core, controls, apply }] = useState(() => createCore(config));

  useEffect(() => {
    apply(config, reduced);
  });

  useEffect(() => {
    // Step the motion by the frame time and publish the new position
    const tick = (time: number, deltaTime: number) => {
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
      setPosition(core.motion.position);
    };

    gsap.ticker.add(tick);

    return () => gsap.ticker.remove(tick);
  }, [core]);

  return { position, controls };
}
