import "server-only";
import { randomUUID } from "node:crypto";
import { getTour } from "@/lib/content/tours";
import { site } from "@/lib/content/site";
import type { Booking, Departure } from "@/lib/booking/types";
import { mutateDb } from "@/lib/db/store";
import { fill, formatDate, formatMoney, plural } from "@/lib/i18n/format";
import { dictionaryFor } from "@/lib/i18n/dictionaries";

export type BookingEmailKind = "confirmed" | "payment" | "rescheduled" | "cancelled";

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function renderBookingEmail(
  kind: BookingEmailKind,
  booking: Booking,
  departure: Departure,
  extra: { amount?: number; origin: string },
) {
  const locale = booking.locale;
  const t = dictionaryFor(locale);
  const tour = getTour(booking.tourSlug);
  const copy = t.emails[kind];
  const amount = formatMoney(extra.amount ?? 0, locale);
  const manageUrl = `${extra.origin}/${locale}/my-trip/${booking.code}?t=${booking.accessToken}`;

  const rows: [string, string][] = [
    [t.confirmation.code, booking.code],
    [t.search.tour, tour?.name[locale] ?? booking.tourSlug],
    [t.booking.departure, formatDate(departure.startDate, locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" })],
    [t.booking.return, formatDate(departure.endDate, locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" })],
    [t.myTrip.travelers, plural(t.common.travelers, booking.guests, locale)],
    [t.common.total, formatMoney(booking.quote.total, locale)],
  ];

  const paragraphs = [fill(copy.intro, { amount })];
  if (kind === "cancelled" && extra.amount) paragraphs.push(fill(t.emails.cancelled.refund, { amount }));

  const html = `<!doctype html>
<html lang="${locale}"><body style="margin:0;background:#f7f3ec;font-family:Helvetica,Arial,sans-serif;color:#1f2a2e">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden">
      <tr><td style="background:#0f6e6e;color:#ffffff;padding:24px 32px;font-family:Helvetica,Arial,sans-serif;font-weight:bold;font-size:28px;letter-spacing:0.5px">${escapeHtml(site.name.toLowerCase())}</td></tr>
      <tr><td style="padding:32px">
        <p style="margin:0 0 16px">${escapeHtml(fill(t.emails.greeting, { name: booking.leadGuest.firstName }))}</p>
        ${paragraphs.map((p) => `<p style="margin:0 0 16px;line-height:1.5">${escapeHtml(p)}</p>`).join("")}
        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;margin:16px 0;font-size:14px">
          ${rows
            .map(
              ([label, value]) =>
                `<tr><td style="border-bottom:1px solid #eee;color:#5b6b70">${escapeHtml(label)}</td><td style="border-bottom:1px solid #eee;text-align:right;font-weight:bold">${escapeHtml(value)}</td></tr>`,
            )
            .join("")}
        </table>
        <p style="margin:24px 0"><a href="${manageUrl}" style="background:#0f6e6e;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;display:inline-block">${escapeHtml(t.emails.manage)}</a></p>
        <p style="margin:0;color:#5b6b70;font-size:13px">${escapeHtml(t.emails.footer)}</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  return { subject: fill(copy.subject, { code: booking.code }), html };
}

/**
 * Demo mailer: messages are stored in the local outbox (visible in /admin)
 * and logged to the console. Plug in a real provider (Resend, SES…) here.
 */
export async function sendBookingEmail(
  kind: BookingEmailKind,
  booking: Booking,
  departure: Departure,
  extra: { amount?: number; origin?: string } = {},
): Promise<void> {
  const { subject, html } = renderBookingEmail(kind, booking, departure, {
    amount: extra.amount,
    origin: extra.origin ?? siteUrl(),
  });
  await mutateDb((db) => {
    db.emails.push({
      id: `msg_${randomUUID().slice(0, 12)}`,
      to: booking.leadGuest.email,
      subject,
      html,
      bookingCode: booking.code,
      createdAt: new Date().toISOString(),
    });
  });
  console.info(`[email] → ${booking.leadGuest.email}: ${subject}`);
}
