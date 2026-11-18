// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { queueConfig } from "./config";
import { layoutQueue } from "./queue-layout";
import { resolveConfig } from "./resolve-config";

const viewport = { width: 390, height: 800 };
const desktop = { mobile: false, reduced: false };

describe("resolveConfig", () => {
  it("leaves the desktop config as it is", () => {
    expect(resolveConfig(queueConfig, desktop)).toEqual(queueConfig);
  });

  it("uses the mobile perspective and card height on narrow screens", () => {
    const resolved = resolveConfig(queueConfig, { ...desktop, mobile: true });

    expect(resolved.perspective).toBe(queueConfig.mobilePerspective);
    expect(resolved.perspective).toBeLessThan(queueConfig.perspective);
    expect(resolved.cardHeight).toBe(queueConfig.mobileCardHeight);
    expect(resolved.cardHeight).toBeLessThan(queueConfig.cardHeight);
  });

  it("does not change the config it was given", () => {
    const before = { ...queueConfig };
    resolveConfig(queueConfig, { mobile: true, reduced: true });

    expect(queueConfig).toEqual(before);
  });

  it("lays out smaller cards on mobile", () => {
    const input = { count: 10, position: 0, viewport };
    const wide = layoutQueue({ ...input, config: queueConfig });
    const narrow = layoutQueue({
      ...input,
      config: resolveConfig(queueConfig, { ...desktop, mobile: true }),
    });

    expect(narrow[0].height).toBeLessThan(wide[0].height);
  });

  it("flattens rotation to one small static tilt under reduced motion", () => {
    const config = resolveConfig(
      { ...queueConfig, rotateFalloff: 5 },
      { ...desktop, reduced: true },
    );
    const cards = layoutQueue({ count: 10, config, position: 2.4, viewport });

    for (const card of cards) {
      expect(card.rotateY).toBe(queueConfig.reducedTilt);
    }
    expect(Math.abs(queueConfig.reducedTilt)).toBeLessThan(
      Math.abs(queueConfig.rotateY),
    );
  });
});
