import "server-only";
import { randomBytes, randomInt, randomUUID } from "node:crypto";
import type { AddonId } from "@/lib/content/addons";
import { getTour } from "@/lib/content/tours";
import { mutateDb, readDb, type Database } from "@/lib/db/store";
import type { Locale } from "@/lib/i18n/config";
import { describeAvailability, isBookable, isOpen, spotsLeft, type DepartureAvailability } from "./availability";
import { daysUntil, todayString } from "./dates";
import { policies } from "./policies";
import { quote, resolveAddons } from "./pricing";
import { cancellationQuote, rescheduleEligibility } from "./rules";
import { amountPaid, availablePlans, buildSchedule, nextInstallment, scheduleProgress } from "./schedule";
import type { Booking, Departure, Inquiry, LeadGuest, Payment, PaymentPlan, PaymentPurpose, Traveler } from "./types";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(db: Database): string {
  for (;;) {
    let suffix = "";
    for (let i = 0; i < 6; i++) suffix += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
    const code = `SEK-${suffix}`;
    if (!db.bookings.some((b) => b.code === code)) return code;
  }
}

function newPayment(bookingCode: string, purpose: PaymentPurpose, amount: number, now: Date): Payment {
  return {
    id: `pay_${randomUUID().replaceAll("-", "").slice(0, 20)}`,
    bookingCode,
    purpose,
    amount,
    refundedAmount: 0,
    status: "pending",
    provider: "simulated",
    checkoutSessionId: null,
    paymentIntentId: null,
    createdAt: now.toISOString(),
    paidAt: null,
  };
}

function holdUntil(now: Date): string {
  return new Date(now.getTime() + policies.holdMinutes * 60 * 1000).toISOString();
}

/** Releases spots held by bookings whose payment window has passed. */
function expireStaleHolds(db: Database, now: Date): void {
  for (const booking of db.bookings) {
    if (
      booking.status === "pending_payment" &&
      booking.holdExpiresAt &&
      new Date(booking.holdExpiresAt).getTime() <= now.getTime()
    ) {
      booking.status = "expired";
      booking.history.push({ at: now.toISOString(), type: "expired" });
      for (const payment of db.payments) {
        if (payment.bookingCode === booking.code && payment.status === "pending") payment.status = "expired";
      }
    }
  }
}

function paymentsFor(db: Database, code: string): Payment[] {
  return db.payments.filter((p) => p.bookingCode === code);
}

function scheduleFor(booking: Booking, departure: Departure) {
  return buildSchedule({
    plan: booking.paymentPlan,
    total: booking.quote.total,
    bookedOn: booking.createdAt.slice(0, 10),
    departureDate: departure.startDate,
  });
}

export interface RefundInstruction {
  paymentId: string;
  provider: Payment["provider"];
  paymentIntentId: string | null;
  amount: number;
}

/** Spreads a refund across succeeded payments, newest first, and records it. */
function allocateRefund(payments: Payment[], amount: number): RefundInstruction[] {
  const instructions: RefundInstruction[] = [];
  let remaining = amount;
  const refundable = payments
    .filter((p) => p.status === "succeeded")
    .sort((a, b) => (b.paidAt ?? "").localeCompare(a.paidAt ?? ""));
  for (const payment of refundable) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, payment.amount - payment.refundedAmount);
    if (take <= 0) continue;
    payment.refundedAmount += take;
    remaining -= take;
    instructions.push({ paymentId: payment.id, provider: payment.provider, paymentIntentId: payment.paymentIntentId, amount: take });
  }
  return instructions;
}

const clone = <T>(value: T): T => structuredClone(value);

// ─── Catalog & availability ────────────────────────────────────────────────

/** Upcoming departures with live availability, optionally filtered by month ("YYYY-MM") and tour. */
export async function listDepartures(filter: { month?: string | null; tourSlug?: string | null } = {}) {
  const db = await readDb();
  const now = new Date();
  return db.departures
    .filter((d) => d.startDate >= todayString(now))
    .filter((d) => !filter.month || d.startDate.startsWith(filter.month))
    .filter((d) => !filter.tourSlug || d.tourSlug === filter.tourSlug)
    .map((d) => describeAvailability(d, db.bookings, now));
}

/** Number of open departures per month ("YYYY-MM"), for month pickers. */
export async function openDeparturesByMonth(tourSlug?: string | null): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const item of await listDepartures({ tourSlug })) {
    const month = item.departure.startDate.slice(0, 7);
    counts[month] = (counts[month] ?? 0) + (isOpen(item) ? 1 : 0);
  }
  return counts;
}

export async function getDepartureAvailability(id: string): Promise<DepartureAvailability | null> {
  const db = await readDb();
  const departure = db.departures.find((d) => d.id === id);
  return departure ? describeAvailability(departure, db.bookings, new Date()) : null;
}

// ─── Booking creation & payments ───────────────────────────────────────────

export interface NewBookingInput {
  departureId: string;
  guests: number;
  addonIds: AddonId[];
  leadGuest: LeadGuest;
  travelers: Traveler[];
  notes: string;
  paymentPlan: PaymentPlan;
  locale: Locale;
}

export type BookingFailure = "unavailable" | "not_enough_spots" | "plan_unavailable";

export type CreateBookingResult =
  | { ok: true; booking: Booking; payment: Payment; departure: Departure }
  | { ok: false; reason: BookingFailure; spotsLeft?: number };

export function createPendingBooking(input: NewBookingInput): Promise<CreateBookingResult> {
  return mutateDb((db): CreateBookingResult => {
    const now = new Date();
    expireStaleHolds(db, now);

    const departure = db.departures.find((d) => d.id === input.departureId);
    if (!departure || !isBookable(departure, now)) return { ok: false, reason: "unavailable" };

    const left = spotsLeft(departure, db.bookings, now);
    if (left < input.guests) {
      return { ok: false, reason: left === 0 ? "unavailable" : "not_enough_spots", spotsLeft: left };
    }
    if (!availablePlans(daysUntil(departure.startDate, now)).includes(input.paymentPlan)) {
      return { ok: false, reason: "plan_unavailable" };
    }

    const createdAt = now.toISOString();
    const booking: Booking = {
      code: generateCode(db),
      accessToken: randomBytes(18).toString("base64url"),
      status: "pending_payment",
      locale: input.locale,
      tourSlug: departure.tourSlug,
      departureId: departure.id,
      guests: input.guests,
      leadGuest: input.leadGuest,
      travelers: input.travelers,
      addons: resolveAddons(input.addonIds, input.guests),
      notes: input.notes,
      paymentPlan: input.paymentPlan,
      quote: quote({ pricePerPerson: departure.pricePerPerson, guests: input.guests, addonIds: input.addonIds }),
      extraFees: 0,
      holdExpiresAt: holdUntil(now),
      rescheduleCount: 0,
      history: [{ at: createdAt, type: "created" }],
      createdAt,
      confirmedAt: null,
      cancelledAt: null,
    };
    const [firstInstallment] = scheduleFor(booking, departure);
    const payment = newPayment(booking.code, "initial", firstInstallment.amount, now);

    db.bookings.push(booking);
    db.payments.push(payment);
    return { ok: true, booking: clone(booking), payment: clone(payment), departure: clone(departure) };
  });
}

export function attachCheckoutSession(paymentId: string, provider: Payment["provider"], sessionId: string | null): Promise<void> {
  return mutateDb((db) => {
    const payment = db.payments.find((p) => p.id === paymentId);
    if (!payment) return;
    payment.provider = provider;
    payment.checkoutSessionId = sessionId;
  });
}

export interface PaymentOutcome {
  booking: Booking;
  payment: Payment;
  departure: Departure;
  newlyConfirmed: boolean;
  alreadyProcessed: boolean;
}

/** Idempotent: safe to call from both the webhook and the success page. */
export function markPaymentSucceeded(paymentId: string, paymentIntentId: string | null): Promise<PaymentOutcome | null> {
  return mutateDb((db): PaymentOutcome | null => {
    const payment = db.payments.find((p) => p.id === paymentId);
    const booking = payment && db.bookings.find((b) => b.code === payment.bookingCode);
    const departure = booking && db.departures.find((d) => d.id === booking.departureId);
    if (!payment || !booking || !departure) return null;

    if (payment.status === "succeeded") {
      return { booking: clone(booking), payment: clone(payment), departure: clone(departure), newlyConfirmed: false, alreadyProcessed: true };
    }

    const now = new Date().toISOString();
    payment.status = "succeeded";
    payment.paidAt = now;
    payment.paymentIntentId = paymentIntentId ?? payment.paymentIntentId;
    booking.history.push({ at: now, type: "payment_succeeded", data: { amount: payment.amount } });

    let newlyConfirmed = false;
    if (booking.status === "pending_payment" || booking.status === "expired") {
      booking.status = "confirmed";
      booking.confirmedAt = now;
      booking.holdExpiresAt = null;
      booking.history.push({ at: now, type: "confirmed" });
      newlyConfirmed = true;
    }
    return { booking: clone(booking), payment: clone(payment), departure: clone(departure), newlyConfirmed, alreadyProcessed: false };
  });
}

export function markPaymentClosed(paymentId: string, status: "failed" | "expired"): Promise<void> {
  return mutateDb((db) => {
    const payment = db.payments.find((p) => p.id === paymentId);
    if (payment && payment.status === "pending") payment.status = status;
  });
}

export function findPayment(paymentId: string): Promise<Payment | null> {
  return readDb().then((db) => db.payments.find((p) => p.id === paymentId) ?? null);
}

/** Payment with its booking and departure, for checkout and confirmation pages. */
export async function getPaymentContext(paymentId: string) {
  const db = await readDb();
  const payment = db.payments.find((p) => p.id === paymentId);
  const booking = payment && db.bookings.find((b) => b.code === payment.bookingCode);
  const departure = booking && db.departures.find((d) => d.id === booking.departureId);
  if (!payment || !booking || !departure) return null;
  return { payment, booking, departure };
}

export type FollowUpPaymentResult =
  | { ok: true; booking: Booking; payment: Payment; departure: Departure }
  | { ok: false; reason: "not_found" | "nothing_due" | "unavailable" };

/**
 * Creates the next payment for a booking: the balance for confirmed bookings,
 * or a fresh attempt (re-holding the spots) for unpaid ones.
 */
export function createFollowUpPayment(code: string, token: string): Promise<FollowUpPaymentResult> {
  return mutateDb((db): FollowUpPaymentResult => {
    const now = new Date();
    expireStaleHolds(db, now);
    const booking = db.bookings.find((b) => b.code === code && b.accessToken === token);
    const departure = booking && db.departures.find((d) => d.id === booking.departureId);
    if (!booking || !departure) return { ok: false, reason: "not_found" };

    const payments = paymentsFor(db, code);
    const schedule = scheduleFor(booking, departure);

    if (booking.status === "pending_payment" || booking.status === "expired") {
      if (booking.status === "expired") {
        if (!isBookable(departure, now) || spotsLeft(departure, db.bookings, now, code) < booking.guests) {
          return { ok: false, reason: "unavailable" };
        }
        booking.status = "pending_payment";
      }
      booking.holdExpiresAt = holdUntil(now);
      for (const p of payments) if (p.status === "pending") p.status = "expired";
      const payment = newPayment(code, "initial", schedule[0].amount, now);
      db.payments.push(payment);
      return { ok: true, booking: clone(booking), payment: clone(payment), departure: clone(departure) };
    }

    if (booking.status !== "confirmed") return { ok: false, reason: "nothing_due" };
    const next = nextInstallment(schedule, amountPaid(payments));
    if (!next) return { ok: false, reason: "nothing_due" };

    const payment = newPayment(code, "balance", next.outstanding, now);
    db.payments.push(payment);
    return { ok: true, booking: clone(booking), payment: clone(payment), departure: clone(departure) };
  });
}

// ─── Guest self-service ─────────────────────────────────────────────────────

export async function lookupBooking(code: string, email: string): Promise<{ code: string; token: string } | null> {
  const db = await readDb();
  const booking = db.bookings.find(
    (b) => b.code.toUpperCase() === code.trim().toUpperCase() && b.leadGuest.email.toLowerCase() === email.trim().toLowerCase(),
  );
  return booking ? { code: booking.code, token: booking.accessToken } : null;
}

export async function getGuestBooking(code: string, token: string) {
  const db = await readDb();
  const now = new Date();
  const stored = db.bookings.find((b) => b.code === code && b.accessToken === token);
  const departure = stored && db.departures.find((d) => d.id === stored.departureId);
  if (!stored || !departure) return null;

  const holdExpired =
    stored.status === "pending_payment" && !!stored.holdExpiresAt && new Date(stored.holdExpiresAt).getTime() <= now.getTime();
  const booking: Booking = { ...stored, status: holdExpired ? "expired" : stored.status };
  const payments = paymentsFor(db, code);
  const paid = amountPaid(payments);
  const schedule = scheduleFor(booking, departure);

  return {
    booking,
    departure,
    payments: payments.filter((p) => p.status === "succeeded"),
    paid,
    balance: Math.max(0, booking.quote.total - paid),
    schedule: scheduleProgress(schedule, paid),
    next: booking.status === "confirmed" ? nextInstallment(schedule, paid) : null,
    reschedule: rescheduleEligibility(booking, departure, now),
    cancellation: cancellationQuote(booking, departure, paid, now),
  };
}

export type GuestBookingView = NonNullable<Awaited<ReturnType<typeof getGuestBooking>>>;

/** Other departures of the same tour with enough room for the booking. */
export async function listRescheduleOptions(code: string, token: string): Promise<DepartureAvailability[]> {
  const db = await readDb();
  const now = new Date();
  const booking = db.bookings.find((b) => b.code === code && b.accessToken === token);
  if (!booking) return [];
  return db.departures
    .filter((d) => d.tourSlug === booking.tourSlug && d.id !== booking.departureId)
    .filter((d) => isBookable(d, now) && daysUntil(d.startDate, now) >= policies.reschedule.minDaysBefore)
    .map((d) => describeAvailability(d, db.bookings, now, code))
    .filter((option) => option.spotsLeft >= booking.guests);
}

export type ChangeResult =
  | { ok: true; booking: Booking; departure: Departure; refunds: RefundInstruction[]; refundTotal: number }
  | { ok: false; reason: "not_found" | "not_allowed" | "unavailable" };

export function rescheduleBooking(code: string, token: string, newDepartureId: string): Promise<ChangeResult> {
  return mutateDb((db): ChangeResult => {
    const now = new Date();
    expireStaleHolds(db, now);
    const booking = db.bookings.find((b) => b.code === code && b.accessToken === token);
    const current = booking && db.departures.find((d) => d.id === booking.departureId);
    const target = db.departures.find((d) => d.id === newDepartureId);
    if (!booking || !current || !target) return { ok: false, reason: "not_found" };

    const eligibility = rescheduleEligibility(booking, current, now);
    if (!eligibility.allowed || target.tourSlug !== booking.tourSlug || target.id === current.id) {
      return { ok: false, reason: "not_allowed" };
    }
    if (
      !isBookable(target, now) ||
      daysUntil(target.startDate, now) < policies.reschedule.minDaysBefore ||
      spotsLeft(target, db.bookings, now, code) < booking.guests
    ) {
      return { ok: false, reason: "unavailable" };
    }

    booking.extraFees += eligibility.fee;
    booking.quote = quote({
      pricePerPerson: target.pricePerPerson,
      guests: booking.guests,
      addonIds: booking.addons.map((a) => a.id),
      extraFees: booking.extraFees,
    });
    booking.departureId = target.id;
    booking.rescheduleCount += 1;
    const at = now.toISOString();
    booking.history.push({ at, type: "rescheduled", data: { from: current.startDate, to: target.startDate } });

    const payments = paymentsFor(db, code);
    const overpaid = Math.max(0, amountPaid(payments) - booking.quote.total);
    const refunds = overpaid > 0 ? allocateRefund(payments, overpaid) : [];
    if (overpaid > 0) booking.history.push({ at, type: "refunded", data: { amount: overpaid } });

    return { ok: true, booking: clone(booking), departure: clone(target), refunds, refundTotal: overpaid };
  });
}

export function cancelBooking(code: string, token: string): Promise<ChangeResult> {
  return mutateDb((db): ChangeResult => {
    const now = new Date();
    const booking = db.bookings.find((b) => b.code === code && b.accessToken === token);
    const departure = booking && db.departures.find((d) => d.id === booking.departureId);
    if (!booking || !departure) return { ok: false, reason: "not_found" };

    const payments = paymentsFor(db, code);
    const terms = cancellationQuote(booking, departure, amountPaid(payments), now);
    if (!terms.allowed) return { ok: false, reason: "not_allowed" };

    const at = now.toISOString();
    booking.status = "cancelled";
    booking.cancelledAt = at;
    booking.history.push({ at, type: "cancelled" });
    const refunds = terms.refundAmount > 0 ? allocateRefund(payments, terms.refundAmount) : [];
    if (terms.refundAmount > 0) booking.history.push({ at, type: "refunded", data: { amount: terms.refundAmount } });

    return { ok: true, booking: clone(booking), departure: clone(departure), refunds, refundTotal: terms.refundAmount };
  });
}

// ─── Back office ────────────────────────────────────────────────────────────

export async function getAdminSnapshot() {
  const db = await readDb();
  const now = new Date();
  return {
    bookings: [...db.bookings]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((booking) => ({
        booking,
        departure: db.departures.find((d) => d.id === booking.departureId),
        paid: amountPaid(paymentsFor(db, booking.code)),
        holdActive:
          booking.status === "pending_payment" && !!booking.holdExpiresAt && new Date(booking.holdExpiresAt).getTime() > now.getTime(),
      })),
    departures: db.departures
      .filter((d) => d.startDate >= todayString(now))
      .slice(0, 40)
      .map((d) => describeAvailability(d, db.bookings, now)),
    emails: [...db.emails].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    inquiries: [...db.inquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    subscribers: db.subscribers.length,
    revenue: db.payments.filter((p) => p.status === "succeeded").reduce((sum, p) => sum + p.amount - p.refundedAmount, 0),
  };
}

export async function getEmail(id: string) {
  const db = await readDb();
  return db.emails.find((e) => e.id === id) ?? null;
}

export function tourNameFor(booking: Booking, locale: Locale): string {
  return getTour(booking.tourSlug)?.name[locale] ?? booking.tourSlug;
}

// ─── Leads ──────────────────────────────────────────────────────────────────

export function addInquiry(input: Omit<Inquiry, "id" | "createdAt">): Promise<void> {
  return mutateDb((db) => {
    db.inquiries.push({ ...input, id: `inq_${randomUUID().slice(0, 8)}`, createdAt: new Date().toISOString() });
  });
}

export function addSubscriber(email: string, locale: Locale): Promise<void> {
  return mutateDb((db) => {
    const normalized = email.trim().toLowerCase();
    if (!db.subscribers.some((s) => s.email === normalized)) {
      db.subscribers.push({ email: normalized, locale, createdAt: new Date().toISOString() });
    }
  });
}
