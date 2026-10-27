import type { DateString } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Calendar dates are handled in UTC to avoid timezone drift. */
export function parseDate(date: DateString): Date {
  return new Date(`${date}T00:00:00Z`);
}

export function toDateString(date: Date): DateString {
  return date.toISOString().slice(0, 10);
}

export function isDateString(value: unknown): value is DateString {
  return typeof value === "string" && DATE_PATTERN.test(value) && !Number.isNaN(parseDate(value).getTime());
}

export function addDays(date: DateString, days: number): DateString {
  return toDateString(new Date(parseDate(date).getTime() + days * DAY_MS));
}

export function todayString(now: Date): DateString {
  return toDateString(now);
}

/** Whole days from `now` (by calendar date) until `date`. */
export function daysUntil(date: DateString, now: Date): number {
  return Math.round((parseDate(date).getTime() - parseDate(todayString(now)).getTime()) / DAY_MS);
}

export function daysBetween(from: DateString, to: DateString): number {
  return Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / DAY_MS);
}

/** Every night of a stay: check-in included, check-out excluded. */
export function eachNight(checkIn: DateString, checkOut: DateString): DateString[] {
  const nights: DateString[] = [];
  for (let date = checkIn; date < checkOut; date = addDays(date, 1)) nights.push(date);
  return nights;
}

export function monthKey(date: DateString): string {
  return date.slice(0, 7);
}
