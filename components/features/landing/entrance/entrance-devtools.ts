// Third-party libraries
import { gsap } from "gsap";

/**
 * Mounts the GSDevTools scrubber on the master timeline when the URL has
 * `?entrance`. Development only: the production check lets the bundler drop
 * the GSDevTools import from production builds.
 *
 * @param timeline - The Entrance master timeline.
 * @returns A function that removes the scrubber.
 */
export function mountEntranceDevTools(timeline: gsap.core.Timeline) {
  if (process.env.NODE_ENV === "production") return () => {};
  if (!new URLSearchParams(window.location.search).has("entrance")) {
    return () => {};
  }

  let cancelled = false;
  let tools: { kill: () => void } | undefined;

  import("gsap/GSDevTools").then(({ GSDevTools }) => {
    if (cancelled) return;

    gsap.registerPlugin(GSDevTools);
    tools = GSDevTools.create({ animation: timeline });
  });

  return () => {
    cancelled = true;
    tools?.kill();
  };
}
