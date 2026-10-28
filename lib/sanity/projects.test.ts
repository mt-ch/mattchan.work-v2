// Third-party libraries
import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetch } = vi.hoisted(() => ({ fetch: vi.fn() }));

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));
vi.mock("./client", () => ({ client: { fetch } }));

// Local modules
import { getOtherProjects, getProject, getProjects } from "./projects";

beforeEach(() => fetch.mockReset());

describe("getProjects", () => {
  it("returns the projects the CMS returns", async () => {
    const rows = [{ _id: "p1", title: "Pertemps" }];
    fetch.mockResolvedValue(rows);

    await expect(getProjects()).resolves.toEqual(rows);
  });
});

describe("getProject", () => {
  it("fetches the project for the given slug", async () => {
    const detail = { _id: "p1", title: "Pertemps" };
    fetch.mockImplementation(async (_query, params) =>
      params?.slug === "pertemps" ? detail : null,
    );

    await expect(getProject("pertemps")).resolves.toEqual(detail);
    await expect(getProject("missing")).resolves.toBeNull();
  });
});

describe("getOtherProjects", () => {
  it("excludes the current project", async () => {
    fetch.mockResolvedValue([]);

    await getOtherProjects("p1");

    expect(fetch).toHaveBeenCalledWith(expect.anything(), { currentId: "p1" });
  });
});
