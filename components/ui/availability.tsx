/**
 * Availability badge: a dot, green when available, beside a status line.
 *
 * @param props.isAvailable - Whether the owner is currently available.
 * @param props.children - The status text.
 * @returns The badge.
 */
export function Availability({
  isAvailable,
  children,
}: {
  isAvailable: boolean;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-xs text-small text-foreground">
      <span
        aria-hidden
        data-available={isAvailable}
        className="size-2.5 rounded-full bg-muted data-[available=true]:bg-green-500"
      />
      {children}
    </p>
  );
}
