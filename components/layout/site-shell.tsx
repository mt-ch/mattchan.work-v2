import type { SiteLink } from "@/components/layout/site-links";

import { IconButtonRow } from "./icon-button-row";
import { IdentityCard } from "./identity-card";

export function SiteShell({
  children,
  middle,
  middleSizer,
  bottom,
  identity,
  links,
  fixed = false,
}: {
  children: React.ReactNode;
  middle?: React.ReactNode;
  /**
   * Desktop only. Invisible content that sizes the centred middle slot, so
   * `middle` starts at that content's top edge instead of being centred itself.
   */
  middleSizer?: React.ReactNode;
  bottom?: React.ReactNode;
  identity: { name: string; headline: string };
  links: SiteLink[];
  /** Landing variant: exactly one viewport tall, no page scroll. */
  fixed?: boolean;
}) {
  return (
    <div
      className={`lg:gap-sm p-sm flex flex-col justify-between lg:grid lg:grid-cols-12 ${
        fixed ? "h-dvh overflow-hidden lg:grid-rows-1" : "min-h-screen"
      }`}
    >
      <aside
        className={`lg:py-sm relative col-span-12 flex h-full flex-col justify-between lg:sticky lg:order-2 lg:col-span-4 lg:shrink-0 ${
          fixed ? "" : "lg:top-0 lg:h-dvh lg:self-start"
        }`}
      >
        <div className="gap-2xs flex flex-col">
          <IdentityCard {...identity} />
          <IconButtonRow links={links} />
        </div>
        {/* {middle ? (
          <div className="lg:absolute lg:top-1/2 lg:left-0 lg:w-full lg:-translate-y-1/2">
            {middleSizer ? (
              <>
                <div aria-hidden inert className="invisible hidden lg:block">
                  {middleSizer}
                </div>
                <div className="lg:absolute lg:inset-x-0 lg:top-0">
                  {middle}
                </div>
              </>
            ) : (
              middle
            )}
          </div>
        ) : null} */}
        <div className="gap-sm flex flex-col">{bottom}</div>
      </aside>
      <main className="lg:gap-sm h-full lg:order-1 lg:col-span-8 lg:flex lg:flex-1 lg:flex-col lg:pb-0">
        {children}
      </main>
    </div>
  );
}
