// Third-party libraries
import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetch } = vi.hoisted(() => ({ fetch: vi.fn() }));

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));
vi.mock("./client", () => ({ client: { fetch } }));

// Local modules
import { getAbout } from "./about";

beforeEach(() => fetch.mockReset());

describe("getAbout", () => {
  it("returns the About singleton, or null when none exists", async () => {
    const about = { _id: "about", name: "Matt Chan" };
    fetch.mockResolvedValueOnce(about).mockResolvedValueOnce(null);

    await expect(getAbout()).resolves.toEqual(about);
    await expect(getAbout()).resolves.toBeNull();
  });
});
