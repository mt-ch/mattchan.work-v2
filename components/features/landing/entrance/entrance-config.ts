/** Every tunable value of the Landing Entrance. */
export type EntranceConfig = {
  /** Seconds the page takes to fade in on a hard load. */
  fadeDuration: number;
  /** Seconds the page takes to fade in when reduced motion is requested. */
  reducedFadeDuration: number;
};

/** The Entrance's tunable values; later tickets add to this. */
export const ENTRANCE_CONFIG: EntranceConfig = {
  fadeDuration: 0.8,
  reducedFadeDuration: 0.4,
};
