export function Availability({
  isAvailable,
  children,
}: {
  isAvailable: boolean;
  children: React.ReactNode;
}) {
  return (
    <p className="gap-xs text-small text-foreground flex items-center">
      <span
        aria-hidden
        data-available={isAvailable}
        className="bg-muted size-2.5 rounded-full data-[available=true]:bg-green-500"
      />
      {children}
    </p>
  );
}
