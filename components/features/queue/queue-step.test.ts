// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { queueConfig } from "./config";
import { measureSpeed, stepQueue } from "./queue-step";

const base = { paused: false, reduced: false, dt: 0.05, config: queueConfig };

describe("stepQueue", () => {
  it("drifts at a constant speed with no input", () => {
    const first = stepQueue({
      ...base,
      motion: { position: 0, velocity: 0, drift: 1 },
    });
    const second = stepQueue({ ...base, motion: first });

    expect(first.position).toBeCloseTo(queueConfig.driftSpeed * 0.05);
    expect(second.position - first.position).toBeCloseTo(first.position);
    expect(second.velocity).toBe(0);
  });

  it("reverses when the drift direction is reversed", () => {
    const config = { ...queueConfig, driftDirection: -1 };
    const next = stepQueue({
      ...base,
      config,
      motion: { position: 5, velocity: 0, drift: 1 },
    });

    expect(next.position).toBeCloseTo(5 - queueConfig.driftSpeed * 0.05);
  });

  it("does not drift while paused or under reduced motion", () => {
    const motion = { position: 2, velocity: 0, drift: 1 };

    expect(stepQueue({ ...base, paused: true, motion }).position).toBe(2);
    expect(stepQueue({ ...base, reduced: true, motion }).position).toBe(2);
  });

  it("lets momentum play out and decay, even while paused", () => {
    const next = stepQueue({
      ...base,
      paused: true,
      motion: { position: 0, velocity: 2, drift: 1 },
    });

    expect(next.position).toBeGreaterThan(0);
    expect(next.velocity).toBeLessThan(2);
    expect(next.velocity).toBeGreaterThan(0);
  });

  it("caps a long frame so a resumed tab does not jump", () => {
    const next = stepQueue({
      ...base,
      dt: 30,
      motion: { position: 0, velocity: 0, drift: 1 },
    });

    expect(next.position).toBeCloseTo(queueConfig.driftSpeed * 0.1);
  });
});

describe("measureSpeed", () => {
  it("settles toward the real speed over a few frames", () => {
    let speed = 0;
    for (let i = 0; i < 30; i++) {
      speed = measureSpeed({ previous: speed, moved: 0.05, dt: 0.016 });
    }

    expect(speed).toBeCloseTo(0.05 / 0.016, 0);
  });

  it("holds the previous speed when no time passed", () => {
    expect(measureSpeed({ previous: 2, moved: 5, dt: 0 })).toBe(2);
  });
});
