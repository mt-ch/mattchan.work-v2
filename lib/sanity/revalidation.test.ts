import { describe, expect, it } from "vitest";

import { tagsForDocument } from "./revalidation";

describe("tagsForDocument", () => {
  it("invalidates the list and the project page for a project", () => {
    expect(tagsForDocument({ _type: "project", slug: "pertemps" })).toEqual([
      "projects",
      "project:pertemps",
    ]);
  });

  it("still invalidates the list when a project has no slug", () => {
    expect(tagsForDocument({ _type: "project" })).toEqual(["projects"]);
  });

  it("invalidates about", () => {
    expect(tagsForDocument({ _type: "about" })).toEqual(["about"]);
  });

  it("ignores other document types", () => {
    expect(tagsForDocument({ _type: "sanity.imageAsset" })).toEqual([]);
  });
});
