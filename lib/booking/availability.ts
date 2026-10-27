import { daysUntil } from "./dates";
import { policies } from "./policies";
import type { AvailabilityStatus, Booking, Departure } from "./types";

export function holdsInventory(booking: Booking, now: Date): boolean {
  if (booking.status === "confirmed") return true;
  return (
    booking.status === "pending_payment" &&
    !!booking.holdExpiresAt &&
    new Date(booking.holdExpiresAt).getTime() > now.getTime()
  );
}

export function spotsLeft(departure: Departure, bookings: Booking[], now: Date, excludeBookingCode?: string): number {
  const booked = bookings
    .filter((b) => b.departureId === departure.id && b.code !== excludeBookingCode && holdsInventory(b, now))
    .reduce((sum, b) => sum + b.guests, 0);
  return Math.max(0, departure.capacity - departure.blockedSpots - booked);
}

export function isBookable(departure: Departure, now: Date): boolean {
  return departure.status === "scheduled" && daysUntil(departure.startDate, now) >= policies.bookingCutoffDays;
}

export function availabilityStatus(departure: Departure, left: number, now: Date): AvailabilityStatus {
  if (!isBookable(departure, now)) return "closed";
  if (left <= 0) return "sold_out";
  if (left <= policies.limitedThreshold) return "limited";
  return "available";
}

export interface DepartureAvailability {
  departure: Departure;
  spotsLeft: number;
  status: AvailabilityStatus;
}

export function describeAvailability(
  departure: Departure,
  bookings: Booking[],
  now: Date,
  excludeBookingCode?: string,
): DepartureAvailability {
  const left = spotsLeft(departure, bookings, now, excludeBookingCode);
  return { departure, spotsLeft: left, status: availabilityStatus(departure, left, now) };
}

export const isOpen = (item: DepartureAvailability) => item.status === "available" || item.status === "limited";
