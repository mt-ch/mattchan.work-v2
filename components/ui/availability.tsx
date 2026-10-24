export function Availability({ children }: { children: React.ReactNode }) {
  return (
    <p className="gap-xs text-small text-foreground flex items-center">
      <span aria-hidden className="size-2.5 rounded-full bg-green-500" />
      {children}
    </p>
  );
}
