/** Attribute on `<html>` that marks a hard load of `/` as Entrance-pending. */
export const ENTRANCE_STATE_ATTRIBUTE = "data-entrance-state";

/** Value of the state attribute when the full Entrance will play. */
export const ENTRANCE_PENDING = "pending";

/** Value of the state attribute when reduced motion is requested. */
export const ENTRANCE_REDUCED = "reduced";

/**
 * Inline head script, run before first paint on hard loads only. On `/` it
 * marks `<html>` as Entrance-pending (or its reduced-motion variant) so CSS can
 * hide the page until the Entrance runs. Client-side navigation never re-runs
 * it, which is why back-navigation to `/` plays no Entrance.
 */
export const ENTRANCE_SCRIPT = `(function(){if(location.pathname!=="/")return;var reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;document.documentElement.setAttribute("${ENTRANCE_STATE_ATTRIBUTE}",reduced?"${ENTRANCE_REDUCED}":"${ENTRANCE_PENDING}")})()`;

/**
 * Cancels the pre-hydration hiding for visitors without JavaScript, so the
 * page renders normally.
 */
export const ENTRANCE_NOSCRIPT_CSS = `html[${ENTRANCE_STATE_ATTRIBUTE}] [data-entrance]{opacity:1!important;pointer-events:auto!important}`;
