// Local modules
import type { DepthCurve } from "./depth-curve";

/** Every tunable value of the Queue. The code defaults are the source of truth. */
export type QueueConfig = {
  /** Cards rendered nearer than the focus card. */
  renderBefore: number;
  /** Cards rendered farther than the focus card. */
  renderAfter: number;
  /** Card height as a share of the viewport height. */
  cardHeight: number;
  /** Distance between neighbouring cards along the track, in card heights. */
  spacing: number;
  /** Angle of the track from horizontal, in degrees. */
  angle: number;
  /** Camera perspective distance, in card heights. */
  perspective: number;
  /** Y rotation of every card, in degrees. */
  rotateY: number;
  /** Depth per card step, in card heights; farther cards sit further back. */
  depthStep: number;
  /** How depth grows with distance from the focus card: linear, ease (flattens far away) or arc (a bowl). */
  depthCurve: DepthCurve;
  /** Scale lost per card step away from the focus card. */
  scaleFalloff: number;
  /** Smallest scale a card shrinks to. */
  minScale: number;
  /** Opacity lost per card step away from the focus card. */
  fadeFalloff: number;
  /** Extra rotateY per card step away from the focus card, in degrees. */
  rotateFalloff: number;
  /** Which way the fan runs: 1 is far at the top-right, -1 mirrors it to the top-left. */
  direction: number;
  /** When true a card keeps its piece's shape (4:5 or 3:2); when false every card is 4:5. */
  honourOrientation: boolean;
  /** Camera perspective distance on narrow screens, in card heights. */
  mobilePerspective: number;
  /** Card height on narrow screens, as a share of the viewport height. */
  mobileCardHeight: number;
  /** Static Y rotation of every card under reduced motion, in degrees. */
  reducedTilt: number;
  /** Auto-scroll speed in cards per second. */
  driftSpeed: number;
  /** Auto-scroll direction: 1 moves cards from far to near (right to left), -1 reverses it. */
  driftDirection: number;
  /** How fast momentum dies away, per second; higher stops sooner. */
  friction: number;
  /** Skew of every card along the track at full speed, in degrees; 0 is off. */
  velocitySkew: number;
  /** Extra rotateY of every card at full speed, in degrees; 0 is off. */
  velocityRotate: number;
  /** Extra spacing between cards at full speed, as a share of the spacing; 0 is off. */
  velocitySpread: number;
  /** Seconds the drift stays paused after the last input or hover before it resumes. */
  resumeDelay: number;
  /** How fast the drift eases back in once resumed, per second; higher is quicker. */
  resumeRate: number;
};

export const queueConfig: QueueConfig = {
  renderBefore: 3,
  renderAfter: 9,
  cardHeight: 0.55,
  spacing: 0.55,
  angle: 28,
  perspective: 3,
  rotateY: -28,
  depthStep: 0.35,
  depthCurve: "linear",
  scaleFalloff: 0.06,
  minScale: 0.35,
  fadeFalloff: 0.07,
  rotateFalloff: 0,
  direction: 1,
  honourOrientation: false,
  mobilePerspective: 2,
  mobileCardHeight: 0.4,
  reducedTilt: -6,
  driftSpeed: 0.25,
  driftDirection: 1,
  friction: 3,
  velocitySkew: 6,
  velocityRotate: 8,
  velocitySpread: 0.15,
  resumeDelay: 1.2,
  resumeRate: 2,
};
