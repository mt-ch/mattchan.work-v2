// Local modules
import { parseSeen } from "./seen";

/** localStorage key holding the keys of the pieces seen on this device. */
export const SEEN_KEY = "playground-seen";

/**
 * Reads the pieces seen on earlier visits. Client only.
 *
 * @param current - Keys of every piece that exists now.
 * @returns The stored keys that still exist; empty when storage is unreadable.
 */
export function loadSeen(current: Iterable<string>): Set<string> {
  try {
    return parseSeen(window.localStorage.getItem(SEEN_KEY), current);
  } catch {
    return new Set();
  }
}

/**
 * Remembers the pieces seen. Storage that is full or blocked is ignored.
 *
 * @param seen - Keys of the pieces seen so far.
 */
export function saveSeen(seen: ReadonlySet<string>) {
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    // Progress just won't carry over to the next visit
  }
}

/** Forgets every seen piece. */
export function clearSeen() {
  try {
    window.localStorage.removeItem(SEEN_KEY);
  } catch {
    // Nothing stored that we could clear
  }
}
