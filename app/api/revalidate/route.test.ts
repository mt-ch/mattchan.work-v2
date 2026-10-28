import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidateTag, parseBody } = vi.hoisted(() => ({
  revalidateTag: vi.fn(),
  parseBody: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidateTag }));
vi.mock("next-sanity/webhook", () => ({ parseBody }));

import { POST } from "./route";

const req = {} as NextRequest;

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("SANITY_REVALIDATE_SECRET", "shh");
  });

  it("rejects an invalid signature without revalidating", async () => {
    parseBody.mockResolvedValue({ isValidSignature: false, body: null });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("fails when the secret is not configured", async () => {
    vi.stubEnv("SANITY_REVALIDATE_SECRET", "");
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it("rejects a payload without _type", async () => {
    parseBody.mockResolvedValue({ isValidSignature: true, body: {} });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("revalidates the tags for a project", async () => {
    parseBody.mockResolvedValue({
      isValidSignature: true,
      body: { _type: "project", slug: "pertemps" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      revalidated: ["projects", "project:pertemps"],
    });
    expect(revalidateTag).toHaveBeenCalledWith("projects", "max");
    expect(revalidateTag).toHaveBeenCalledWith("project:pertemps", "max");
  });

  it("accepts unknown types without revalidating", async () => {
    parseBody.mockResolvedValue({
      isValidSignature: true,
      body: { _type: "other" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
