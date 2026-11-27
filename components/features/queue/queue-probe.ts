/** How often, in ms, to re-check which card is under a resting pointer. */
const PROBE_INTERVAL = 100;

/**
 * Re-checks which card is under the pointer while it rests inside the Queue.
 * Browsers only report a new hover when the pointer moves, so without this a
 * card that slides under a still cursor would never be noticed.
 *
 * @param onCard - Called each check with the key of the card under the pointer, or null.
 * @returns Controls: `at` records the pointer position and starts checking, `stop` ends it.
 */
export function createCardProbe(onCard: (key: string | null) => void) {
  let point: { x: number; y: number } | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;

  // Ask the document what is under the last known pointer position
  const check = () => {
    if (!point) return;
    const hit = document.elementFromPoint(point.x, point.y);

    onCard(
      hit?.closest<HTMLElement>("a[data-card-key]")?.dataset.cardKey ?? null,
    );
  };

  return {
    at(x: number, y: number) {
      point = { x, y };
      timer ??= setInterval(check, PROBE_INTERVAL);
    },
    stop() {
      point = null;
      if (timer) clearInterval(timer);
      timer = null;
    },
  };
}
