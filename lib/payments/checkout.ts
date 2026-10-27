import "server-only";
import { getTour } from "@/lib/content/tours";
import {
  attachCheckoutSession,
  markPaymentClosed,
  markPaymentSucceeded,
  type PaymentOutcome,
} from "@/lib/booking/service";
import type { Booking, Departure, Payment } from "@/lib/booking/types";
import { sendBookingEmail } from "@/lib/email/send";
import { site } from "@/lib/content/site";
import { formatDateRange, plural } from "@/lib/i18n/format";
import { dictionaryFor } from "@/lib/i18n/dictionaries";
import {
  createCheckoutSession,
  isStripeEnabled,
  refundProviderPayment,
  retrieveCheckoutStatus,
} from "./provider";
import type { RefundInstruction } from "@/lib/booking/service";

/** Opens a hosted checkout (Stripe or simulated) for a pending payment and returns its URL. */
export async function beginCheckout(input: {
  booking: Booking;
  payment: Payment;
  departure: Departure;
  origin: string;
}): Promise<string> {
  const { booking, payment, departure, origin } = input;
  const locale = booking.locale;
  const t = dictionaryFor(locale);
  const tour = getTour(booking.tourSlug);
  const manageUrl = `${origin}/${locale}/my-trip/${booking.code}?t=${booking.accessToken}`;

  const result = await createCheckoutSession({
    paymentId: payment.id,
    bookingCode: booking.code,
    amount: payment.amount,
    customerEmail: booking.leadGuest.email,
    productName: `${site.name} · ${tour?.name[locale] ?? booking.tourSlug} · ${booking.code}`,
    productDescription: `${formatDateRange(departure.startDate, departure.endDate, locale)} · ${plural(t.common.travelers, booking.guests, locale)} · ${t.myTrip.installments[payment.purpose === "balance" ? "balance" : booking.paymentPlan === "deposit" ? "deposit" : "full"]}`,
    locale,
    successUrl: `${origin}/${locale}/booking/confirmation?payment=${payment.id}`,
    cancelUrl: `${manageUrl}&canceled=1`,
  });

  await attachCheckoutSession(payment.id, isStripeEnabled() ? "stripe" : "simulated", result.sessionId);
  return result.url;
}

/** Sends the right email after a successful payment (once). */
export async function notifyPayment(outcome: PaymentOutcome | null, origin?: string): Promise<void> {
  if (!outcome || outcome.alreadyProcessed) return;
  await sendBookingEmail(outcome.newlyConfirmed ? "confirmed" : "payment", outcome.booking, outcome.departure, {
    amount: outcome.payment.amount,
    origin,
  });
}

/** Pulls the latest status of a Stripe Checkout Session into our records. */
export async function syncCheckoutSession(sessionId: string, origin?: string): Promise<void> {
  if (!isStripeEnabled()) return;
  const status = await retrieveCheckoutStatus(sessionId);
  if (!status.paymentId) return;
  if (status.paid) {
    await notifyPayment(await markPaymentSucceeded(status.paymentId, status.paymentIntentId), origin);
  } else if (status.expired) {
    await markPaymentClosed(status.paymentId, "expired");
  }
}

export async function executeRefunds(bookingCode: string, refunds: RefundInstruction[]): Promise<void> {
  for (const refund of refunds) {
    try {
      await refundProviderPayment({ ...refund, bookingCode });
    } catch (error) {
      // Recorded in our ledger already; surface for manual follow-up.
      console.error(`[refund] ${bookingCode} ${refund.paymentId} failed`, error);
    }
  }
}
