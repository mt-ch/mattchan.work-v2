export function Availability({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-xs font-mono text-mono-caption">
      <span aria-hidden className="size-2 rounded-full bg-green-500" />
      {children}
    </p>
  );
}
