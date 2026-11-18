"use client";

// React and Next.js
import { useEffect, useState } from "react";

// Local modules
import { getDesktop } from "./environment";

/**
 * Tracks whether the viewport is at the desktop breakpoint, as it resizes.
 *
 * @returns True at desktop widths; true until mounted, so desktop never flashes mobile values.
 */
export function useDesktop() {
  const [desktop, setDesktop] = useState(true);

  useEffect(() => {
    const query = getDesktop();
    const sync = () => setDesktop(query.matches);

    sync();
    query.addEventListener("change", sync);

    return () => query.removeEventListener("change", sync);
  }, []);

  return desktop;
}
