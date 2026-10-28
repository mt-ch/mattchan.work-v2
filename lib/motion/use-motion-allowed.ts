"use client";

// React and Next.js
import { useEffect, useState } from "react";

// Local modules
import { getReducedMotion } from "./environment";

/**
 * Tracks whether motion is allowed, following the user's reduced-motion
 * preference as it changes.
 *
 * @returns False until mounted and whenever reduced motion is requested.
 */
export function useMotionAllowed() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const reduced = getReducedMotion();
    const sync = () => setAllowed(!reduced.matches);

    sync();
    reduced.addEventListener("change", sync);

    return () => reduced.removeEventListener("change", sync);
  }, []);

  return allowed;
}
