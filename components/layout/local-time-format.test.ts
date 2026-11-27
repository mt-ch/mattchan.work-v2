// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { formatLocalTime } from "./local-time-format";

describe("formatLocalTime", () => {
  it("uses GMT in winter", () => {
    const winter = new Date("2026-01-15T14:55:35Z");

    expect(formatLocalTime(winter)).toBe("14:55:35 GMT London");
  });

  it("switches to the BST abbreviation and offset in summer", () => {
    const summer = new Date("2026-07-15T13:55:35Z");

    expect(formatLocalTime(summer)).toBe("14:55:35 BST London");
  });

  it("formats in another timezone with its own city label", () => {
    const moment = new Date("2026-01-15T14:55:35Z");

    expect(formatLocalTime(moment, "Asia/Tokyo", "Tokyo")).toMatch(
      /^23:55:35 .+ Tokyo$/,
    );
  });
});
