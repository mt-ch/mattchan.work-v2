// Local modules
import { queueConfig, type QueueConfig } from "./config";

/** localStorage key holding the debug panel's overrides. */
export const OVERRIDES_KEY = "queue-config";

/**
 * Copies saved values over the defaults, keeping only keys the defaults have
 * and values of the same type, so stale or hand-edited storage cannot break
 * the config.
 *
 * @param defaults - The code defaults.
 * @param overrides - Untrusted saved values.
 * @returns A new config shaped like `defaults`.
 */
export function mergeQueueConfig(
  defaults: QueueConfig,
  overrides: unknown,
): QueueConfig {
  const saved = (overrides ?? {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(defaults)) {
    out[key] = typeof saved[key] === typeof value ? saved[key] : value;
  }

  return out as QueueConfig;
}

/**
 * Reads the saved overrides from localStorage.
 *
 * @returns The config with overrides applied, or the defaults when none are saved or readable.
 */
export function loadQueueOverrides(): QueueConfig {
  try {
    const saved = window.localStorage.getItem(OVERRIDES_KEY);

    return mergeQueueConfig(queueConfig, saved ? JSON.parse(saved) : null);
  } catch {
    return mergeQueueConfig(queueConfig, null);
  }
}
