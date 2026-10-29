"use client";

// React and Next.js
import { createContext, useContext } from "react";

// Local modules
import type { MotionController } from "../motion-controller";

export type EntranceContextValue = {
  /** True once the Entrance has completed, or when none plays. */
  entranceDone: boolean;
  /**
   * Hands a paused controller to the Entrance, which starts it on hand-off. A
   * controller registered after hand-off starts straight away.
   */
  registerController: (controller: MotionController) => () => void;
};

/** Outside a Landing Entrance there is nothing to wait for. */
const NO_ENTRANCE: EntranceContextValue = {
  entranceDone: true,
  registerController(controller) {
    controller.start();

    return () => {};
  },
};

export const EntranceContext = createContext<EntranceContextValue>(NO_ENTRANCE);

/**
 * Reads the Entrance state. Safe outside a Landing Entrance, where it reports
 * done.
 *
 * @returns Whether the Entrance is done, and how to register a controller.
 */
export function useEntrance() {
  return useContext(EntranceContext);
}
