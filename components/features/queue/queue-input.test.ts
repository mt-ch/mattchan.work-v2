// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { queueConfig } from "./config";
import { blendVelocity, impulseFor, isPaused, pxToCards } from "./queue-input";
import { stepQueue } from "./queue-step";

const base = { reduced: false, dt: 0.05, config: queueConfig };

describe("pxToCards", () => {
  it("moves forward when dragged leftwards and back when rightwards", () => {
    expect(pxToCards(-100, queueConfig, 900)).toBeGreaterThan(0);
    expect(pxToCards(100, queueConfig, 900)).toBeLessThan(0);
  });

  it("flips with the fan direction", () => {
    const mirrored = { ...queueConfig, direction: -1 };

    expect(pxToCards(-100, mirrored, 900)).toBeLessThan(0);
  });
});

describe("momentum", () => {
  it("coasts the impulse distance, then stops", () => {
    let motion = {
      position: 0,
      velocity: impulseFor(2, queueConfig),
      drift: 0,
    };
    for (let i = 0; i < 600; i++) {
      motion = stepQueue({ ...base, paused: true, motion, dt: 0.016 });
    }

    expect(motion.position).toBeCloseTo(2, 1);
    expect(motion.velocity).toBe(0);
  });

  it("smooths drag velocity toward recent samples", () => {
    const v = blendVelocity(blendVelocity(0, 1, 0.1), 1, 0.1);

    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(10);
    expect(blendVelocity(3, 1, 0)).toBe(3);
  });
});

describe("pause and resume", () => {
  it("holds while a hold is active or the resume delay has not passed", () => {
    expect(isPaused({ holds: true, now: 10, resumeAt: 0 })).toBe(true);
    expect(isPaused({ holds: false, now: 1, resumeAt: 2 })).toBe(true);
    expect(isPaused({ holds: false, now: 3, resumeAt: 2 })).toBe(false);
  });

  it("eases the drift back in rather than snapping to full speed", () => {
    const stopped = { position: 0, velocity: 0, drift: 0 };
    const first = stepQueue({ ...base, paused: false, motion: stopped });
    const later = stepQueue({ ...base, paused: false, motion: first });

    expect(first.drift).toBeGreaterThan(0);
    expect(first.drift).toBeLessThan(1);
    expect(later.drift).toBeGreaterThan(first.drift);
  });

  it("stops the drift at once when paused", () => {
    const moving = { position: 0, velocity: 0, drift: 1 };
    const next = stepQueue({ ...base, paused: true, motion: moving });

    expect(next.position).toBe(0);
    expect(next.drift).toBe(0);
  });
});
