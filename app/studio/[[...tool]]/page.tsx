"use client";

// Third-party libraries
import { NextStudio } from "next-sanity/studio";

// Shared modules
import config from "@/sanity.config";

/**
 * The embedded Sanity Studio, mounted on every path under `/studio`.
 *
 * @returns The Studio configured by `sanity.config.ts`.
 */
export default function StudioPage() {
  return <NextStudio config={config} />;
}
