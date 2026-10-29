"use client";

// React and Next.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Local modules
import type { MotionController } from "../motion-controller";
import { EntranceContext } from "./entrance-context";
import { EntranceCounter } from "./entrance-counter";
import { playEntrance } from "./entrance-play";
import { ENTRANCE_REDUCED, ENTRANCE_STATE_ATTRIBUTE } from "./entrance-script";

/**
 * Owns the hand-off: the controllers waiting to start, and whether the
 * Entrance is done.
 *
 * @returns The done flag, a controller registrar and the hand-off function.
 */
function useHandOff() {
  const controllers = useRef(new Set<MotionController>());
  const doneRef = useRef(false);
  const [entranceDone, setEntranceDone] = useState(false);

  const registerController = useCallback((controller: MotionController) => {
    controllers.current.add(controller);
    if (doneRef.current) controller.start();

    return () => {
      controllers.current.delete(controller);
    };
  }, []);

  const handOff = useCallback(() => {
    // Lift the pre-hydration hiding and the inert page
    document.documentElement.removeAttribute(ENTRANCE_STATE_ATTRIBUTE);

    doneRef.current = true;
    controllers.current.forEach((controller) => controller.start());
    setEntranceDone(true);
  }, []);

  return { entranceDone, registerController, handOff };
}

/**
 * Wraps the Landing and plays its Entrance: one GSAP master timeline whose
 * last step starts the stream and carousel.
 * On desktop it first gates on the stack images, then pops them into a stack
 * while a counter runs to 100. Plays only on a hard load, which
 * the pre-hydration script marks on `<html>`; any other mount hands off at once.
 *
 * @param props.children - The Landing page.
 * @returns The page root, inert until the Entrance completes.
 */
export function LandingEntrance({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { entranceDone, registerController, handOff } = useHandOff();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // No marker means a client-side navigation: nothing to play
    const state = document.documentElement.getAttribute(
      ENTRANCE_STATE_ATTRIBUTE,
    );
    if (!state) {
      handOff();
      return;
    }

    return playEntrance(root, state === ENTRANCE_REDUCED, handOff);
  }, [handOff]);

  const value = useMemo(
    () => ({ entranceDone, registerController }),
    [entranceDone, registerController],
  );

  return (
    <EntranceContext value={value}>
      <div ref={rootRef} data-entrance="root">
        {children}
        <EntranceCounter />
      </div>
    </EntranceContext>
  );
}
