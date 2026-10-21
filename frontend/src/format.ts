import { LANGUAGE } from "./strings";

const relativeFormat = new Intl.RelativeTimeFormat(LANGUAGE, {
  numeric: "auto",
});

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/** "5 minutes ago" or "yesterday", in the largest unit that fits. */
export const formatRelativeTime = (date: Date, now: Date): string => {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) {
      return relativeFormat.format(Math.round(seconds / size), unit);
    }
  }
  return relativeFormat.format(seconds, "second");
};

export const dateTimeFormat = new Intl.DateTimeFormat(LANGUAGE, {
  dateStyle: "medium",
  timeStyle: "short",
});

export const percentFormat = new Intl.NumberFormat(LANGUAGE, {
  style: "percent",
});

export const listFormat = new Intl.ListFormat(LANGUAGE, {
  type: "conjunction",
});
