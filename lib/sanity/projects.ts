import { cacheLife, cacheTag } from "next/cache";

import { client } from "./client";
import {
  otherProjectsQuery,
  projectBySlugQuery,
  projectSlugsQuery,
  projectsQuery,
} from "./queries";
import { tags } from "./tags";

export async function getProjects() {
  "use cache";
  cacheLife("max");
  cacheTag(tags.projects);
  return client.fetch(projectsQuery);
}

export async function getProject(slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag(tags.projects, tags.project(slug));
  return client.fetch(projectBySlugQuery, { slug });
}

export async function getProjectSlugs() {
  "use cache";
  cacheLife("max");
  cacheTag(tags.projects);
  return client.fetch(projectSlugsQuery);
}

export async function getOtherProjects(currentId: string) {
  "use cache";
  cacheLife("max");
  cacheTag(tags.projects);
  return client.fetch(otherProjectsQuery, { currentId });
}
