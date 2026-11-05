// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { playgroundConfig } from "./config";
import { PERIOD_COLUMNS, PERIOD_ROWS, layoutTiles, periodSize } from "./layout";
import type { Piece } from "./playground-data";

const layout = playgroundConfig.layout;
const viewport = { width: 1280, height: 800 };

const pieces: Piece[] = Array.from({ length: 40 }, (_, i) => ({
  slug: `project-${i % 10}`,
  title: `Project ${i % 10}`,
  src: `https://cdn.example/${i}.jpg`,
}));

const base = { pieces, layout, seed: 1, viewport };
const origin = { x: 0, y: 0 };
const signature = (tiles: ReturnType<typeof layoutTiles>) =>
  tiles.map((t) => `${t.key}=${t.piece.src}`).sort();

describe("layoutTiles", () => {
  it("gives the same tiles for the same seed and config", () => {
    expect(layoutTiles({ ...base, camera: origin })).toEqual(
      layoutTiles({ ...base, camera: origin }),
    );
  });

  it("arranges differently for a different seed", () => {
    const a = layoutTiles({ ...base, camera: origin });
    const b = layoutTiles({ ...base, seed: 2, camera: origin });
    expect(signature(a)).not.toEqual(signature(b));
  });

  it("keeps neighbouring tiles from sharing a Project", () => {
    const period = periodSize(layout);
    const tiles = layoutTiles({
      ...base,
      camera: origin,
      viewport: { width: period.width, height: period.height },
    });
    const byCell = new Map(tiles.map((t) => [`${t.column}:${t.row}`, t]));

    for (const tile of tiles) {
      for (const dc of [-1, 0, 1]) {
        for (const dr of [-1, 0, 1]) {
          if (dc === 0 && dr === 0) continue;
          const other = byCell.get(`${tile.column + dc}:${tile.row + dr}`);
          if (other) expect(other.piece.slug).not.toBe(tile.piece.slug);
        }
      }
    }
  });

  it("repeats the same pieces after one full period", () => {
    const period = periodSize(layout);
    const a = layoutTiles({ ...base, camera: { x: 130, y: 70 } });
    const b = layoutTiles({
      ...base,
      camera: { x: 130 + period.width, y: 70 + period.height },
    });
    const pieceAt = (tiles: typeof a) =>
      tiles.map((t) => [t.x, t.y, t.piece.src, t.index].join("|")).sort();
    expect(pieceAt(b)).toEqual(pieceAt(a));
  });

  it("returns only tiles within the viewport plus the margin", () => {
    const tiles = layoutTiles({ ...base, camera: { x: 5000, y: -3000 } });
    expect(tiles.length).toBeGreaterThan(0);
    for (const t of tiles) {
      expect(t.x + t.width).toBeGreaterThan(-layout.margin);
      expect(t.x).toBeLessThan(viewport.width + layout.margin);
      expect(t.y + t.height).toBeGreaterThan(-layout.margin);
      expect(t.y).toBeLessThan(viewport.height + layout.margin);
    }
  });

  it("keeps a world cell's index and key as the camera moves", () => {
    const a = layoutTiles({ ...base, camera: origin });
    const b = layoutTiles({ ...base, camera: { x: 40, y: 25 } });
    const indexByKey = new Map(a.map((t) => [t.key, t.index]));
    const shared = b.filter((t) => indexByKey.has(t.key));
    expect(shared.length).toBeGreaterThan(0);
    for (const t of shared) expect(t.index).toBe(indexByKey.get(t.key));
  });

  it("zero-pads the index to two digits", () => {
    const tiles = layoutTiles({ ...base, camera: origin });
    for (const t of tiles) expect(t.label).toMatch(/^\d{2,}$/);
    expect(tiles.some((t) => t.index < 10 && t.label === `0${t.index}`)).toBe(
      true,
    );
  });

  it("roughly respects the fill ratio", () => {
    const period = periodSize(layout);
    const tiles = layoutTiles({
      ...base,
      camera: origin,
      viewport: { width: period.width, height: period.height },
    });
    const cells = new Set(tiles.map((t) => t.index)).size;
    const total = PERIOD_COLUMNS * PERIOD_ROWS;
    expect(cells / total).toBeGreaterThan(layout.fillRatio - 0.2);
    expect(cells / total).toBeLessThan(layout.fillRatio + 0.2);
  });

  it("offsets alternate columns by the stagger", () => {
    const tiles = layoutTiles({ ...base, camera: origin });
    const even = tiles.find((t) => t.column % 2 === 0)!;
    const odd = tiles.find((t) => t.column % 2 !== 0)!;
    const rowTop = (t: typeof even) =>
      t.worldY - t.row * (layout.tileHeight + layout.gap);
    expect(rowTop(odd) - rowTop(even)).toBe(layout.stagger);
  });

  it("returns nothing without pieces", () => {
    expect(layoutTiles({ ...base, pieces: [], camera: origin })).toEqual([]);
  });
});
