// Third-party libraries
import { gsap } from "gsap";

// Local modules
import type { PlaygroundConfig } from "./config";
import { layoutTiles, type Tile } from "./layout";
import type { MotionState } from "./motion-state";
import type { Piece } from "./playground-data";
import { applyPlaying, pickPlaying } from "./video-budget";

/** What the renderer writes to. */
export type RenderTargets = {
  viewport: HTMLElement;
  scaler: HTMLElement;
  track: HTMLElement;
  dots: HTMLElement;
};

/**
 * Writes the config-driven CSS variables the tiles and dot grid read.
 *
 * @param viewport - The canvas viewport, which holds the variables.
 * @param config - Current config.
 */
export function applyConfigVars(
  viewport: HTMLElement,
  config: PlaygroundConfig,
) {
  const { layout } = config;
  viewport.style.setProperty("--label-size", `${layout.labelSize}px`);
  viewport.style.setProperty("--dot-spacing", `${layout.dotSpacing}px`);
  viewport.style.setProperty("--dot-opacity", String(layout.dotOpacity));
}

/**
 * Applies camera position and velocity effects as transforms and variables.
 *
 * @param targets - The canvas elements.
 * @param state - Motion state to read.
 * @param config - Effect and dot grid settings.
 * @param camera - Camera position including the edge nudge.
 */
function applyTransforms(
  targets: RenderTargets,
  state: MotionState,
  config: PlaygroundConfig,
  camera: { x: number; y: number },
) {
  const { effects, layout } = config;
  const scale = effects.scaleEnabled
    ? 1 - (1 - effects.scaleAmount) * state.fx.scale
    : 1;
  gsap.set(targets.scaler, { scale });
  gsap.set(targets.track, { x: -camera.x, y: -camera.y });

  // The dot grid only needs to move by the remainder of one spacing
  const s = layout.dotSpacing;
  gsap.set(targets.dots, {
    x: -(((camera.x % s) + s) % s),
    y: -(((camera.y % s) + s) % s),
  });

  // Tiles read these through CSS; content moves opposite to the camera
  const style = targets.scaler.style;
  const skew = effects.skewEnabled ? effects.skewAmount : 0;
  const shift = effects.parallaxEnabled ? effects.parallaxAmount : 0;
  style.setProperty("--skew-x", `${-state.fx.x * skew}deg`);
  style.setProperty("--skew-y", `${-state.fx.y * skew * 0.5}deg`);
  style.setProperty("--shift-x", `${-state.fx.x * shift}px`);
  style.setProperty("--shift-y", `${-state.fx.y * shift}px`);
}

/**
 * Renders one frame: moves the canvas and, when the set of visible tiles
 * changed, hands the new list to React. Also keeps video playback within budget.
 *
 * @param targets - The canvas elements.
 * @param state - Motion state to read.
 * @param config - Current config.
 * @param pieces - Everything the canvas can show.
 * @param onTiles - Called with the visible tiles when the set changes.
 */
export function render(
  targets: RenderTargets,
  state: MotionState,
  config: PlaygroundConfig,
  pieces: Piece[],
  onTiles: (tiles: Tile[]) => void,
  reduced: boolean,
) {
  const camera = { x: state.x + state.nudge.x, y: state.y + state.nudge.y };
  const viewport = {
    width: targets.viewport.clientWidth,
    height: targets.viewport.clientHeight,
  };
  applyTransforms(targets, state, config, camera);

  const tiles = layoutTiles({
    pieces,
    layout: config.layout,
    seed: config.seed,
    camera,
    viewport,
  });
  const signature = tiles.map((t) => t.key).join(",");
  const changed = state.dirty || signature !== state.signature;
  if (changed) {
    state.dirty = false;
    state.signature = signature;
    onTiles(tiles);
  }

  // Re-check which videos play now and then, and whenever the tiles change
  const now = performance.now();
  if (changed || now - state.videoClock > 250) {
    state.videoClock = now;
    const playing = reduced
      ? new Set<string>()
      : pickPlaying(tiles, viewport, config.video.maxConcurrent);
    applyPlaying(targets.track, playing);
  }
}
