import { daysUntil } from "./dates";
import { policies, refundRateFor, rescheduleFeeFor } from "./policies";
import type { Booking, Departure } from "./types";

export interface RescheduleEligibility {
  allowed: boolean;
  fee: number;
  daysBefore: number;
}

export function rescheduleEligibility(booking: Booking, departure: Departure, now: Date): RescheduleEligibility {
  const daysBefore = daysUntil(departure.startDate, now);
  const allowed =
    booking.status === "confirmed" &&
    booking.rescheduleCount < policies.reschedule.maxCount &&
    daysBefore >= policies.reschedule.minDaysBefore;
  return { allowed, fee: allowed ? rescheduleFeeFor(daysBefore) : 0, daysBefore };
}

export interface CancellationQuote {
  allowed: boolean;
  refundRate: number;
  refundAmount: number;
  daysBefore: number;
}

export function cancellationQuote(booking: Booking, departure: Departure, paid: number, now: Date): CancellationQuote {
  const daysBefore = daysUntil(departure.startDate, now);
  const allowed = booking.status === "confirmed" && daysBefore >= 0;
  const refundRate = allowed ? refundRateFor(daysBefore) : 0;
  return { allowed, refundRate, refundAmount: Math.round(paid * refundRate), daysBefore };
}
