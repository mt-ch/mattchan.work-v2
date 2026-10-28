// React and Next.js
import { cacheLife, cacheTag } from "next/cache";

// Local modules
import { client } from "./client";
import { aboutQuery } from "./queries";
import { tags } from "./tags";

/**
 * Fetches the About singleton. Cached until the `about` tag is revalidated.
 *
 * @returns The About record, or null when none exists.
 */
export async function getAbout() {
  "use cache";
  cacheLife("max");
  cacheTag(tags.about);

  return client.fetch(aboutQuery);
}
