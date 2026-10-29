// Third-party libraries
import { gsap } from "gsap";
import { beforeAll, describe, expect, it, vi } from "vitest";

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
  const { timeline } = buildEntranceTimeline({ root, reduced, onComplete });
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

/**
 * Builds the full orbit timeline over five tiles, with the counter stubbed.
 *
 * @returns The root, tiles, hand-off spy and timeline.
 */
function setupOrbit() {
  const root = document.createElement("div");
  const tiles = Array.from({ length: 5 }, () => {
    const tile = document.createElement("a");
    tile.setAttribute("data-entrance", "tile");
    tile.append(document.createElement("img"));
    root.append(tile);

    return tile;
  });
  const tween = () => gsap.to({}, { duration: 0.1 });
  const counter = {
    show: tween,
    place: () => {},
    loadTo: () => {},
    endLoad: () => {},
    run: (duration: number) => gsap.to({}, { duration }),
    hide: tween,
    destroy: () => {},
  };
  const onComplete = vi.fn();
  const built = buildEntranceTimeline({
    root,
    reduced: false,
    stack: { cards: tiles, counter },
    onComplete,
  });
  built.timeline.pause(0);

  return { root, tiles, onComplete, ...built };
}

describe("buildEntranceTimeline orbit", () => {
  // jsdom has no image decoding
  beforeAll(() => {
    HTMLImageElement.prototype.decode = () => Promise.resolve();
  });

  const clonesIn = (root: HTMLElement) =>
    root.querySelectorAll("[data-entrance-clone]");

  it("puts the real tiles first on a ring of 12", () => {
    const { root, tiles } = setupOrbit();
    const cards = [...tiles, ...clonesIn(root)];

    expect(cards).toHaveLength(ENTRANCE_CONFIG.ringCount);
    expect(clonesIn(root)).toHaveLength(ENTRANCE_CONFIG.ringCount - 5);
    clonesIn(root).forEach((clone) =>
      expect(clone.getAttribute("aria-hidden")).toBe("true"),
    );
  });

  it("pops cards in on a fixed stagger, newest on top", () => {
    const { timeline, tiles } = setupOrbit();
    const { popStagger } = ENTRANCE_CONFIG;

    timeline.time(popStagger * 1.5);
    expect(gsap.getProperty(tiles[1], "opacity")).toBeGreaterThan(0);
    expect(gsap.getProperty(tiles[2], "opacity")).toBe(0);
    expect(gsap.getProperty(tiles[1], "zIndex")).toBeGreaterThan(
      Number(gsap.getProperty(tiles[0], "zIndex")),
    );
  });

  it("gathers every card into the stack before the deal", () => {
    const { timeline, tiles, root } = setupOrbit();

    timeline.time(timeline.labels.deal);
    const stackX = gsap.getProperty(tiles[0], "x");
    tiles.forEach((tile) => expect(gsap.getProperty(tile, "x")).toBe(stackX));
    clonesIn(root).forEach((clone) =>
      expect(gsap.getProperty(clone, "opacity")).toBe(1),
    );
  });

  it("removes the clones after the deal and hands off", () => {
    const { timeline, root, onComplete } = setupOrbit();

    timeline.progress(1);

    expect(clonesIn(root)).toHaveLength(0);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("removes the clones when disposed early", () => {
    const { timeline, dispose, root } = setupOrbit();

    timeline.progress(0.3);
    dispose();

    expect(clonesIn(root)).toHaveLength(0);
  });
});
