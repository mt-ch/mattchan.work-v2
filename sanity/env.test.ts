// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { dataset, projectId } from "./env";

describe("sanity env", () => {
  it("reads the project and dataset from the environment", () => {
    expect(projectId).toBe(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
    expect(dataset).toBe(process.env.NEXT_PUBLIC_SANITY_DATASET);
  });
});
