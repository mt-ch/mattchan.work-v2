import { Avatar } from "./avatar";

export function IdentityCard() {
  return (
    <section className="gap-sm bg-surface p-sm flex items-center justify-between rounded-md">
      <div className="text-mono-caption shrink-0 space-y-0.5 font-mono">
        <h1 className="type-small">Matt Chan</h1>
        <p className="type-small text-muted">Frontend Engineer</p>
        <p className="type-small text-muted">Branding + Development + AI</p>
      </div>
      <Avatar />
    </section>
  );
}
