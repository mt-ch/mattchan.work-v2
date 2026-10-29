// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { getRingGeometry, getSlotPoint } from "./orbit-geometry";

describe("getRingGeometry", () => {
  it("centres the ellipse in the viewport", () => {
    expect(getRingGeometry(1600, 900).centre).toEqual({ x: 800, y: 450 });
  });

  it("keeps cards at the 3:2 of the tiles", () => {
    const { cardWidth, cardHeight } = getRingGeometry(1600, 900);

    expect(cardWidth / cardHeight).toBeCloseTo(3 / 2);
  });
});

describe("getSlotPoint", () => {
  const ring = getRingGeometry(1600, 900);

  it("spreads slots evenly, starting above the centre", () => {
    const top = getSlotPoint(ring, 0, 12, 0);
    const bottom = getSlotPoint(ring, 6, 12, 0);

    expect(top.x).toBeCloseTo(ring.centre.x);
    expect(top.y).toBeLessThan(ring.centre.y);
    expect(bottom.y).toBeCloseTo(2 * ring.centre.y - top.y);
  });

  it("turns clockwise on screen", () => {
    const quarter = getSlotPoint(ring, 0, 12, Math.PI / 2);

    expect(quarter.x).toBeGreaterThan(ring.centre.x);
    expect(quarter.y).toBeCloseTo(ring.centre.y);
  });
});
