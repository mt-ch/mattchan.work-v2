// Shared modules
import type { SiteLink } from "@/components/features/landing/sidebar-data";

// Local modules
import { IconButtonRow } from "./icon-button-row";
import { IdentityCard } from "./identity-card";

/**
 * Site chrome: a sidebar with the owner's identity and links, beside the main
 * content.
 *
 * @param props.children - The main content.
 * @param props.middle - Content centred vertically in the sidebar.
 * @param props.bottom - Content pinned to the sidebar's lower section.
 * @param props.identity - The owner's name and headline.
 * @param props.links - The icon links shown under the identity card.
 * @param props.fixed - Landing variant: exactly one viewport tall, no page scroll.
 * @returns The shell around `children`.
 */
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
  fixed?: boolean;
}) {
  return (
    <div
      className={`gap-sm px-sm mx-auto flex flex-col justify-between lg:grid lg:grid-cols-12 ${
        fixed ? "h-dvh overflow-hidden lg:grid-rows-1" : "min-h-screen"
      }`}
    >
      <aside className="gap-md py-sm relative col-span-12 flex h-full flex-col justify-between lg:sticky lg:order-2 lg:col-span-4 lg:shrink-0">
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
