// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { queueConfig } from "./config";
import { layoutQueue } from "./queue-layout";

const viewport = { width: 1280, height: 800 };
const base = { count: 20, config: queueConfig, position: 0, viewport };

describe("layoutQueue hover", () => {
  const rest = layoutQueue(base);
  const target = rest[3].key;
  const hovered = (amount: number, extra = {}) =>
    layoutQueue({ ...base, hover: { key: target, amount }, ...extra });

  it("gives today's layout with no hover, amount 0, or effect off", () => {
    expect(layoutQueue({ ...base, hover: { key: null, amount: 1 } })).toEqual(
      rest,
    );
    expect(hovered(0)).toEqual(rest);
    expect(
      layoutQueue({
        ...base,
        config: { ...queueConfig, hoverEffect: "off" },
        hover: { key: target, amount: 1 },
      }),
    ).toEqual(rest);
  });

  it("peels only the hovered card, without moving its slot", () => {
    const cards = hovered(1);

    cards.forEach((card) => {
      const before = rest.find((c) => c.key === card.key)!;
      if (card.key !== target) return expect(card).toEqual(before);

      expect(card.x).toBe(before.x);
      expect(card.y).toBe(before.y);
      expect(card.rotateY).toBeCloseTo(0);
      expect(card.z).toBeGreaterThan(before.z);
    });
  });

  it("eases the peel with the amount", () => {
    const half = hovered(0.5).find((c) => c.key === target)!;
    const before = rest.find((c) => c.key === target)!;

    expect(Math.abs(half.rotateY)).toBeLessThan(Math.abs(before.rotateY));
    expect(Math.abs(half.rotateY)).toBeGreaterThan(0);
  });

  it("mirrors under direction -1", () => {
    const config = { ...queueConfig, direction: -1 };
    const mirrorRest = layoutQueue({ ...base, config });
    const peeled = layoutQueue({
      ...base,
      config,
      hover: { key: target, amount: 0.5 },
    }).find((c) => c.key === target)!;
    const plain = hovered(0.5).find((c) => c.key === target)!;

    expect(peeled.rotateY).toBeCloseTo(-plain.rotateY);
    expect(peeled.z).toBeCloseTo(plain.z);
    expect(mirrorRest.find((c) => c.key === target)!.z).toBeLessThan(peeled.z);
  });

  it("only brightens the hovered card under reduced motion", () => {
    const cards = hovered(1, { reduced: true });

    cards.forEach((card) => {
      const before = rest.find((c) => c.key === card.key)!;
      if (card.key === target) {
        expect(card).toEqual({ ...before, brightness: card.brightness });
        expect(card.brightness).toBeGreaterThan(1);
      } else {
        expect(card).toEqual(before);
      }
    });
  });

  describe("tug", () => {
    const tug = { ...queueConfig, hoverEffect: "tug" as const };
    const tugged = (amount: number, extra = {}) =>
      layoutQueue({
        ...base,
        config: tug,
        hover: { key: target, amount },
        ...extra,
      });
    const before = rest.find((c) => c.key === target)!;

    it("moves the hovered card at right angles to the track", () => {
      const card = tugged(1).find((c) => c.key === target)!;
      const dx = card.x - before.x;
      const dy = card.y - before.y;
      const angle = (tug.angle * Math.PI) / 180;

      expect(Math.hypot(dx, dy)).toBeGreaterThan(0);
      // Dot with the track direction is zero: no movement along the track
      expect(dx * Math.cos(angle) - dy * Math.sin(angle)).toBeCloseTo(0);
      expect(card.z).toBe(before.z);
      expect(card.rotateY).toBe(before.rotateY);
    });

    it("leaves other cards unchanged", () => {
      tugged(1).forEach((card) => {
        if (card.key === target) return;
        expect(card).toEqual(rest.find((c) => c.key === card.key));
      });
    });

    it("mirrors under direction -1", () => {
      const config = { ...tug, direction: -1 };
      const mirrorRest = layoutQueue({ ...base, config }).find(
        (c) => c.key === target,
      )!;
      const card = layoutQueue({
        ...base,
        config,
        hover: { key: target, amount: 1 },
      }).find((c) => c.key === target)!;
      const plain = tugged(1).find((c) => c.key === target)!;

      expect(card.x - mirrorRest.x).toBeCloseTo(-(plain.x - before.x));
      expect(card.y - mirrorRest.y).toBeCloseTo(plain.y - before.y);
    });

    it("only brightens under reduced motion", () => {
      const card = tugged(1, { reduced: true }).find((c) => c.key === target)!;

      expect(card.x).toBe(before.x);
      expect(card.y).toBe(before.y);
      expect(card.brightness).toBeGreaterThan(1);
    });
  });

  it("changes nothing for a key that is not rendered", () => {
    expect(layoutQueue({ ...base, hover: { key: "nope", amount: 1 } })).toEqual(
      rest,
    );
  });
});
