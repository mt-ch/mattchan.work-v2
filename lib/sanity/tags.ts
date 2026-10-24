// Cache tags for Sanity fetches. The revalidation webhook (#16) invalidates
// by these tags, so both sides import them from here.
export const tags = {
  projects: "projects",
  project: (slug: string) => `project:${slug}`,
  about: "about",
} as const;
