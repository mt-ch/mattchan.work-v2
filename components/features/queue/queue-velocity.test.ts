// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { queueConfig } from "./config";
import { FULL_COUPLING_SPEED, layoutQueue } from "./queue-layout";

const viewport = { width: 1280, height: 800 };
const base = { count: 20, config: queueConfig, position: 0, viewport };

describe("velocity coupling", () => {
  const coupled = {
    ...queueConfig,
    velocitySkew: 10,
    velocityRotate: 12,
    velocitySpread: 0.5,
  };
  const at = (velocity: number, config = coupled) =>
    layoutQueue({ ...base, config, velocity });
  const focusOf = (cards: ReturnType<typeof at>) => cards.find((c) => c.focus)!;
  const far = (cards: ReturnType<typeof at>) =>
    cards.find((c) => c.pieceIndex === 5)!;

  it("leaves the layout unchanged at rest", () => {
    expect(at(0)).toEqual(
      layoutQueue({
        ...base,
        config: {
          ...coupled,
          velocitySkew: 0,
          velocityRotate: 0,
          velocitySpread: 0,
        },
      }),
    );
    expect(at(0)).toEqual(layoutQueue({ ...base, config: coupled }));
  });

  it("skews and rotates more the faster it moves, and flips with direction", () => {
    expect(focusOf(at(2)).skew).toBeGreaterThan(focusOf(at(1)).skew);
    expect(focusOf(at(-2)).skew).toBeCloseTo(-focusOf(at(2)).skew);
    expect(focusOf(at(2)).rotateY).toBeGreaterThan(focusOf(at(0)).rotateY);
  });

  it("spreads cards apart in either direction", () => {
    const rest = Math.abs(far(at(0)).x);

    expect(Math.abs(far(at(2)).x)).toBeGreaterThan(rest);
    expect(Math.abs(far(at(-2)).x)).toBeCloseTo(Math.abs(far(at(2)).x));
  });

  it("stops growing past full speed", () => {
    expect(focusOf(at(100)).skew).toBeCloseTo(
      focusOf(at(FULL_COUPLING_SPEED)).skew,
    );
  });

  it("does nothing when every effect is zero", () => {
    const off = {
      ...queueConfig,
      velocitySkew: 0,
      velocityRotate: 0,
      velocitySpread: 0,
    };

    expect(at(3, off)).toEqual(at(0, off));
  });

  it("mirrors skew when the direction is -1", () => {
    const flipped = at(2, { ...coupled, direction: -1 });

    expect(focusOf(flipped).skew).toBeCloseTo(-focusOf(at(2)).skew);
  });
});
