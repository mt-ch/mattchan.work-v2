import { describe, expect, it } from "vitest";

import { bioToText, toProjectListItems } from "./sidebar-data";

describe("toProjectListItems", () => {
  it("maps projects in order, deriving year from dateCompleted", () => {
    const items = toProjectListItems([
      {
        title: "A",
        slug: { current: "a" },
        discipline: ["Design", "AI"],
        dateCompleted: "2024-05-01",
      },
      {
        title: "B",
        slug: { current: "b" },
        discipline: null,
        dateCompleted: null,
      },
    ]);

    expect(items).toEqual([
      { slug: "a", name: "A", year: 2024, discipline: ["Design", "AI"] },
      { slug: "b", name: "B", year: undefined, discipline: [] },
    ]);
  });

  it("drops projects without a title or slug", () => {
    expect(
      toProjectListItems([
        {
          title: null,
          slug: { current: "x" },
          discipline: [],
          dateCompleted: null,
        },
        { title: "Y", slug: null, discipline: [], dateCompleted: null },
      ]),
    ).toEqual([]);
  });
});

describe("bioToText", () => {
  it("joins block text into paragraphs", () => {
    expect(
      bioToText([
        { children: [{ text: "Hello " }, { text: "world" }] },
        { children: [{ text: "Second" }] },
      ]),
    ).toBe("Hello world\n\nSecond");
    expect(bioToText(null)).toBe("");
  });
});
