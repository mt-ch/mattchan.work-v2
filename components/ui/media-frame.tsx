import Image from "next/image";
import type { ReactNode } from "react";

import { urlFor } from "@/lib/sanity/image";

const MEDIA_WIDTH = 1600;
const MEDIA_HEIGHT = 1067;

type MediaImage = {
  asset?: unknown;
  metadata?: { lqip: string | null } | null;
};

/** 3:2 cropped Sanity image with lqip blur; children overlay the image. */
export function MediaFrame({
  image,
  alt,
  children,
}: {
  image: MediaImage;
  alt: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative aspect-3/2 overflow-hidden rounded-md">
      <Image
        src={urlFor(image as Parameters<typeof urlFor>[0])
          .width(MEDIA_WIDTH)
          .height(MEDIA_HEIGHT)
          .fit("crop")
          .auto("format")
          .url()}
        alt={alt}
        fill
        placeholder={image.metadata?.lqip ? "blur" : "empty"}
        blurDataURL={image.metadata?.lqip ?? undefined}
        sizes="(min-width: 1024px) 66vw, 100vw"
        className="object-cover"
      />
      {children}
    </div>
  );
}
