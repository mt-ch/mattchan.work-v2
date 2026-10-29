// Third-party libraries
import { describe, expect, it, vi } from "vitest";

// Local modules
import { ENTRANCE_CONFIG } from "./entrance-config";
import { ENTRANCE_FADE_VAR, buildEntranceTimeline } from "./entrance-timeline";

/**
 * Builds the timeline against a fresh root.
 *
 * @param reduced - Whether to build the reduced-motion variant.
 * @returns The root, the hand-off spy and the timeline.
 */
function setup(reduced: boolean) {
  const root = document.createElement("div");
  const onComplete = vi.fn();
  const timeline = buildEntranceTimeline({ root, reduced, onComplete });
  timeline.pause(0);

  return { root, onComplete, timeline };
}

describe("buildEntranceTimeline", () => {
  it("hands off only once the fade has finished", () => {
    const { root, onComplete, timeline } = setup(false);

    timeline.progress(0.5);
    expect(onComplete).not.toHaveBeenCalled();

    timeline.progress(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(root.style.getPropertyValue(ENTRANCE_FADE_VAR)).toBe("1");
  });

  it("fades in over the configured time", () => {
    expect(setup(false).timeline.duration()).toBe(ENTRANCE_CONFIG.fadeDuration);
  });

  it("fades in over 0.4s when reduced motion is requested", () => {
    expect(setup(true).timeline.duration()).toBe(0.4);
  });
});
