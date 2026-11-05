// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { edgeNudge } from "./edge-nudge";

const viewport = { width: 1000, height: 800 };
const on = { enabled: true, zone: 0.1, max: 80 };

describe("edgeNudge", () => {
  it("is zero away from the edges", () => {
    expect(edgeNudge({ x: 500, y: 400 }, viewport, on)).toEqual({ x: 0, y: 0 });
  });

  it("is zero without a pointer", () => {
    expect(edgeNudge(null, viewport, on)).toEqual({ x: 0, y: 0 });
  });

  it("pushes towards each edge with the matching sign", () => {
    expect(edgeNudge({ x: 0, y: 400 }, viewport, on).x).toBeLessThan(0);
    expect(edgeNudge({ x: 1000, y: 400 }, viewport, on).x).toBeGreaterThan(0);
    expect(edgeNudge({ x: 500, y: 0 }, viewport, on).y).toBeLessThan(0);
    expect(edgeNudge({ x: 500, y: 800 }, viewport, on).y).toBeGreaterThan(0);
  });

  it("nudges both axes in a corner", () => {
    const corner = edgeNudge({ x: 1000, y: 800 }, viewport, on);
    expect(corner.x).toBeGreaterThan(0);
    expect(corner.y).toBeGreaterThan(0);
  });

  it("never exceeds the maximum, even outside the viewport", () => {
    const far = edgeNudge({ x: -500, y: 5000 }, viewport, on);
    expect(Math.abs(far.x)).toBeLessThanOrEqual(80);
    expect(Math.abs(far.y)).toBeLessThanOrEqual(80);
  });

  it("grows as the pointer moves deeper into the zone", () => {
    const shallow = edgeNudge({ x: 95, y: 400 }, viewport, on).x;
    const deep = edgeNudge({ x: 10, y: 400 }, viewport, on).x;
    expect(Math.abs(deep)).toBeGreaterThan(Math.abs(shallow));
  });

  it("is zero when disabled", () => {
    expect(
      edgeNudge({ x: 0, y: 0 }, viewport, { ...on, enabled: false }),
    ).toEqual({ x: 0, y: 0 });
  });
});
