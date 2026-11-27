"use client";

// React and Next.js
import { useSyncExternalStore } from "react";

// Local modules
import { formatLocalTime } from "./local-time-format";

/**
 * Calls `onTick` once a second until unsubscribed.
 *
 * @param onTick - Callback to run on each tick.
 * @returns A function that stops the ticking.
 */
function subscribeToSeconds(onTick: () => void): () => void {
  const id = setInterval(onTick, 1000);

  return () => clearInterval(id);
}

/**
 * Reads the current time as whole-second epoch ms, so repeated reads within a
 * second return the same value.
 *
 * @returns The current time, floored to the second.
 */
function getSecond(): number {
  return Math.floor(Date.now() / 1000) * 1000;
}

/**
 * The owner's local time, ticking every second. Renders an empty placeholder
 * on the server and first paint so server and client markup match.
 *
 * @param props.className - Classes for the wrapping element.
 * @returns The live clock.
 */
export function LocalTime({ className }: { className?: string }) {
  const second = useSyncExternalStore(
    subscribeToSeconds,
    getSecond,
    () => null,
  );
  const now = second === null ? null : new Date(second);

  return (
    <time className={className} dateTime={now?.toISOString()}>
      {now ? formatLocalTime(now) : " "}
    </time>
  );
}
