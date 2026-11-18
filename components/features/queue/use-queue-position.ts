// React and Next.js
import { useEffect, useRef, useState } from "react";

// Third-party libraries
import { gsap } from "gsap";

// Local modules
import type { QueueConfig } from "./config";
import { stepQueue, type QueueMotion } from "./queue-step";

/**
 * Runs the Queue's position on the GSAP ticker, so it drifts by itself.
 *
 * @param config - Queue config; read fresh each frame, so panel edits apply live.
 * @param reduced - When true the drift is off.
 * @returns The current scroll position as a fractional card index.
 */
export function useQueuePosition(config: QueueConfig, reduced: boolean) {
  const [position, setPosition] = useState(0);
  const motion = useRef<QueueMotion>({ position: 0, velocity: 0 });
  const latest = useRef({ config, reduced });

  useEffect(() => {
    latest.current = { config, reduced };
  });

  useEffect(() => {
    // Step the motion by the frame time and publish the new position
    const tick = (_time: number, deltaTime: number) => {
      const { config, reduced } = latest.current;
      motion.current = stepQueue({
        motion: motion.current,
        paused: false,
        reduced,
        dt: deltaTime / 1000,
        config,
      });
      setPosition(motion.current.position);
    };

    gsap.ticker.add(tick);

    return () => gsap.ticker.remove(tick);
  }, []);

  return position;
}
