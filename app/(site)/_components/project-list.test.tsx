import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ProjectList } from "./project-list";

const projects = [
  {
    slug: "pertemps",
    name: "Pertemps",
    year: 2024,
    discipline: ["Development"],
  },
  {
    slug: "the-home-hospital",
    name: "The Home Hospital",
    year: 2026,
    discipline: ["Branding", "Development"],
  },
];

describe("ProjectList", () => {
  it("shows each project's name, year and discipline as a link to its Work page", () => {
    render(<ProjectList projects={projects} />);

    const link = screen.getByRole("link", { name: /The Home Hospital/ });
    expect(link).toHaveAttribute("href", "/work/the-home-hospital");
    expect(link).toHaveTextContent("2026");
    expect(link).toHaveTextContent("Branding + Development");
  });

  it("marks only the active project as the current item", () => {
    render(<ProjectList projects={projects} activeSlug="pertemps" />);

    expect(screen.getByRole("link", { name: /Pertemps/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: /The Home Hospital/ }),
    ).not.toHaveAttribute("aria-current");
  });
});
