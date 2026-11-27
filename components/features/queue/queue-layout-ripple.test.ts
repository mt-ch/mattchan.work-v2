// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { queueConfig } from "./config";
import { layoutQueue } from "./queue-layout";

const config = { ...queueConfig, hoverEffect: "ripple" as const };
const viewport = { width: 1280, height: 800 };
const base = { count: 20, config, position: 0, viewport };

describe("layoutQueue ripple", () => {
  const rest = layoutQueue(base);
  const target = rest[4].key;
  const at = (elapsed: number, extra = {}) =>
    layoutQueue({
      ...base,
      hover: { key: target, amount: 1, elapsed },
      ...extra,
    });
  const byKey = (cards: typeof rest, key: string) =>
    cards.find((c) => c.key === key)!;
  const shift = (cards: typeof rest, offset: number) => {
    const key = `${Number(target) + offset}`;

    return byKey(cards, key).z - byKey(rest, key).z;
  };

  it("lifts the hovered card without moving its slot", () => {
    const card = byKey(at(0.3), target);
    const before = byKey(rest, target);

    expect(card.x).toBe(before.x);
    expect(card.y).toBe(before.y);
    expect(card.z).toBeGreaterThan(before.z);
  });

  it("waits for the wave to reach a neighbour, then moves it", () => {
    expect(shift(at(0), 1)).toBe(0);
    expect(shift(at(0.1), 1)).not.toBe(0);
  });

  it("is pure: same inputs, same layout", () => {
    expect(at(0.2)).toEqual(at(0.2));
  });

  it("shrinks neighbour displacement with distance", () => {
    const peak = (offset: number) =>
      Math.max(
        ...Array.from({ length: 100 }, (_, i) =>
          Math.abs(shift(at(i / 100), offset)),
        ),
      );

    expect(peak(1)).toBeGreaterThan(peak(2));
    expect(peak(2)).toBeGreaterThan(0);
  });

  it("leaves cards outside reach unchanged", () => {
    for (let t = 0; t < 1; t += 0.05) {
      expect(shift(at(t), 3)).toBe(0);
      expect(shift(at(t), -3)).toBe(0);
    }
  });

  it("widens with the reach knob", () => {
    const wide = layoutQueue({
      ...base,
      config: { ...config, hoverReach: 3 },
      hover: { key: target, amount: 1, elapsed: 0.3 },
    });

    expect(shift(wide, 3)).not.toBe(0);
  });

  it("settles back to rest", () => {
    const late = at(5);

    expect(shift(late, 1)).toBeCloseTo(0);
    expect(shift(late, 2)).toBeCloseTo(0);
  });

  it("fades out with the hover amount", () => {
    const gone = layoutQueue({
      ...base,
      hover: { key: target, amount: 0, elapsed: 0.2 },
    });

    expect(gone).toEqual(rest);
  });

  it("mirrors under direction -1", () => {
    const mirror = { ...config, direction: -1 };
    const plain = at(0.2);
    const flipped = at(0.2, { config: mirror });

    plain.forEach((card) => {
      expect(byKey(flipped, card.key).z).toBeCloseTo(card.z);
      expect(byKey(flipped, card.key).x).toBeCloseTo(-card.x);
    });
  });

  it("only brightens the hovered card under reduced motion", () => {
    at(0.2, { reduced: true }).forEach((card) => {
      const before = byKey(rest, card.key);
      if (card.key === target) {
        expect(card.brightness).toBeGreaterThan(1);
        expect(card).toEqual({ ...before, brightness: card.brightness });
      } else {
        expect(card).toEqual(before);
      }
    });
  });
});
