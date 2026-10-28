// Shared modules
import type { AboutQueryResult } from "@/sanity.types";

// Local modules
import { IconButtonRow } from "./icon-button-row";
import { IdentityCard } from "./identity-card";
import { toSiteLinks } from "./site-links";

/**
 * The sidebar's identity block: the owner's card with their icon links below.
 *
 * @param props.about - The About record, or null when none exists yet.
 * @returns The identity card and link row.
 */
export function AboutIdentity({ about }: { about: AboutQueryResult }) {
  return (
    <div className="flex flex-col gap-2xs">
      <IdentityCard name={about?.name ?? ""} headline={about?.headline ?? ""} />
      <IconButtonRow
        links={toSiteLinks({
          email: about?.email ?? null,
          githubUrl: about?.githubUrl ?? null,
          linkedinUrl: about?.linkedinUrl ?? null,
          resumeUrl: about?.resumeUrl ?? null,
        })}
      />
    </div>
  );
}
