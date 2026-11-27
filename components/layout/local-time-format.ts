/** IANA timezone the owner's local time is shown in. */
export const OWNER_TIME_ZONE = "Europe/London";

/** City shown beside the time. */
export const OWNER_CITY = "London";

/**
 * Formats a moment as the owner's local time, e.g. `14:55:35 BST London`.
 *
 * @param date - The moment to format.
 * @param timeZone - IANA timezone to format in.
 * @param city - City label appended after the zone abbreviation.
 * @returns The time, zone abbreviation and city on one line.
 */
export function formatLocalTime(
  date: Date,
  timeZone: string = OWNER_TIME_ZONE,
  city: string = OWNER_CITY,
): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "short",
  }).formatToParts(date);

  // Pick the pieces by type so the order doesn't depend on locale output
  const part = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return `${part("hour")}:${part("minute")}:${part("second")} ${part("timeZoneName")} ${city}`;
}
