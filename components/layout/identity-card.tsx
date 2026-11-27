/**
 * Card naming the site owner, with their headline and contact email.
 *
 * @param props.name - The owner's name.
 * @param props.headline - One or two lines describing what they do.
 * @param props.email - Contact address, shown as a mailto link; the row is hidden when empty.
 * @returns The identity card.
 */
export function IdentityCard({
  name,
  headline,
  email,
}: {
  name: string;
  headline: string;
  email: string;
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-sm bg-foreground">
      <div className="flex flex-col p-xs">
        <h1 className="type-mono-caption text-surface">{name}</h1>
        <p className="type-mono-caption whitespace-pre-line text-muted">
          {headline}
        </p>
      </div>
      {email ? (
        <div className="flex flex-col border-t border-muted/30 p-xs">
          <p className="type-mono-caption text-surface">Collaborations</p>
          <a
            href={`mailto:${email}`}
            className="type-mono-caption pointer-events-auto text-surface underline"
          >
            {email}
          </a>
        </div>
      ) : null}
    </section>
  );
}
