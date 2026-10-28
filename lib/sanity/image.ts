// Third-party libraries
import createImageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";

// Shared modules
import { dataset, projectId } from "@/sanity/env";

const builder = createImageUrlBuilder({ projectId, dataset });

/**
 * Starts an image URL builder for a Sanity image.
 *
 * @param source - The Sanity image, with its asset reference and hotspot.
 * @returns A builder to chain width, height, fit and format onto.
 */
export function urlFor(source: Image) {
  return builder.image(source);
}
