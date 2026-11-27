// Shared modules
import { Availability } from "@/components/ui/availability";
import type { AboutQueryResult } from "@/sanity.types";

// Local modules
import { LocalTime } from "./local-time";

/**
 * The Landing captions laid over the Queue: the owner's local time top-right
 * and their availability bottom-right.
 *
 * @param props.availability - The About availability, or null when unset.
 * @returns The two overlay captions.
 */
export function LandingOverlay({
  availability,
}: {
  availability?: NonNullable<AboutQueryResult>["availability"];
}) {
  return (
    <>
      <LocalTime className="type-mono-caption pointer-events-none relative z-10 col-span-2 col-start-11 text-right text-foreground mix-blend-difference" />

      {availability?.status ? (
        <div className="pointer-events-none relative z-10 col-span-6 col-start-7 row-start-2 self-end mix-blend-difference">
          <Availability isAvailable={availability.isAvailable ?? false}>
            {availability.status}
          </Availability>
        </div>
      ) : null}
    </>
  );
}
