// Third-party libraries
import { gsap } from "gsap";
import type { FolderApi, Pane } from "tweakpane";

// Local modules
import {
  OVERRIDES_KEY,
  assignConfig,
  mergeConfig,
  playgroundConfig,
  type PlaygroundConfig,
} from "./config";

type Range = { min?: number; max?: number; step?: number };

/**
 * Saves the current values so they survive a reload.
 *
 * @param config - The live config.
 */
function persist(config: PlaygroundConfig) {
  window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(config));
}

/**
 * Adds a labelled binding to a folder for each listed key of one config group.
 *
 * @param folder - Folder to add the bindings to.
 * @param group - The config object holding the values.
 * @param ranges - Slider ranges by key; the keys also set which values appear.
 */
function bindAll<T extends object>(
  folder: FolderApi,
  group: T,
  ranges: Partial<Record<keyof T, Range>>,
) {
  for (const [key, range] of Object.entries(ranges)) {
    folder.addBinding(group, key as keyof T & string, range as Range);
  }
}

/**
 * Builds the layout and input folders of the panel.
 *
 * @param pane - The Tweakpane instance.
 * @param config - The live config the bindings edit.
 */
function addLayoutFolders(pane: Pane, config: PlaygroundConfig) {
  const folder = (title: string) => pane.addFolder({ title, expanded: false });

  bindAll(folder("Layout"), config.layout, {
    tileWidth: { min: 80, max: 600, step: 1 },
    tileHeight: { min: 80, max: 800, step: 1 },
    gap: { min: 0, max: 400, step: 1 },
    stagger: { min: 0, max: 400, step: 1 },
    fillRatio: { min: 0.1, max: 1, step: 0.01 },
    margin: { min: 0, max: 800, step: 10 },
    labelSize: { min: 8, max: 24, step: 1 },
    dotSpacing: { min: 12, max: 120, step: 1 },
    dotOpacity: { min: 0, max: 1, step: 0.01 },
  });
  bindAll(folder("Input & inertia"), config.input, {
    dragSpeed: { min: 0.2, max: 3, step: 0.05 },
    friction: { min: 0.5, max: 10, step: 0.1 },
    wheelSpeed: { min: 0.2, max: 3, step: 0.05 },
    keySpeed: { min: 200, max: 4000, step: 50 },
  });
}

/**
 * Builds the behaviour folders of the panel: nudge, effects, drift and video.
 *
 * @param pane - The Tweakpane instance.
 * @param config - The live config the bindings edit.
 */
function addBehaviourFolders(pane: Pane, config: PlaygroundConfig) {
  const folder = (title: string) => pane.addFolder({ title, expanded: false });

  bindAll(folder("Edge nudge"), config.nudge, {
    enabled: {},
    zone: { min: 0.02, max: 0.5, step: 0.01 },
    max: { min: 0, max: 300, step: 1 },
    ease: { min: 1, max: 20, step: 0.5 },
  });
  bindAll(folder("Effects"), config.effects, {
    scaleEnabled: {},
    scaleAmount: { min: 0.7, max: 1, step: 0.01 },
    skewEnabled: {},
    skewAmount: { min: 0, max: 20, step: 0.5 },
    parallaxEnabled: {},
    parallaxAmount: { min: 0, max: 200, step: 1 },
  });
  bindAll(folder("Drift"), config.drift, {
    enabled: {},
    speed: { min: 0, max: 120, step: 1 },
    delay: { min: 0, max: 20, step: 0.5 },
  });
  bindAll(folder("Video"), config.video, {
    maxConcurrent: { min: 0, max: 12, step: 1 },
  });
}

/**
 * Adds the seed controls, the FPS meter and the Copy / Reset buttons.
 *
 * @param pane - The Tweakpane instance.
 * @param config - The live config.
 * @param onChange - Called after a value changes.
 * @returns A function that stops the FPS sampling.
 */
function addTools(pane: Pane, config: PlaygroundConfig, onChange: () => void) {
  const seed = pane.addFolder({ title: "Seed", expanded: false });
  seed.addBinding(config, "seed", { min: 0, max: 9999, step: 1 });
  seed.addButton({ title: "Reshuffle" }).on("click", () => {
    config.seed = Math.floor(Math.random() * 10000);
    pane.refresh();
    persist(config);
    onChange();
  });

  const meter = { fps: 60 };
  pane.addBinding(meter, "fps", {
    readonly: true,
    view: "graph",
    min: 0,
    max: 120,
    interval: 250,
  });
  const sample = () => {
    meter.fps = 60 / Math.max(gsap.ticker.deltaRatio(60), 0.01);
  };
  gsap.ticker.add(sample);

  pane.addButton({ title: "Copy config" }).on("click", () => {
    void navigator.clipboard.writeText(JSON.stringify(config, null, 2));
  });
  pane.addButton({ title: "Reset" }).on("click", () => {
    window.localStorage.removeItem(OVERRIDES_KEY);
    assignConfig(config, mergeConfig(playgroundConfig, null));
    pane.refresh();
    onChange();
  });

  return () => gsap.ticker.remove(sample);
}

/**
 * Opens the Tweakpane tuning panel when `?debug` is in the URL, loading the
 * library only then. Changes apply live and persist to localStorage; the code
 * defaults stay the source of truth.
 *
 * @param config - The live config the panel edits in place.
 * @param onChange - Called after a value changes, to re-read the config.
 * @returns A promise of a function that closes the panel, or undefined when not in debug mode.
 */
export async function openDebugPanel(
  config: PlaygroundConfig,
  onChange: () => void,
): Promise<(() => void) | undefined> {
  if (!new URLSearchParams(window.location.search).has("debug")) return;

  const { Pane } = await import("tweakpane");
  const pane = new Pane({ title: "Playground" });
  addLayoutFolders(pane, config);
  addBehaviourFolders(pane, config);
  const stopFps = addTools(pane, config, onChange);

  pane.on("change", () => {
    persist(config);
    onChange();
  });

  return () => {
    stopFps();
    pane.dispose();
  };
}
