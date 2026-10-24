export function Availability({ children }: { children: React.ReactNode }) {
  return (
    <p className="gap-xs text-mono-caption flex items-center font-mono">
      <span aria-hidden className="size-2 rounded-full bg-green-500" />
      {children}
    </p>
  );
}
