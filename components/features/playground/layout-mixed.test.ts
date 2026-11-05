// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { playgroundConfig } from "./config";
import { PERIOD_COLUMNS, PERIOD_ROWS, layoutTiles } from "./layout";
import type { Piece } from "./playground-data";

const mixed = { ...playgroundConfig.layout, mode: "mixed" as const };
const viewport = { width: 1280, height: 800 };
const origin = { x: 0, y: 0 };

const pieces: Piece[] = Array.from({ length: 40 }, (_, i) => ({
  slug: `project-${i % 10}`,
  title: `Project ${i % 10}`,
  orientation: i % 4 === 1 ? "landscape" : "portrait",
  src: `https://cdn.example/${i}.jpg`,
}));

const base = { pieces, layout: mixed, seed: 1, viewport };
const signature = (tiles: ReturnType<typeof layoutTiles>) =>
  tiles.map((t) => `${t.key}=${t.piece.src}`).sort();

const portraitWidth = 240;
const landscapeWidth = 450;
const rowsOf = (tiles: ReturnType<typeof layoutTiles>) => {
  const rows = new Map<number, typeof tiles>();
  for (const t of tiles) rows.set(t.row, [...(rows.get(t.row) ?? []), t]);
  for (const row of rows.values()) row.sort((a, b) => a.worldX - b.worldX);

  return rows;
};

describe("layoutTiles in mixed mode", () => {
  it("sizes tiles by orientation at a constant height", () => {
    const tiles = layoutTiles({ ...base, camera: origin });
    expect(tiles.some((t) => t.piece.orientation === "landscape")).toBe(true);
    for (const t of tiles) {
      expect(t.height).toBe(mixed.tileHeight);
      expect(t.width).toBe(
        t.piece.orientation === "landscape" ? landscapeWidth : portraitWidth,
      );
    }
  });

  it("follows tileHeight for both widths", () => {
    const tiles = layoutTiles({
      ...base,
      layout: { ...mixed, tileHeight: 200 },
      camera: origin,
    });
    for (const t of tiles) {
      expect(t.height).toBe(200);
      expect(t.width).toBe(t.piece.orientation === "landscape" ? 300 : 160);
    }
  });

  it("keeps tiles in a row one gap apart, or a whole empty slot", () => {
    const tiles = layoutTiles({
      ...base,
      layout: { ...mixed, fillRatio: 1 },
      camera: origin,
    });
    for (const row of rowsOf(tiles).values()) {
      for (let i = 1; i < row.length; i++) {
        const [a, b] = [row[i - 1], row[i]];
        expect(b.worldX - (a.worldX + a.width)).toBe(mixed.gap);
      }
    }
  });

  it("puts rows exactly height + gap apart", () => {
    const tiles = layoutTiles({ ...base, camera: origin });
    for (const t of tiles) {
      expect(t.worldY).toBe(t.row * (mixed.tileHeight + mixed.gap));
    }
  });

  it("offsets odd rows sideways by the stagger", () => {
    const rows = rowsOf(
      layoutTiles({
        ...base,
        layout: { ...mixed, fillRatio: 1 },
        camera: origin,
      }),
    );
    // With every slot filled, the first tile of repeat 0 sits at the row offset
    const start = (row: number) =>
      rows.get(row)!.find((t) => t.column === 0)!.worldX;
    expect(start(0)).toBe(0);
    expect(start(1)).toBe(mixed.stagger);
    expect(start(2)).toBe(0);
  });

  it("repeats each row at its own length", () => {
    const tiles = layoutTiles({
      ...base,
      layout: { ...mixed, fillRatio: 1 },
      camera: origin,
    });
    for (const row of rowsOf(tiles).values()) {
      const length = row[0].piece.orientation && lengthOf(row);
      for (const t of row) {
        const next = row.find((o) => o.column === t.column + PERIOD_COLUMNS);
        if (next) expect(next.worldX - t.worldX).toBe(length);
      }
    }
  });

  it("repeats the arrangement after PERIOD_ROWS rows", () => {
    const step = PERIOD_ROWS * (mixed.tileHeight + mixed.gap);
    const a = layoutTiles({ ...base, camera: { x: 130, y: 70 } });
    const b = layoutTiles({ ...base, camera: { x: 130, y: 70 + step } });
    const shape = (tiles: typeof a) =>
      tiles.map((t) => [t.x, t.y, t.piece.src, t.index].join("|")).sort();
    expect(shape(b)).toEqual(shape(a));
  });

  it("gives empty slots a portrait width", () => {
    // With portraits only, a row is as long as twelve portrait slots, empty or not
    const pieces = base.pieces.filter((p) => p.orientation === "portrait");
    const tiles = layoutTiles({
      ...base,
      pieces,
      layout: { ...mixed, fillRatio: 0.5 },
      camera: origin,
      viewport: { width: 12000, height: 800 },
    });
    const row = rowsOf(tiles).get(0)!;

    expect(lengthOf(row)).toBe(PERIOD_COLUMNS * (portraitWidth + mixed.gap));
  });

  it("keeps neighbours from sharing a Project", () => {
    const tiles = layoutTiles({
      ...base,
      layout: { ...mixed, fillRatio: 1 },
      camera: origin,
      viewport: { width: 9000, height: 3000 },
    }).filter((t) => t.column >= 0 && t.column < PERIOD_COLUMNS);
    const rows = rowsOf(tiles);

    for (const [index, row] of rows) {
      const above = rows.get(index - 1) ?? [];
      for (let i = 0; i < row.length; i++) {
        const t = row[i];
        const beside = row[i + 1] ? [row[i + 1]] : [];
        const overlap = above.filter(
          (o) => o.worldX < t.worldX + t.width && o.worldX + o.width > t.worldX,
        );
        for (const other of [...beside, ...overlap]) {
          expect(other.piece.slug).not.toBe(t.piece.slug);
        }
      }
    }
  });

  it("avoids back-to-back landscapes when the mix allows it", () => {
    const tiles = layoutTiles({
      ...base,
      layout: { ...mixed, fillRatio: 1 },
      camera: origin,
      viewport: { width: 9000, height: 3000 },
    }).filter((t) => t.column >= 0 && t.column < PERIOD_COLUMNS);

    for (const row of rowsOf(tiles).values()) {
      for (let i = 1; i < row.length; i++) {
        const both = [row[i - 1], row[i]].every(
          (t) => t.piece.orientation === "landscape",
        );
        expect(both).toBe(false);
      }
    }
  });

  it("counts indices row by row", () => {
    const tiles = layoutTiles({
      ...base,
      camera: origin,
      viewport: { width: 9000, height: 3000 },
    }).filter((t) => t.column >= 0 && t.column < PERIOD_COLUMNS && t.row >= 0);
    const ordered = [...tiles].sort(
      (a, b) => a.row - b.row || a.column - b.column,
    );
    const firstRows = ordered.filter((t) => t.row < PERIOD_ROWS);
    firstRows.forEach((t, i) => expect(t.index).toBe(i + 1));
  });

  it("is deterministic, seed-sensitive and keeps keys stable", () => {
    const a = layoutTiles({ ...base, camera: origin });
    expect(layoutTiles({ ...base, camera: origin })).toEqual(a);
    expect(
      signature(layoutTiles({ ...base, seed: 2, camera: origin })),
    ).not.toEqual(signature(a));

    const b = layoutTiles({ ...base, camera: { x: 40, y: 25 } });
    const indexByKey = new Map(a.map((t) => [t.key, t.index]));
    const shared = b.filter((t) => indexByKey.has(t.key));
    expect(shared.length).toBeGreaterThan(0);
    for (const t of shared) expect(t.index).toBe(indexByKey.get(t.key));
  });

  it("returns only tiles near the viewport and nothing without pieces", () => {
    const tiles = layoutTiles({ ...base, camera: { x: 5000, y: -3000 } });
    expect(tiles.length).toBeGreaterThan(0);
    for (const t of tiles) {
      expect(t.x + t.width).toBeGreaterThan(-mixed.margin);
      expect(t.x).toBeLessThan(viewport.width + mixed.margin);
      expect(t.y + t.height).toBeGreaterThan(-mixed.margin);
      expect(t.y).toBeLessThan(viewport.height + mixed.margin);
    }
    expect(layoutTiles({ ...base, pieces: [], camera: origin })).toEqual(
      [],
    );
  });

  it("zero-pads the index to two digits", () => {
    const tiles = layoutTiles({ ...base, camera: origin });
    for (const t of tiles) expect(t.label).toMatch(/^\d{2,}$/);
  });
});

/**
 * Length of a row, read from two tiles one repeat apart.
 *
 * @param row - Tiles of one row, sorted along it.
 * @returns The distance after which the row repeats, or 0 when unknown.
 */
function lengthOf(row: ReturnType<typeof layoutTiles>): number {
  for (const t of row) {
    const next = row.find((o) => o.column === t.column + PERIOD_COLUMNS);
    if (next) return next.worldX - t.worldX;
  }

  return 0;
}
