/** Every tunable value of the Playground. The code defaults are the source of truth. */
export type PlaygroundConfig = {
  layout: {
    tileWidth: number;
    tileHeight: number;
    gap: number;
    /** Vertical offset of every other column, in px. */
    stagger: number;
    /** Share of world cells that hold a tile, 0 to 1. */
    fillRatio: number;
    /** Extra px around the viewport in which tiles are still rendered. */
    margin: number;
    labelSize: number;
    dotSpacing: number;
    dotOpacity: number;
  };
  input: {
    /** Multiplies drag velocity handed to inertia. */
    dragSpeed: number;
    /** How fast inertia dies, per second; higher stops sooner. */
    friction: number;
    wheelSpeed: number;
    /** Velocity impulse per arrow key press, in px/s. */
    keySpeed: number;
  };
  nudge: {
    enabled: boolean;
    /** Edge zone as a fraction of the viewport, 0 to 0.5. */
    zone: number;
    /** Largest nudge offset in px. */
    max: number;
    /** How quickly the nudge follows its target, per second. */
    ease: number;
  };
  effects: {
    scaleEnabled: boolean;
    /** Canvas scale at full speed. */
    scaleAmount: number;
    skewEnabled: boolean;
    /** Skew in degrees at full speed. */
    skewAmount: number;
    parallaxEnabled: boolean;
    /** Per-column shift in px at full speed. */
    parallaxAmount: number;
  };
  drift: {
    enabled: boolean;
    /** Drift speed in px/s. */
    speed: number;
    /** Idle time before drifting starts, in seconds. */
    delay: number;
  };
  video: {
    maxConcurrent: number;
  };
  seed: number;
};

// export const playgroundConfig: PlaygroundConfig = {
//   layout: {
//     tileWidth: 240,
//     tileHeight: 300,
//     gap: 120,
//     stagger: 160,
//     fillRatio: 0.7,
//     margin: 200,
//     labelSize: 11,
//     dotSpacing: 40,
//     dotOpacity: 0.18,
//   },
//   input: { dragSpeed: 1, friction: 3.5, wheelSpeed: 1, keySpeed: 1400 },
//   nudge: { enabled: true, zone: 0.1, max: 80, ease: 6 },
//   effects: {
//     scaleEnabled: true,
//     scaleAmount: 0.95,
//     skewEnabled: true,
//     skewAmount: 6,
//     parallaxEnabled: false,
//     parallaxAmount: 40,
//   },
//   drift: { enabled: false, speed: 12, delay: 4 },
//   video: { maxConcurrent: 3 },
//   seed: 1,
// };

export const playgroundConfig: PlaygroundConfig = {
  layout: {
    tileWidth: 240,
    tileHeight: 300,
    gap: 187,
    stagger: 160,
    fillRatio: 0.9999999999999999,
    margin: 800,
    labelSize: 12,
    dotSpacing: 99,
    dotOpacity: 0.18,
  },
  input: {
    dragSpeed: 1.4500000000000002,
    friction: 7.1,
    wheelSpeed: 1,
    keySpeed: 1400,
  },
  nudge: {
    enabled: true,
    zone: 0.1,
    max: 80,
    ease: 6,
  },
  effects: {
    scaleEnabled: true,
    scaleAmount: 0.94,
    skewEnabled: true,
    skewAmount: 0.5,
    parallaxEnabled: false,
    parallaxAmount: 40,
  },
  drift: {
    enabled: false,
    speed: 120,
    delay: 0,
  },
  video: {
    maxConcurrent: 3,
  },
  seed: 1739,
};

/** localStorage key holding the debug panel's overrides. */
export const OVERRIDES_KEY = "playground-config";

type Json = Record<string, unknown>;

/**
 * Copies `overrides` onto `base`, keeping only keys `base` has and values of
 * the same type, so stale or hand-edited storage cannot break the config.
 *
 * @param base - The defaults.
 * @param overrides - Untrusted saved values.
 * @returns A new object shaped like `base`.
 */
function mergeInto<T extends Json>(base: T, overrides: unknown): T {
  const source = (overrides ?? {}) as Json;
  const out: Json = {};

  for (const [key, value] of Object.entries(base)) {
    const saved = source[key];
    if (value && typeof value === "object") {
      out[key] = mergeInto(value as Json, saved);
    } else {
      out[key] = typeof saved === typeof value ? saved : value;
    }
  }

  return out as T;
}

/**
 * Merges saved overrides over the defaults.
 *
 * @param defaults - The code defaults.
 * @param overrides - Saved values, typically parsed from localStorage.
 * @returns A fresh config; the defaults are never mutated.
 */
export function mergeConfig(
  defaults: PlaygroundConfig,
  overrides: unknown,
): PlaygroundConfig {
  return mergeInto(defaults as unknown as Json, overrides) as PlaygroundConfig;
}

/**
 * Builds the effective config: the defaults, plus localStorage overrides only
 * when `?debug` is in the URL.
 *
 * @returns A fresh, mutable config for this page view.
 */
export function resolveConfig(): PlaygroundConfig {
  const debug = new URLSearchParams(window.location.search).has("debug");
  if (!debug) return mergeConfig(playgroundConfig, null);

  try {
    const saved = window.localStorage.getItem(OVERRIDES_KEY);

    return mergeConfig(playgroundConfig, saved ? JSON.parse(saved) : null);
  } catch {
    return mergeConfig(playgroundConfig, null);
  }
}

/**
 * Copies every value of `source` onto `target` in place, so holders of
 * `target` see the change.
 *
 * @param target - The live config.
 * @param source - Values to copy over it.
 */
export function assignConfig(
  target: PlaygroundConfig,
  source: PlaygroundConfig,
) {
  const copy = (to: Json, from: Json) => {
    for (const [key, value] of Object.entries(from)) {
      if (value && typeof value === "object")
        copy(to[key] as Json, value as Json);
      else to[key] = value;
    }
  };
  copy(target as unknown as Json, source as unknown as Json);
}
