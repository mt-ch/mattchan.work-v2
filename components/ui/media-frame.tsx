import Image from "next/image";
import type { ReactNode } from "react";

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

/** Cropped Sanity image with lqip blur; children overlay the image. */
export function MediaFrame({
  image,
  alt,
  ratio = "wide",
  children,
}: {
  image: MediaImage;
  alt: string;
  ratio?: MediaRatio;
  children?: ReactNode;
}) {
  const { width, height, className, sizes } = RATIOS[ratio];
  return (
    <div className={`relative ${className} overflow-hidden rounded-md`}>
      <Image
        src={urlFor(image as Parameters<typeof urlFor>[0])
          .width(width)
          .height(height)
          .fit("crop")
          .auto("format")
          .url()}
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
