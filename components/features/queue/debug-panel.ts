// Third-party libraries
import type { Pane } from "tweakpane";

// Local modules
import { queueConfig, type QueueConfig } from "./config";
import { DEPTH_CURVES } from "./depth-curve";
import { OVERRIDES_KEY, mergeQueueConfig } from "./config-overrides";

type Range = { min: number; max: number; step: number };

/** Slider ranges for each numeric config value. */
const RANGES: Partial<Record<keyof QueueConfig, Range>> = {
  perspective: { min: 0.5, max: 12, step: 0.1 },
  spacing: { min: 0.1, max: 1.5, step: 0.01 },
  rotateY: { min: -90, max: 90, step: 1 },
  rotateFalloff: { min: -30, max: 30, step: 0.5 },
  depthStep: { min: 0, max: 1.5, step: 0.01 },
  scaleFalloff: { min: 0, max: 0.2, step: 0.005 },
  minScale: { min: 0.05, max: 1, step: 0.01 },
  fadeFalloff: { min: 0, max: 0.3, step: 0.005 },
  cardHeight: { min: 0.2, max: 0.9, step: 0.01 },
  angle: { min: 0, max: 45, step: 0.5 },
  driftSpeed: { min: 0, max: 2, step: 0.01 },
  friction: { min: 0.1, max: 10, step: 0.1 },
  resumeDelay: { min: 0, max: 5, step: 0.1 },
  resumeRate: { min: 0.2, max: 10, step: 0.1 },
};

/**
 * Adds a binding for every ranged value, then the direction and orientation controls.
 *
 * @param pane - The Tweakpane instance.
 * @param config - The live config the bindings edit.
 */
function addBindings(pane: Pane, config: QueueConfig) {
  for (const [key, range] of Object.entries(RANGES)) {
    pane.addBinding(config, key as keyof QueueConfig, range);
  }

  pane.addBinding(config, "depthCurve", {
    label: "depth curve",
    options: Object.fromEntries(DEPTH_CURVES.map((curve) => [curve, curve])),
  });
  pane.addBinding(config, "direction", {
    options: { "Far at top-right": 1, "Far at top-left": -1 },
  });
  pane.addBinding(config, "driftDirection", {
    options: { "Right to left": 1, "Left to right": -1 },
  });
  pane.addBinding(config, "honourOrientation", {
    label: "honour orientation",
  });
}

/**
 * Opens the Tweakpane tuning panel for the Queue, loading the library only
 * when called. Changes apply live and persist to localStorage; the code
 * defaults stay the source of truth.
 *
 * @param config - The live config the panel edits in place.
 * @param onChange - Called after a value changes, to re-read the config.
 * @returns A promise of a function that closes the panel.
 */
export async function openQueueDebugPanel(
  config: QueueConfig,
  onChange: () => void,
): Promise<() => void> {
  const { Pane } = await import("tweakpane");
  const pane = new Pane({ title: "Queue" });
  addBindings(pane, config);

  pane.on("change", () => {
    window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(config));
    onChange();
  });

  pane.addButton({ title: "Copy config" }).on("click", () => {
    void navigator.clipboard.writeText(JSON.stringify(config, null, 2));
  });
  pane.addButton({ title: "Reset" }).on("click", () => {
    window.localStorage.removeItem(OVERRIDES_KEY);
    Object.assign(config, mergeQueueConfig(queueConfig, null));
    pane.refresh();
    onChange();
  });

  return () => pane.dispose();
}
