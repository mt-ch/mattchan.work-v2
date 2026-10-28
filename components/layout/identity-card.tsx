// Local modules
import { Avatar } from "./avatar";

/**
 * Card naming the site owner, with their headline and avatar.
 *
 * @param props.name - The owner's name.
 * @param props.headline - One or two lines describing what they do.
 * @returns The identity card.
 */
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
