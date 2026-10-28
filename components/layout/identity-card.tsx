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
    <section className="flex items-center justify-between gap-sm rounded-md bg-surface p-sm">
      <div className="shrink-0 space-y-0.5 font-mono text-mono-caption">
        <h1 className="type-small">{name}</h1>
        <p className="type-small whitespace-pre-line text-muted">{headline}</p>
      </div>
      <Avatar />
    </section>
  );
}
