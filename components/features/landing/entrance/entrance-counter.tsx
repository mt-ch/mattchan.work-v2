/**
 * The Entrance counter pill. The pre-hydration CSS shows it only while an
 * Entrance is pending on desktop, so it is invisible in every other case.
 *
 * @returns The pill, starting at 0.
 */
export function EntranceCounter() {
  return (
    <div
      data-entrance="counter"
      aria-hidden
      className="fixed top-0 left-0 z-50 rounded-full border border-border bg-surface px-sm py-2xs font-mono text-mono-small text-foreground tabular-nums"
    >
      0
    </div>
  );
}
