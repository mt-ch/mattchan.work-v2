/** Every tunable value of the Landing Entrance. */
export type EntranceConfig = {
  /** Seconds the page takes to fade in on a hard load. */
  fadeDuration: number;
  /** Seconds the page takes to fade in when reduced motion is requested. */
  reducedFadeDuration: number;
  /** How many Project tiles (from the first) make up the stack. */
  stackSize: number;
  /** Stack card width as `clamp(min, vw, max)`: min and max in px, vw as a viewport fraction. */
  stackWidth: { min: number; vw: number; max: number };
  /** Stack card aspect ratio (width / height); matches the tiles' natural 3:2. */
  stackAspect: number;
  /** Seconds between one card starting to pop in and the next. */
  popStagger: number;
  /** Seconds each card's pop-in lasts. */
  popDuration: number;
  /** GSAP ease of each card's pop-in. */
  popEase: string;
  /** Scale a card starts its pop-in from, relative to its stack size. */
  popFromScale: number;
  /** Share of the pop-in (0 to 1) over which the card fades in. */
  popFadeShare: number;
  /** Seconds the counter takes to blur in. */
  counterInDuration: number;
  /** GSAP ease of the counter blurring in. */
  counterInEase: string;
  /** Blur radius in px the counter starts from, and ends at when blurring out. */
  counterBlur: number;
  /** Seconds the counter takes to blur out. */
  counterOutDuration: number;
  /** GSAP ease of the counter blurring out. */
  counterOutEase: string;
  /** Counter value the load phase climbs to; the stack phase runs from here to 100. */
  counterLoadShare: number;
  /** Seconds the load-phase counter takes to catch up with each settled image. */
  counterSmoothing: number;
  /** Gap in px between the stack's top-right corner and the counter. */
  counterGap: number;
  /** Seconds each card takes to travel from the stack to its slot. */
  dealDuration: number;
  /** GSAP ease of each card's travel. */
  dealEase: string;
  /** Seconds between one card starting to deal and the next; tile 0 goes first. */
  dealStagger: number;
  /** Share of the deal (0 to 1), counted from its end, over which the other nodes fade in. */
  dealFadeShare: number;
  /** Distance in px the other nodes rise from as they fade in. */
  dealFadeOffset: number;
  /** GSAP ease of the other nodes fading in. */
  dealFadeEase: string;
  /** Seconds the sidebar takes to fade in. */
  sidebarDuration: number;
  /** GSAP ease of the sidebar fade. */
  sidebarEase: string;
  /** Seconds before the deal ends at which the sidebar starts to fade in. */
  sidebarOverlap: number;
};

/** The Entrance's tunable values; later tickets add to this. */
export const ENTRANCE_CONFIG: EntranceConfig = {
  fadeDuration: 0.8,
  reducedFadeDuration: 0.4,
  stackSize: 5,
  stackWidth: { min: 320, vw: 0.36, max: 560 },
  stackAspect: 3 / 2,
  popStagger: 0.28,
  popDuration: 0.8,
  popEase: "expo.out",
  popFromScale: 0.6,
  popFadeShare: 0.3,
  counterInDuration: 0.5,
  counterInEase: "power2.out",
  counterBlur: 8,
  counterOutDuration: 0.4,
  counterOutEase: "power2.in",
  counterLoadShare: 40,
  counterSmoothing: 0.4,
  counterGap: 12,
  dealDuration: 1.2,
  dealEase: "expo.inOut",
  dealStagger: 0.06,
  dealFadeShare: 0.5,
  dealFadeOffset: 40,
  dealFadeEase: "power2.out",
  sidebarDuration: 0.6,
  sidebarEase: "power2.out",
  sidebarOverlap: 0.5,
};
