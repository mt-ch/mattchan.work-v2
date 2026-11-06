// Third-party libraries
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";

// Shared modules
import { getReducedMotion } from "@/lib/motion/environment";

// Local modules
import type { PlaygroundConfig } from "./config";
import type { MotionState } from "./motion-state";

gsap.registerPlugin(Observer);

/** Pointer travel in px beyond which a press counts as a drag, not a click. */
const CLICK_SLOP = 5;

/** Pause in ms after which a held drag has no velocity to hand to inertia. */
const HOLD_MS = 100;

type InputContext = {
  viewport: HTMLElement;
  state: MotionState;
  config: PlaygroundConfig;
};

/**
 * Moves the camera by a pointer or wheel delta and wakes the idle timer.
 *
 * @param ctx - Viewport, state and config.
 * @param dx - Delta in the direction the content moves, x.
 * @param dy - Delta in the direction the content moves, y.
 * @param speed - Multiplier for the delta.
 */
function pan(ctx: InputContext, dx: number, dy: number, speed: number) {
  ctx.state.x -= dx * speed;
  ctx.state.y -= dy * speed;
  ctx.state.idle = 0;
}

/**
 * Handles one change from the Observer: a drag moves the camera and tracks
 * velocity for inertia; a wheel or trackpad scroll moves it directly.
 *
 * @param ctx - Viewport, state and config.
 * @param self - The Observer instance reporting the change.
 * @param clock - Holds the time of the previous drag sample.
 */
function onChange(ctx: InputContext, self: Observer, clock: { last: number }) {
  const { state, config } = ctx;
  const dx = self.deltaX;
  const dy = self.deltaY;
  gsap.killTweensOf(state);

  if (!self.isDragging) {
    // wheelSpeed is -1, so wheel-down arrives negative like finger-up
    pan(ctx, dx, dy, config.input.wheelSpeed);
    state.vx = 0;
    state.vy = 0;

    return;
  }

  const now = performance.now();
  const dt = Math.max((now - clock.last) / 1000, 0.001);
  clock.last = now;
  const speed = config.input.dragSpeed;
  pan(ctx, dx, dy, speed);
  state.dragDistance += Math.abs(dx) + Math.abs(dy);

  // Smooth the release velocity so one jittery sample does not throw the canvas
  state.vx += (-(dx * speed) / dt - state.vx) * 0.5;
  state.vy += (-(dy * speed) / dt - state.vy) * 0.5;
}

/**
 * Turns drag, touch and wheel input on the viewport into camera movement.
 *
 * @param ctx - Viewport, state and config.
 * @returns A function that stops listening.
 */
function startPointerInput(ctx: InputContext) {
  const { state } = ctx;
  const clock = { last: 0 };

  const observer = Observer.create({
    target: ctx.viewport,
    type: "wheel,touch,pointer",
    wheelSpeed: -1,
    dragMinimum: 3,
    tolerance: 1,
    preventDefault: true,
    onPress: () => {
      gsap.killTweensOf(state);
      state.dragDistance = 0;
      state.vx = 0;
      state.vy = 0;
      state.idle = 0;
    },
    onDragStart: () => {
      state.dragging = true;
      clock.last = performance.now();
    },
    onChange: (self) => onChange(ctx, self, clock),
    onDragEnd: () => {
      state.dragging = false;
      // Letting go after holding still should not fling
      if (performance.now() - clock.last > HOLD_MS) {
        state.vx = 0;
        state.vy = 0;
      }
    },
  });

  return () => observer.kill();
}

/**
 * Pans with the arrow keys by giving the camera a velocity impulse.
 *
 * @param ctx - Viewport, state and config.
 * @returns A function that stops listening.
 */
function startKeyboard(ctx: InputContext) {
  const impulse: Record<string, [number, number]> = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const direction = impulse[event.key];
    const target = event.target as HTMLElement | null;
    if (!direction || event.altKey || event.ctrlKey || event.metaKey) return;
    if (target?.closest("input, textarea, select, [contenteditable]")) return;

    event.preventDefault();
    const { state, config } = ctx;
    const reduced = getReducedMotion().matches;
    const step = config.input.keySpeed;
    if (reduced)
      pan(ctx, -direction[0] * step * 0.15, -direction[1] * step * 0.15, 1);
    else {
      state.vx += direction[0] * step;
      state.vy += direction[1] * step;
    }
    state.idle = 0;
  };
  window.addEventListener("keydown", onKeyDown);

  return () => window.removeEventListener("keydown", onKeyDown);
}

/**
 * Stops a click that ends a drag from following the tile's link.
 *
 * @param ctx - Viewport, state and config.
 * @returns A function that stops listening.
 */
function startClickGuard(ctx: InputContext) {
  const onClick = (event: MouseEvent) => {
    if (ctx.state.dragDistance <= CLICK_SLOP) return;

    event.preventDefault();
    event.stopPropagation();
  };
  ctx.viewport.addEventListener("click", onClick, true);

  return () => ctx.viewport.removeEventListener("click", onClick, true);
}

/**
 * Starts every input: drag, touch, wheel, arrow keys, and the click guard.
 *
 * @param ctx - Viewport, state and config.
 * @returns A function that stops them all.
 */
export function startInput(ctx: InputContext) {
  const stops = [
    startPointerInput(ctx),
    startKeyboard(ctx),
    startClickGuard(ctx),
  ];

  return () => stops.forEach((stop) => stop());
}
