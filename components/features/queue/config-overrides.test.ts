// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { queueConfig } from "./config";
import { mergeQueueConfig } from "./config-overrides";

describe("mergeQueueConfig", () => {
  it("applies saved values of the right type", () => {
    const merged = mergeQueueConfig(queueConfig, { angle: 40, direction: -1 });

    expect(merged.angle).toBe(40);
    expect(merged.direction).toBe(-1);
  });

  it("ignores unknown keys and wrong types", () => {
    const merged = mergeQueueConfig(queueConfig, {
      angle: "steep",
      nope: 1,
    });

    expect(merged).toEqual(queueConfig);
  });

  it("returns the defaults for empty storage, without mutating them", () => {
    const merged = mergeQueueConfig(queueConfig, null);

    expect(merged).toEqual(queueConfig);
    expect(merged).not.toBe(queueConfig);
  });
});
