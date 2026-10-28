// Shared modules
import type { SiteLink } from "@/components/layout/site-links";

// Local modules
import { IconButtonRow } from "./icon-button-row";
import { IdentityCard } from "./identity-card";

/**
 * The shell's sidebar: identity card and links on top, `bottom` below.
 *
 * @param props.bottom - Content pinned to the sidebar's lower section.
 * @param props.identity - The owner's name and headline.
 * @param props.links - The icon links shown under the identity card.
 * @param props.fixed - Landing variant: the sidebar does not stick to the viewport.
 * @returns The sidebar.
 */
function ShellSidebar({
  bottom,
  identity,
  links,
  fixed,
}: {
  bottom?: React.ReactNode;
  identity: { name: string; headline: string };
  links: SiteLink[];
  fixed: boolean;
}) {
  return (
    <aside
      className={`relative col-span-12 flex h-full flex-col justify-between lg:sticky lg:order-2 lg:col-span-4 lg:shrink-0 lg:py-sm ${
        fixed ? "" : "lg:top-0 lg:h-dvh lg:self-start"
      }`}
    >
      <div className="flex flex-col gap-2xs">
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
      <div className="flex flex-col gap-sm">{bottom}</div>
    </aside>
  );
}

/**
 * Site chrome: a sidebar with the owner's identity and links, beside the main
 * content.
 *
 * @param props.children - The main content.
 * @param props.bottom - Content pinned to the sidebar's lower section.
 * @param props.identity - The owner's name and headline.
 * @param props.links - The icon links shown under the identity card.
 * @param props.fixed - Landing variant: exactly one viewport tall, no page scroll.
 * @returns The shell around `children`.
 */
export function SiteShell({
  children,
  bottom,
  identity,
  links,
  fixed = false,
}: {
  children: React.ReactNode;
  /**
   * Desktop only. Invisible content that sizes the centred middle slot, so
   * `middle` starts at that content's top edge instead of being centred itself.
   */
  middleSizer?: React.ReactNode;
  middle?: React.ReactNode;
  bottom?: React.ReactNode;
  identity: { name: string; headline: string };
  links: SiteLink[];
  fixed?: boolean;
}) {
  return (
    <div
      className={`flex flex-col justify-between p-sm lg:grid lg:grid-cols-12 lg:gap-sm ${
        fixed ? "h-dvh overflow-hidden lg:grid-rows-1" : "min-h-screen"
      }`}
    >
      <ShellSidebar
        bottom={bottom}
        identity={identity}
        links={links}
        fixed={fixed}
      />
      <main className="h-full lg:order-1 lg:col-span-8 lg:flex lg:flex-1 lg:flex-col lg:gap-sm lg:pb-0">
        {children}
      </main>
    </div>
  );
}
