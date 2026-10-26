import type { SiteLink } from "@/components/layout/site-links";

import { IconButtonRow } from "./icon-button-row";
import { IdentityCard } from "./identity-card";

export function SiteShell({
  children,
  middle,
  bottom,
  identity,
  links,
  fixed = false,
}: {
  children: React.ReactNode;
  middle?: React.ReactNode;
  bottom?: React.ReactNode;
  identity: { name: string; headline: string };
  links: SiteLink[];
  /** Landing variant: exactly one viewport tall, no page scroll. */
  fixed?: boolean;
}) {
  return (
    <div
      className={`gap-sm px-sm mx-auto flex flex-col justify-between lg:grid lg:grid-cols-12 ${
        fixed ? "h-dvh overflow-hidden lg:grid-rows-1" : "min-h-screen"
      }`}
    >
      <aside
        className={`gap-md py-sm relative col-span-12 flex h-full flex-col justify-between lg:sticky lg:order-2 lg:col-span-4 lg:shrink-0 ${
          fixed ? "" : "lg:top-0 lg:h-dvh lg:self-start"
        }`}
      >
        <div className="gap-2xs flex flex-col">
          <IdentityCard {...identity} />
          <IconButtonRow links={links} />
        </div>
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2">
          {middle}
        </div>
        <div className="gap-sm my-auto flex flex-col lg:my-0">{bottom}</div>
      </aside>
      <main className="lg:gap-sm pb-sm lg:order-1 lg:col-span-8 lg:flex lg:flex-1 lg:flex-col lg:pb-0">
        {children}
      </main>
    </div>
  );
}
