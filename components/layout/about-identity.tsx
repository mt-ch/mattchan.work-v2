// Shared modules
import type { AboutQueryResult } from "@/sanity.types";

// Local modules
import { IdentityCard } from "./identity-card";

/**
 * The sidebar's identity block: the owner's card.
 *
 * @param props.about - The About record, or null when none exists yet.
 * @returns The identity card.
 */
export function AboutIdentity({ about }: { about: AboutQueryResult }) {
  return (
    <IdentityCard
      name={about?.name ?? ""}
      headline={about?.headline ?? ""}
      email={about?.email ?? ""}
    />
  );
}
