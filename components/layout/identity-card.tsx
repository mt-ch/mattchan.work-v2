import { Avatar } from "./avatar";

export function IdentityCard({
  name,
  headline,
}: {
  name: string;
  headline: string;
}) {
  return (
    <section className="gap-sm bg-surface p-sm flex items-center justify-between rounded-md">
      <div className="text-mono-caption shrink-0 space-y-0.5 font-mono">
        <h1 className="type-small">{name}</h1>
        <p className="type-small text-muted whitespace-pre-line">{headline}</p>
      </div>
      <Avatar />
    </section>
  );
}
