// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { playgroundConfig } from "./config";
import { layoutTiles } from "./layout";
import type { Piece } from "./playground-data";

const mixed = playgroundConfig.layout;
const viewport = { width: 1280, height: 800 };
const origin = { x: 0, y: 0 };

const pieces: Piece[] = Array.from({ length: 40 }, (_, i) => ({
  slug: `project-${i % 10}`,
  title: `Project ${i % 10}`,
  orientation: i % 4 === 1 ? "landscape" : "portrait",
  src: `https://cdn.example/${i}.jpg`,
}));

const base = { pieces, layout: mixed, seed: 1, viewport };
const rowsOf = (tiles: ReturnType<typeof layoutTiles>) => {
  const rows = new Map<number, typeof tiles>();
  for (const t of tiles) rows.set(t.row, [...(rows.get(t.row) ?? []), t]);
  for (const row of rows.values()) row.sort((a, b) => a.worldX - b.worldX);

  return rows;
};

describe("layoutTiles vertical offset", () => {
  const wavy = {
    ...mixed,
    fillRatio: 1,
    waveAmplitude: 40,
    waveLength: 900,
    wavePhaseStep: 30,
    jitterAmount: 30,
  };
  const pitch = mixed.tileHeight + mixed.gap;
  const cap = (mixed.gap - mixed.minGap) / 2;
  const tall = { width: 6000, height: 3000 };
  const place = (layout: typeof mixed, camera = origin) =>
    layoutTiles({ ...base, layout, camera, viewport: tall });

  it("shares one worldY per row when wave and jitter are 0", () => {
    for (const row of rowsOf(
      place({ ...wavy, waveAmplitude: 0, jitterAmount: 0 }),
    ).values()) {
      for (const t of row) expect(t.worldY).toBe(row[0].worldY);
    }
  });

  it("keeps every tile within the cap of its row line", () => {
    for (const t of place(wavy)) {
      expect(Math.abs(t.worldY - t.row * pitch)).toBeLessThanOrEqual(cap);
    }
  });

  it("moves tiles off the row line when the wave is on", () => {
    const tiles = place({ ...wavy, jitterAmount: 0 });
    expect(tiles.some((t) => t.worldY !== t.row * pitch)).toBe(true);
  });

  it("never overlaps tiles in adjacent rows, even far above the cap", () => {
    const wild = { ...wavy, waveAmplitude: 5000, jitterAmount: 5000 };
    const rows = rowsOf(place(wild));

    for (const [index, row] of rows) {
      for (const t of rows.get(index + 1) ?? []) {
        const above = row.filter(
          (o) => o.worldX < t.worldX + t.width && o.worldX + o.width > t.worldX,
        );
        for (const o of above)
          expect(o.worldY + o.height).toBeLessThan(t.worldY);
      }
    }
  });

  it("gives the same tiles for the same inputs", () => {
    expect(place(wavy)).toEqual(place(wavy));
  });

  it("gives tiles at the same world x the same offset across rows when phase step and jitter are 0", () => {
    const flat = { ...wavy, wavePhaseStep: 0, jitterAmount: 0 };
    const tiles = place(flat, { x: 0, y: 0 }).filter((t) => t.row >= 0);
    const offsetAt = (t: (typeof tiles)[number]) => t.worldY - t.row * pitch;
    const first = tiles.find((t) => t.row === 0 && t.column >= 0)!;
    const twin = tiles.find(
      (t) =>
        t.row !== 0 &&
        t.row % 2 === 0 &&
        t.worldX === first.worldX &&
        t.width === first.width,
    );
    if (twin) expect(offsetAt(twin)).toBeCloseTo(offsetAt(first));
    expect(twin).toBeDefined();
  });

  it("returns tiles offset into the viewport from a row just outside it", () => {
    const camera = { x: 0, y: 3 * pitch };
    const view = { width: 1280, height: 400 };
    const layout = { ...wavy, margin: 0, waveAmplitude: 5000, jitterAmount: 0 };
    const inView = (t: ReturnType<typeof layoutTiles>[number]) =>
      t.x + t.width > 0 &&
      t.x < view.width &&
      t.y + t.height > 0 &&
      t.y < view.height;
    // Every tile touching the viewport, found with a margin too big to miss any
    const expected = layoutTiles({
      ...base,
      layout: { ...layout, margin: 3000 },
      camera,
      viewport: view,
    }).filter(inView);
    const actual = layoutTiles({ ...base, layout, camera, viewport: view });

    expect(expected.length).toBeGreaterThan(0);
    expect(
      actual
        .filter(inView)
        .map((t) => t.key)
        .sort(),
    ).toEqual(expected.map((t) => t.key).sort());
  });
});
