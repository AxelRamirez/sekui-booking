/**
 * Business rules for the booking engine. Tweak these to match the client's terms.
 */
export const policies = {
  /** Bookings close this many days before departure (logistics, transfers). */
  bookingCutoffDays: 7,
  /** Departures with this many spots left or fewer show as "last spots". */
  limitedThreshold: 3,
  /** Minutes a pending booking holds the spots while the guest pays. */
  holdMinutes: 35,
  depositRate: 0.3,
  /** Remaining balance is due this many days before departure. */
  balanceDueDays: 21,
  /** Deposit plan is offered only when departure is further away than this. */
  depositMinDays: 30,
  /** Peak departures cost this much more. */
  peakMultiplier: 1.15,
  reschedule: {
    maxCount: 2,
    minDaysBefore: 15,
    freeDaysBefore: 30,
    /** MXN per booking when rescheduling between minDaysBefore and freeDaysBefore. */
    fee: 1500,
  },
  /** Refund rate by days before departure, evaluated top-down. */
  cancellationTiers: [
    { minDays: 45, refundRate: 1 },
    { minDays: 30, refundRate: 0.5 },
    { minDays: 0, refundRate: 0 },
  ],
} as const;

export function refundRateFor(daysBefore: number): number {
  return policies.cancellationTiers.find((tier) => daysBefore >= tier.minDays)?.refundRate ?? 0;
}

export function rescheduleFeeFor(daysBefore: number): number {
  return daysBefore >= policies.reschedule.freeDaysBefore ? 0 : policies.reschedule.fee;
}
