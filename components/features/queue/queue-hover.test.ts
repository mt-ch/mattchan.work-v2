// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { isStill, stepHover } from "./queue-hover";

const base = { rate: 8, dt: 0.05, still: true };

describe("stepHover", () => {
  it("eases up while a card is hovered and the Queue is still", () => {
    const claimed = stepHover({
      ...base,
      state: { key: null, amount: 0 },
      hovered: "3",
    });
    const rising = stepHover({ ...base, state: claimed, hovered: "3" });
    const more = stepHover({ ...base, state: rising, hovered: "3" });

    expect(claimed).toEqual({ key: "3", amount: 0 });
    expect(rising.amount).toBeGreaterThan(0);
    expect(more.amount).toBeGreaterThan(rising.amount);
    expect(more.amount).toBeLessThan(1);
  });

  it("eases down when unhovered, then lets go of the key", () => {
    let state = { key: "3" as string | null, amount: 1 };
    state = stepHover({ ...base, state, hovered: null });

    expect(state.key).toBe("3");
    expect(state.amount).toBeLessThan(1);

    for (let i = 0; i < 100; i++)
      state = stepHover({ ...base, state, hovered: null });
    expect(state).toEqual({ key: null, amount: 0 });
  });

  it("eases down while the Queue is moving", () => {
    const next = stepHover({
      ...base,
      still: false,
      state: { key: "3", amount: 1 },
      hovered: "3",
    });

    expect(next.amount).toBeLessThan(1);
  });

  it("caps long frames", () => {
    const long = stepHover({
      ...base,
      dt: 60,
      state: { key: "3", amount: 0.5 },
      hovered: "3",
    });
    const capped = stepHover({
      ...base,
      dt: 0.1,
      state: { key: "3", amount: 0.5 },
      hovered: "3",
    });

    expect(long.amount).toBeCloseTo(capped.amount);
    expect(long.amount).toBeLessThan(1);
  });

  it("hands over between keys by easing out first, with no jump", () => {
    let state = { key: "3" as string | null, amount: 1 };
    const seen: number[] = [];

    for (let i = 0; i < 200; i++) {
      const before = state;
      state = stepHover({ ...base, state, hovered: "4" });
      seen.push(Math.abs(state.amount - before.amount));
      if (state.key === "4") break;
    }

    expect(state.key).toBe("4");
    expect(state.amount).toBe(0);
    expect(Math.max(...seen)).toBeLessThan(0.5);
  });
});

describe("isStill", () => {
  it("is true only near zero speed in either direction", () => {
    expect(isStill(0)).toBe(true);
    expect(isStill(-0.5)).toBe(false);
    expect(isStill(0.5)).toBe(false);
  });
});
