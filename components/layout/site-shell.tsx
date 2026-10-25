import type { SiteLink } from "@/components/features/landing/sidebar-data";

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
      className={`gap-grid-gap p-xs mx-auto grid grid-cols-12 ${
        fixed
          ? "h-dvh grid-rows-[auto_minmax(0,1fr)] overflow-hidden lg:grid-rows-1"
          : "min-h-screen"
      }`}
    >
      <aside className="gap-md relative col-span-12 flex flex-col justify-between lg:sticky lg:order-2 lg:col-span-4 lg:shrink-0">
        <div className="gap-2xs flex flex-col">
          <IdentityCard {...identity} />
          <IconButtonRow links={links} />
        </div>
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2">
          {middle}
        </div>
        <div className="gap-sm flex flex-col">{bottom}</div>
      </aside>
      <main className="gap-grid-gap col-span-12 flex flex-1 flex-col lg:order-1 lg:col-span-8">
        {children}
      </main>
    </div>
  );
}
