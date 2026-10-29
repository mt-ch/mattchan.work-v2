/** A stream or carousel that is created paused and driven by its owner. */
export type MotionController = {
  /** Begins the ticker, wheel/touch input and active-Project reporting. */
  start: () => void;
  /** Stops everything and removes every listener. */
  destroy: () => void;
};
