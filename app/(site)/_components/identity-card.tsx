import { Avatar } from "./avatar";

export function IdentityCard() {
  return (
    <section className="flex items-center gap-md bg-surface p-md">
      <Avatar />
      <div className="font-mono text-caption">
        <h1 className="text-small">Matt Chan</h1>
        <p>Frontend Engineer</p>
        <p className="text-muted">Branding + Development + AI</p>
      </div>
    </section>
  );
}
