// Third-party libraries
import { afterEach, describe, expect, it, vi } from "vitest";

// Local modules
import { ENTRANCE_SCRIPT, ENTRANCE_STATE_ATTRIBUTE } from "./entrance-script";

/**
 * Runs the pre-hydration script as a hard load of a path would.
 *
 * @param path - The pathname of the page being loaded.
 * @param reduced - Whether the visitor prefers reduced motion.
 * @returns The state attribute the script left on `<html>`.
 */
function hardLoad(path: string, reduced: boolean) {
  window.history.pushState({}, "", path);
  vi.stubGlobal("matchMedia", () => ({ matches: reduced }));
  new Function(ENTRANCE_SCRIPT)();

  return document.documentElement.getAttribute(ENTRANCE_STATE_ATTRIBUTE);
}

describe("ENTRANCE_SCRIPT", () => {
  afterEach(() => {
    document.documentElement.removeAttribute(ENTRANCE_STATE_ATTRIBUTE);
    vi.unstubAllGlobals();
  });

  it("marks a hard load of the Landing as pending", () => {
    expect(hardLoad("/", false)).toBe("pending");
  });

  it("marks the reduced-motion variant", () => {
    expect(hardLoad("/", true)).toBe("reduced");
  });

  it("leaves other pages alone", () => {
    expect(hardLoad("/work/pertemps", false)).toBeNull();
  });
});
