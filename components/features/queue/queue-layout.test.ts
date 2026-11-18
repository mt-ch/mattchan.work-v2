// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { queueConfig } from "./config";
import { CARD_RATIO, layoutQueue, wrapIndex } from "./queue-layout";

const viewport = { width: 1280, height: 800 };
const base = { count: 20, config: queueConfig, position: 0, viewport };
const total = queueConfig.renderBefore + queueConfig.renderAfter + 1;

describe("wrapIndex", () => {
  it("wraps both directions and tolerates an empty set", () => {
    expect(wrapIndex(21, 20)).toBe(1);
    expect(wrapIndex(-1, 20)).toBe(19);
    expect(wrapIndex(3, 0)).toBe(0);
  });
});

describe("layoutQueue", () => {
  it("renders the configured window, within 10 to 14 cards by default", () => {
    const cards = layoutQueue(base);

    expect(cards).toHaveLength(total);
    expect(total).toBeGreaterThanOrEqual(10);
    expect(total).toBeLessThanOrEqual(14);
  });

  it("returns nothing when there are no pieces", () => {
    expect(layoutQueue({ ...base, count: 0 })).toEqual([]);
  });

  it("follows piece order and wraps by modulo past either end", () => {
    const ahead = layoutQueue({ ...base, count: 5, position: 3 });
    const ordered = [...ahead].sort((a, b) => Number(a.key) - Number(b.key));

    ordered.slice(1).forEach((card, i) => {
      expect(card.pieceIndex).toBe((ordered[i].pieceIndex + 1) % 5);
    });
    expect(
      layoutQueue({ ...base, position: -1 }).some((c) => c.pieceIndex === 19),
    ).toBe(true);
  });

  it("gives every card a unique key, even with fewer pieces than cards", () => {
    const cards = layoutQueue({ ...base, count: 3 });

    expect(new Set(cards.map((c) => c.key)).size).toBe(cards.length);
  });

  it("keeps a card's key stable as the position moves", () => {
    const before = layoutQueue({ ...base, position: 0.2 });
    const after = layoutQueue({ ...base, position: 0.4 });
    const key = before.find((c) => c.focus)!.key;

    expect(after.some((c) => c.key === key)).toBe(true);
  });

  it("marks the card nearest the position as focus, full size and opaque", () => {
    const cards = layoutQueue({ ...base, position: 7 });
    const focus = cards.filter((c) => c.focus);

    expect(focus).toHaveLength(1);
    expect(focus[0].pieceIndex).toBe(7);
    expect(focus[0].scale).toBe(1);
    expect(focus[0].opacity).toBe(1);
    expect(focus[0].x).toBeCloseTo(0);
    expect(focus[0].y).toBeCloseTo(0);
  });

  it("moves the focus to the next card once the position passes halfway", () => {
    const focus = (position: number) =>
      layoutQueue({ ...base, position }).find((c) => c.focus)!.pieceIndex;

    expect(focus(2.4)).toBe(2);
    expect(focus(2.6)).toBe(3);
  });

  it("fans far cards to the top-right and shrinks and fades them", () => {
    const cards = layoutQueue(base);
    const far = cards.filter((c) => c.pieceIndex > 0 && c.pieceIndex < 10);

    for (const card of far) {
      expect(card.x).toBeGreaterThan(0);
      expect(card.y).toBeLessThan(0);
      expect(card.scale).toBeLessThan(1);
      expect(card.opacity).toBeLessThan(1);
    }
    const [a, b] = [1, 2].map((i) => cards.find((c) => c.pieceIndex === i)!);
    expect(b.scale).toBeLessThan(a.scale);
    expect(b.opacity).toBeLessThan(a.opacity);
    expect(b.z).toBeLessThan(a.z);
  });

  it("never lets scale drop below the minimum or opacity below zero", () => {
    const config = { ...queueConfig, scaleFalloff: 1, fadeFalloff: 1 };

    for (const card of layoutQueue({ ...base, config })) {
      expect(card.scale).toBeGreaterThanOrEqual(config.minScale);
      expect(card.opacity).toBeGreaterThanOrEqual(0);
    }
  });

  it("sizes every card 4:5 from the viewport height", () => {
    for (const card of layoutQueue(base)) {
      expect(card.height).toBeCloseTo(viewport.height * queueConfig.cardHeight);
      expect(card.width / card.height).toBeCloseTo(CARD_RATIO);
    }
  });

  it("flattens the fan at angle 0", () => {
    const cards = layoutQueue({
      ...base,
      config: { ...queueConfig, angle: 0 },
    });

    for (const card of cards) expect(card.y).toBeCloseTo(0);
  });

  it("ranks the nearest-to-camera card 0 and the farthest last", () => {
    const cards = layoutQueue(base);

    expect(cards[0].depthRank).toBe(0);
    expect(cards.at(-1)!.depthRank).toBe(cards.length - 1);
    expect(cards[0].z).toBeGreaterThanOrEqual(cards.at(-1)!.z);
  });

  it("mirrors x and rotateY when the direction is -1", () => {
    const flipped = layoutQueue({
      ...base,
      config: { ...queueConfig, direction: -1 },
    });
    const normal = layoutQueue(base);

    flipped.forEach((card, i) => {
      expect(card.x).toBeCloseTo(-normal[i].x);
      expect(card.rotateY).toBeCloseTo(-normal[i].rotateY);
    });
  });

  it("keeps every card 4:5 unless orientation is honoured", () => {
    const orientations = Array<"landscape">(20).fill("landscape");
    const uniform = layoutQueue({ ...base, orientations });
    const honoured = layoutQueue({
      ...base,
      orientations,
      config: { ...queueConfig, honourOrientation: true },
    });

    expect(uniform[0].width / uniform[0].height).toBeCloseTo(CARD_RATIO);
    expect(honoured[0].width / honoured[0].height).toBeCloseTo(1.5, 1);
  });
});
