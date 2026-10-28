// React and Next.js
import Image from "next/image";
import type { ReactNode } from "react";

// Shared modules
import { urlFor } from "@/lib/sanity/image";

// Full-width media is 16:9; media sharing a 2-column row is 4:5.
const RATIOS = {
  wide: {
    width: 1200,
    height: 900,
    className: "aspect-3/2",
    sizes: "(min-width: 1024px) 66vw, 100vw",
  },
  portrait: {
    width: 800,
    height: 1000,
    className: "aspect-4/5",
    sizes: "(min-width: 1024px) 33vw, 50vw",
  },
  square: {
    width: 800,
    height: 800,
    className: "aspect-1/1",
    sizes: "(min-width: 1024px) 33vw, 50vw",
  },
} as const;

export type MediaRatio = keyof typeof RATIOS;

type MediaImage = {
  asset?: unknown;
  metadata?: { lqip: string | null } | null;
};

const FILL_WIDTH = 1200;

/**
 * Builds the cropped, auto-format CDN URL for a Sanity image.
 *
 * @param image - The Sanity image.
 * @param width - Crop width in px.
 * @param height - Crop height in px.
 * @returns The image URL, cropped around the hotspot.
 */
function buildImageUrl(image: MediaImage, width: number, height: number) {
  return urlFor(image as Parameters<typeof urlFor>[0])
    .width(width)
    .height(height)
    .fit("crop")
    .auto("format")
    .url();
}

/**
 * Works out the crop size, frame class and `sizes` hint for a frame. A preset
 * ratio brings its own; without one the frame fills its parent.
 *
 * @param ratio - Preset ratio, if the frame owns its aspect ratio.
 * @param aspect - Parent width / height, used when there is no preset.
 * @param sizesOverride - Replaces the preset's `sizes` hint when given.
 * @returns The crop width and height, the frame's class and the `sizes` hint.
 */
function resolveFrame(
  ratio: MediaRatio | undefined,
  aspect: number,
  sizesOverride: string | undefined,
) {
  const preset = ratio ? RATIOS[ratio] : null;

  return {
    width: preset?.width ?? FILL_WIDTH,
    height: preset?.height ?? Math.round(FILL_WIDTH / aspect),
    className: preset?.className ?? "h-full",
    sizes: sizesOverride ?? preset?.sizes ?? "(min-width: 1024px) 66vw, 100vw",
  };
}

/**
 * Cropped Sanity image with lqip blur; children overlay the image. With a
 * `ratio` it sets its own aspect ratio. Without one it fills its parent, which
 * owns the ratio; pass `aspect` (the parent's width / height) so the crop
 * follows the hotspot.
 *
 * @param props.image - The Sanity image, with its asset and optional lqip.
 * @param props.alt - Alt text for the image.
 * @param props.ratio - Preset ratio; omit to fill the parent.
 * @param props.aspect - Parent width / height, used when there is no `ratio`.
 * @param props.sizes - Overrides the preset's `sizes` hint.
 * @param props.className - Extra classes for the frame.
 * @param props.children - Content overlaid on the image.
 * @returns The framed image.
 */
export function MediaFrame({
  image,
  alt,
  ratio,
  aspect = 3 / 2,
  sizes: sizesOverride,
  className: extraClassName = "",
  children,
}: {
  image: MediaImage;
  alt: string;
  ratio?: MediaRatio;
  aspect?: number;
  sizes?: string;
  className?: string;
  children?: ReactNode;
}) {
  const { width, height, className, sizes } = resolveFrame(
    ratio,
    aspect,
    sizesOverride,
  );

  return (
    <div
      className={`relative ${className} ${extraClassName} overflow-hidden rounded-md`}
    >
      <Image
        src={buildImageUrl(image, width, height)}
        alt={alt}
        fill
        placeholder={image.metadata?.lqip ? "blur" : "empty"}
        blurDataURL={image.metadata?.lqip ?? undefined}
        sizes={sizes}
        className="object-cover"
      />
      {children}
    </div>
  );
}
