// React and Next.js
import { cacheLife, cacheTag } from "next/cache";

// Local modules
import { client } from "./client";
import {
  otherProjectsQuery,
  projectBySlugQuery,
  projectsQuery,
} from "./queries";
import { tags } from "./tags";

/**
 * Fetches every Project in display order. Cached until the `projects` tag is
 * revalidated.
 *
 * @returns All Projects.
 */
export async function getProjects() {
  "use cache";
  cacheLife("max");
  cacheTag(tags.projects);

  return client.fetch(projectsQuery);
}

/**
 * Fetches one Project by slug. Cached until the `projects` tag or that
 * Project's own tag is revalidated.
 *
 * @param slug - The Project's slug.
 * @returns The Project, or null when no Project has that slug.
 */
export async function getProject(slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag(tags.projects, tags.project(slug));

  return client.fetch(projectBySlugQuery, { slug });
}

/**
 * Fetches the first two Projects other than the current one, for the "more
 * work" section. Cached until the `projects` tag is revalidated.
 *
 * @param currentId - Document ID of the Project being viewed.
 * @returns Up to two other Projects.
 */
export async function getOtherProjects(currentId: string) {
  "use cache";
  cacheLife("max");
  cacheTag(tags.projects);

  return client.fetch(otherProjectsQuery, { currentId });
}
