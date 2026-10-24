import { IconButtonRow } from "./icon-button-row";
import { IdentityCard } from "./identity-card";

export function SiteShell({
  children,
  middle,
  bottom,
}: {
  children: React.ReactNode;
  middle?: React.ReactNode;
  bottom?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col gap-grid-gap p-sm md:flex-row md:p-4">
      <aside className="flex flex-col gap-md md:sticky md:top-4 md:order-2 md:h-[calc(100vh-2rem)] md:w-[459px] md:shrink-0">
        <IdentityCard />
        <IconButtonRow />
        <div>{middle}</div>
        <div className="mt-auto flex flex-col gap-sm">{bottom}</div>
      </aside>
      <main className="flex flex-1 flex-col gap-grid-gap md:order-1">
        {children}
      </main>
    </div>
  );
}
