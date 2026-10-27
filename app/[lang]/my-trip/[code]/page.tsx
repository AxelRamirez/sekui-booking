import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { payOutstanding } from "@/app/actions/booking";
import { TripSummary } from "@/components/booking/TripSummary";
import { bookingStatusTone, StatusPill } from "@/components/ui/AvailabilityBadge";
import { getGuestBooking } from "@/lib/booking/service";
import { policies } from "@/lib/booking/policies";
import type { BookingEvent } from "@/lib/booking/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { fill, formatDate, formatMoney } from "@/lib/i18n/format";
import { localePath, routes } from "@/lib/i18n/paths";
import { getDictionary, getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.myTrip.title, robots: { index: false } };
}

export default async function ManageTripPage({ params, searchParams }: PageProps<"/[lang]/my-trip/[code]">) {
  const { locale, t } = await getI18n();
  return (
    <div className="container-page max-w-6xl py-12 pb-24">
      <Suspense fallback={<p className="text-muted">{t.common.loading}</p>}>
        <ManageTrip params={params} searchParams={searchParams} locale={locale} t={t} />
      </Suspense>
    </div>
  );
}

function eventLabel(event: BookingEvent, t: Dictionary, locale: Locale): string {
  const data = event.data ?? {};
  return fill(t.myTrip.events[event.type], {
    amount: typeof data.amount === "number" ? formatMoney(data.amount, locale) : "",
    from: typeof data.from === "string" ? formatDate(data.from, locale) : "",
    to: typeof data.to === "string" ? formatDate(data.to, locale) : "",
  });
}

async function ManageTrip({
  params,
  searchParams,
  locale,
  t,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  locale: Locale;
  t: Dictionary;
}) {
  await connection();
  const { code } = await params;
  const query = await searchParams;
  const token = typeof query.t === "string" ? query.t : "";
  const view = await getGuestBooking(decodeURIComponent(code), token);
  const m = t.myTrip;

  if (!view) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <p>{m.lookup.notFound}</p>
        <Link href={localePath(locale, routes.myTrip)} className="btn btn-primary mt-6">
          {m.lookup.submit}
        </Link>
      </div>
    );
  }

  const { booking, departure, payments, paid, balance, schedule, next, reschedule, cancellation } = view;
  const money = (amount: number) => formatMoney(amount, locale);
  const notice =
    query.notice === "rescheduled" ? m.rescheduleDone : query.notice === "cancelled" ? m.cancelDone : query.canceled ? t.booking.canceledNotice : null;
  const error =
    query.error === "unavailable" ? t.booking.failures.unavailable : typeof query.error === "string" ? t.common.genericError : null;
  const hidden = (
    <>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="code" value={booking.code} />
      <input type="hidden" name="token" value={booking.accessToken} />
    </>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">{m.title}</p>
          <h1 className="heading font-mono text-4xl tracking-wider">{booking.code}</h1>
        </div>
        <StatusPill tone={bookingStatusTone[booking.status]}>{m.status[booking.status]}</StatusPill>
      </div>

      {notice && <div className="rounded-card border border-success/40 bg-success/10 p-4 text-success">{notice}</div>}
      {error && <div className="rounded-card border border-danger/40 bg-danger/10 p-4 text-danger">{error}</div>}

      {(booking.status === "pending_payment" || booking.status === "expired") && (
        <div className="card flex flex-wrap items-center justify-between gap-4 border-warning/50 p-5">
          <p>{m.pendingNotice}</p>
          <form action={payOutstanding}>
            {hidden}
            <button type="submit" className="btn btn-primary">
              {m.completePayment}
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <section className="card p-6">
            <h2 className="heading mb-5 text-2xl">{m.tripDetails}</h2>
            <TripSummary booking={booking} departure={departure} locale={locale} t={t} />
          </section>

          <section className="card p-6">
            <h2 className="heading mb-4 text-2xl">{m.travelers}</h2>
            <ul className="divide-y divide-line">
              {booking.travelers.map((traveler, i) => (
                <li key={i} className="flex justify-between gap-4 py-2 text-sm">
                  <span className="font-medium">{traveler.fullName}</span>
                  <span className="text-muted">{traveler.dietary}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">
              {booking.leadGuest.email} · {booking.leadGuest.phone}
            </p>
            {booking.notes && <p className="mt-2 text-sm text-muted">“{booking.notes}”</p>}
          </section>

          <section className="card p-6">
            <h2 className="heading mb-4 text-2xl">{m.history}</h2>
            <ol className="flex flex-col gap-3 border-l border-line pl-5 text-sm">
              {[...booking.history].reverse().map((event, i) => (
                <li key={i} className="relative">
                  <span className="absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full bg-accent" />
                  <span className="font-medium">{eventLabel(event, t, locale)}</span>
                  <span className="block text-xs text-muted">
                    {formatDate(event.at, locale, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="card p-6">
            <h2 className="heading mb-4 text-2xl">{m.schedule}</h2>
            <ul className="flex flex-col gap-3">
              {schedule.map((item) => (
                <li key={item.key} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium">{m.installments[item.key]}</p>
                    <p className="text-xs text-muted">{fill(m.due, { date: formatDate(item.dueDate, locale) })}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{money(item.amount)}</p>
                    {item.outstanding === 0 ? (
                      <StatusPill tone="success">{m.paid}</StatusPill>
                    ) : (
                      <span className="text-xs text-muted">
                        {m.outstanding}: {money(item.outstanding)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-5 grid gap-1 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">{m.totalPaid}</dt>
                <dd className="font-semibold">{money(paid)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">{m.balance}</dt>
                <dd className="font-semibold">{balance === 0 ? m.paidInFull : money(balance)}</dd>
              </div>
            </dl>
            {next && (
              <form action={payOutstanding} className="mt-5">
                {hidden}
                <button type="submit" className="btn btn-primary w-full">
                  {fill(m.payNext, { amount: money(next.outstanding) })}
                </button>
              </form>
            )}
          </section>

          {payments.length > 0 && (
            <section className="card p-6">
              <h2 className="heading mb-4 text-2xl">{m.payments}</h2>
              <ul className="flex flex-col gap-2 text-sm">
                {payments.map((payment) => (
                  <li key={payment.id} className="flex justify-between gap-3">
                    <span className="text-muted">{formatDate(payment.paidAt ?? payment.createdAt, locale)}</span>
                    <span>
                      {money(payment.amount)}
                      {payment.refundedAmount > 0 && <span className="ml-2 text-xs text-danger">−{money(payment.refundedAmount)}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {booking.status === "confirmed" && (
            <section className="card flex flex-col gap-3 p-6">
              <h2 className="heading mb-1 text-2xl">{m.actions}</h2>
              {reschedule.allowed ? (
                <Link href={`${localePath(locale, `/my-trip/${booking.code}/reschedule`)}?t=${encodeURIComponent(booking.accessToken)}`} className="btn btn-outline">
                  {m.reschedule}
                </Link>
              ) : (
                <p className="text-sm text-muted">{fill(m.rescheduleNotAllowed, { days: policies.reschedule.minDaysBefore, max: policies.reschedule.maxCount })}</p>
              )}
              {cancellation.allowed && (
                <Link href={`${localePath(locale, `/my-trip/${booking.code}/cancel`)}?t=${encodeURIComponent(booking.accessToken)}`} className="btn btn-ghost text-danger">
                  {m.cancel}
                </Link>
              )}
              <a href={`/api/bookings/${booking.code}/calendar?t=${encodeURIComponent(booking.accessToken)}`} className="text-center text-sm underline underline-offset-4">
                {t.confirmation.addToCalendar}
              </a>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
