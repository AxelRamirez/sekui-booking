"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { policies } from "@/lib/booking/policies";
import {
  cancelBooking,
  createFollowUpPayment,
  createPendingBooking,
  findPayment,
  lookupBooking,
  markPaymentClosed,
  markPaymentSucceeded,
  rescheduleBooking,
} from "@/lib/booking/service";
import { addons } from "@/lib/content/addons";
import { sendBookingEmail, siteUrl } from "@/lib/email/send";
import { hasLocale, type Locale } from "@/lib/i18n/config";
import { dictionaryFor } from "@/lib/i18n/dictionaries";
import { fill } from "@/lib/i18n/format";
import { localePath, routes } from "@/lib/i18n/paths";
import { beginCheckout, executeRefunds, notifyPayment } from "@/lib/payments/checkout";
import { isStripeEnabled } from "@/lib/payments/provider";
import type { FormState } from "./form-state";

async function requestOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  return host ? `${h.get("x-forwarded-proto") ?? "http"}://${host}` : siteUrl();
}

function localeFrom(formData: FormData): Locale {
  const value = String(formData.get("locale") ?? "");
  return hasLocale(value) ? value : "en";
}

const MAX_TRAVELERS = 10;
const text = (max = 120) => z.string().trim().min(1).max(max);

const bookingSchema = z
  .object({
    departureId: text(),
    guests: z.coerce.number().int().min(1).max(MAX_TRAVELERS),
    addonIds: z.array(z.enum(addons.map((a) => a.id) as [string, ...string[]])),
    firstName: text(),
    lastName: text(),
    email: z.email(),
    phone: text(40),
    country: text(60),
    travelers: z.array(z.object({ fullName: text(), dietary: z.string().trim().max(200) })),
    notes: z.string().trim().max(1000),
    paymentPlan: z.enum(["full", "deposit"]),
    terms: z.literal("on"),
  })
  .refine((data) => data.travelers.length === data.guests, { path: ["travelers"] });

export async function startBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  const locale = localeFrom(formData);
  const t = dictionaryFor(locale);
  const guests = Number(formData.get("guests"));

  const parsed = bookingSchema.safeParse({
    departureId: formData.get("departureId"),
    guests: formData.get("guests"),
    addonIds: formData.getAll("addons"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    country: formData.get("country"),
    travelers: Array.from({ length: Number.isFinite(guests) ? Math.min(Math.max(guests, 0), MAX_TRAVELERS) : 0 }, (_, i) => ({
      fullName: formData.get(`traveler_${i}`) ?? "",
      dietary: formData.get(`dietary_${i}`) ?? "",
    })),
    notes: formData.get("notes") ?? "",
    paymentPlan: formData.get("paymentPlan"),
    terms: formData.get("terms"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]);
      fieldErrors[field] =
        field === "email"
          ? t.booking.errors.email
          : field === "terms"
            ? t.booking.errors.terms
            : field === "travelers"
              ? t.booking.errors.travelers
              : t.booking.errors.required;
    }
    return { status: "error", message: t.common.genericError, fieldErrors };
  }

  const input = parsed.data;
  const result = await createPendingBooking({
    departureId: input.departureId,
    guests: input.guests,
    addonIds: input.addonIds as (typeof addons)[number]["id"][],
    leadGuest: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email.toLowerCase(),
      phone: input.phone,
      country: input.country,
    },
    travelers: input.travelers,
    notes: input.notes,
    paymentPlan: input.paymentPlan,
    locale,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: fill(t.booking.failures[result.reason], { count: result.spotsLeft ?? 0, days: policies.depositMinDays }),
    };
  }

  let checkoutUrl: string;
  try {
    checkoutUrl = await beginCheckout({ ...result, origin: await requestOrigin() });
  } catch (error) {
    console.error("[checkout] failed to start", error);
    return { status: "error", message: t.common.genericError };
  }
  redirect(checkoutUrl);
}

// ─── My trip ────────────────────────────────────────────────────────────────

export async function findMyTrip(_prev: FormState, formData: FormData): Promise<FormState> {
  const locale = localeFrom(formData);
  const found = await lookupBooking(String(formData.get("code") ?? ""), String(formData.get("email") ?? ""));
  if (!found) return { status: "error", message: dictionaryFor(locale).myTrip.lookup.notFound };
  redirect(localePath(locale, routes.manageTrip(found.code, found.token)));
}

/** Pays the outstanding balance, or retries an unpaid booking. */
export async function payOutstanding(formData: FormData): Promise<void> {
  const locale = localeFrom(formData);
  const code = String(formData.get("code"));
  const token = String(formData.get("token"));
  const result = await createFollowUpPayment(code, token);
  if (!result.ok) redirect(`${localePath(locale, routes.manageTrip(code, token))}&error=${result.reason}`);

  const url = await beginCheckout({ ...result, origin: await requestOrigin() });
  redirect(url);
}

export async function confirmReschedule(formData: FormData): Promise<void> {
  const locale = localeFrom(formData);
  const code = String(formData.get("code"));
  const token = String(formData.get("token"));
  const result = await rescheduleBooking(code, token, String(formData.get("departureId")));
  const manage = localePath(locale, routes.manageTrip(code, token));
  if (!result.ok) redirect(`${manage}&error=${result.reason}`);

  await executeRefunds(code, result.refunds);
  await sendBookingEmail("rescheduled", result.booking, result.departure, { origin: await requestOrigin() });
  redirect(`${manage}&notice=rescheduled`);
}

export async function confirmCancellation(formData: FormData): Promise<void> {
  const locale = localeFrom(formData);
  const code = String(formData.get("code"));
  const token = String(formData.get("token"));
  const result = await cancelBooking(code, token);
  const manage = localePath(locale, routes.manageTrip(code, token));
  if (!result.ok) redirect(`${manage}&error=${result.reason}`);

  await executeRefunds(code, result.refunds);
  await sendBookingEmail("cancelled", result.booking, result.departure, { amount: result.refundTotal, origin: await requestOrigin() });
  redirect(`${manage}&notice=cancelled`);
}

// ─── Simulated checkout (no Stripe keys) ───────────────────────────────────

export async function completeSimulatedPayment(formData: FormData): Promise<void> {
  const locale = localeFrom(formData);
  const paymentId = String(formData.get("paymentId"));
  const outcome = formData.get("outcome") === "decline" ? "decline" : "pay";
  const payment = await findPayment(paymentId);

  if (isStripeEnabled() || !payment || payment.provider !== "simulated" || payment.status !== "pending") {
    redirect(localePath(locale, routes.myTrip));
  }

  if (outcome === "decline") {
    await markPaymentClosed(paymentId, "failed");
  } else {
    await notifyPayment(await markPaymentSucceeded(paymentId, null), await requestOrigin());
  }
  redirect(localePath(locale, `/booking/confirmation?payment=${paymentId}`));
}
