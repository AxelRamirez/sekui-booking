import { tours } from "@/lib/content/tours";

type Query = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** The next 12 months as "YYYY-MM", starting with the current one. */
export function upcomingMonths(now: Date, count = 12): string[] {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  return Array.from({ length: count }, (_, i) => new Date(Date.UTC(year, month + i, 1)).toISOString().slice(0, 7));
}

/**
 * Resolves `?month=` to a "YYYY-MM" in the next 12 months. Accepts "YYYY-MM"
 * or a bare month number ("3" = the next March), as sent by the home search.
 */
export function resolveMonth(value: string | undefined, now: Date): string | null {
  if (!value) return null;
  const months = upcomingMonths(now);
  if (/^\d{4}-\d{2}$/.test(value)) return months.includes(value) ? value : null;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 12) return null;
  return months.find((m) => Number(m.slice(5)) === number) ?? null;
}

export interface TripSearch {
  month: string | null;
  tour: string | null;
  guests: number;
}

export function parseTripSearch(query: Query, now: Date): TripSearch {
  const tour = first(query.tour);
  const guests = Number(first(query.guests));
  return {
    month: resolveMonth(first(query.month), now),
    tour: tour && tours.some((t) => t.slug === tour) ? tour : null,
    guests: Number.isInteger(guests) && guests > 0 ? Math.min(guests, 10) : 2,
  };
}

/** Query string from key/values, omitting empty ones. */
export function tripQuery(search: Record<string, string | number | null | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) if (value) params.set(key, String(value));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function isWithinMonth(date: string, month: string): boolean {
  return date.startsWith(month);
}
