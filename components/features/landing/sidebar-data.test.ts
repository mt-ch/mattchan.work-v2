import { describe, expect, it } from "vitest";

import { bioToText, toProjectListItems, toSiteLinks } from "./sidebar-data";

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

describe("toSiteLinks", () => {
  it("builds email, social and résumé links, skipping missing ones", () => {
    const links = toSiteLinks({
      email: "a@b.co",
      socialLinks: [
        { platform: "LinkedIn", url: "https://linkedin.com/in/x" },
        { platform: "GitHub", url: "https://github.com/x" },
        { platform: "Nothing" },
      ],
      resumeUrl: "https://cdn/resume.pdf",
    });

    expect(links.map((l) => [l.label, l.href])).toEqual([
      ["Email", "mailto:a@b.co"],
      ["LinkedIn", "https://linkedin.com/in/x"],
      ["GitHub", "https://github.com/x"],
      ["Resume", "https://cdn/resume.pdf"],
    ]);
  });

  it("omits email and résumé when absent", () => {
    expect(
      toSiteLinks({ email: null, socialLinks: null, resumeUrl: null }),
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
