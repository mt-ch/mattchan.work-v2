// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { toSiteLinks } from "./site-links";

describe("toSiteLinks", () => {
  it("builds email, GitHub, LinkedIn and résumé links in order", () => {
    const links = toSiteLinks({
      email: "a@b.co",
      githubUrl: "https://github.com/x",
      linkedinUrl: "https://linkedin.com/in/x",
      resumeUrl: "https://cdn/resume.pdf",
    });

    expect(links.map((l) => [l.label, l.href])).toEqual([
      ["Email", "mailto:a@b.co"],
      ["LinkedIn", "https://linkedin.com/in/x"],
      ["GitHub", "https://github.com/x"],
      ["Resume", "https://cdn/resume.pdf"],
    ]);
  });

  it("omits links that are not set", () => {
    expect(
      toSiteLinks({
        email: null,
        githubUrl: null,
        linkedinUrl: null,
        resumeUrl: null,
      }),
    ).toEqual([]);
  });
});
