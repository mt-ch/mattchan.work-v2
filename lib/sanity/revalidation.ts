// Local modules
import { tags } from "./tags";

/**
 * Webhook payload, set via the Sanity webhook projection:
 * `{_type, "slug": slug.current}`.
 */
export type RevalidationPayload = {
  _type?: string;
  slug?: string | null;
};

/**
 * Maps a changed document to the cache tags that must be invalidated.
 *
 * @param payload - The webhook payload for the changed document.
 * @param payload._type - The Sanity document type.
 * @param payload.slug - The document's slug, when it has one.
 * @returns The tags to revalidate; empty for types the site doesn't cache.
 */
export function tagsForDocument({ _type, slug }: RevalidationPayload) {
  switch (_type) {
    case "project":
      // The list and "other projects" depend on every Project, the page only on its own slug
      return slug ? [tags.projects, tags.project(slug)] : [tags.projects];
    case "about":
      return [tags.about];
    default:
      return [];
  }
}
