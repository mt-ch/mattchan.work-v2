import { cacheLife, cacheTag } from "next/cache";

import { client } from "./client";
import { aboutQuery } from "./queries";
import { tags } from "./tags";

export async function getAbout() {
  "use cache";
  cacheLife("max");
  cacheTag(tags.about);
  return client.fetch(aboutQuery);
}
