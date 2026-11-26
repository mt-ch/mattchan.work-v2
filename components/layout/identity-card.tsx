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
    <section className="flex flex-col overflow-hidden rounded-sm bg-foreground">
      <div className="flex flex-col p-xs">
        <h1 className="type-mono-caption text-surface">{name}</h1>
        <p className="type-mono-caption whitespace-pre-line text-muted">
          {headline}
        </p>
      </div>
      <div className="flex flex-col border-t border-muted/30 p-xs">
        <p className="type-mono-caption whitespace-pre-line text-surface">
          Collaborations
        </p>
        <p className="type-mono-caption whitespace-pre-line text-surface underline">
          hello@mattchan.work
        </p>
      </div>
    </section>
  );
}
