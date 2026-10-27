import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { confirmReschedule } from "@/app/actions/booking";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { policies } from "@/lib/booking/policies";
import { quote } from "@/lib/booking/pricing";
import { getGuestBooking, listRescheduleOptions } from "@/lib/booking/service";
import { getTour } from "@/lib/content/tours";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { fill, formatDateRange, formatMoney, plural } from "@/lib/i18n/format";
import { localePath, routes } from "@/lib/i18n/paths";
import { getDictionary, getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.myTrip.rescheduleTitle, robots: { index: false } };
}

export default async function ReschedulePage({ params, searchParams }: PageProps<"/[lang]/my-trip/[code]/reschedule">) {
  const { locale, t } = await getI18n();
  return (
    <div className="container-page max-w-4xl py-12 pb-24">
      <Suspense fallback={<p className="text-muted">{t.common.loading}</p>}>
        <RescheduleOptions params={params} searchParams={searchParams} locale={locale} t={t} />
      </Suspense>
    </div>
  );
}

async function RescheduleOptions({
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
  const { t: tokenParam } = await searchParams;
  const token = typeof tokenParam === "string" ? tokenParam : "";
  const view = await getGuestBooking(decodeURIComponent(code), token);
  const m = t.myTrip;
  const money = (amount: number) => formatMoney(amount, locale);

  if (!view) return <p className="card p-8 text-center">{m.lookup.notFound}</p>;

  const { booking, departure, reschedule } = view;
  const back = localePath(locale, routes.manageTrip(booking.code, booking.accessToken));
  const options = reschedule.allowed ? await listRescheduleOptions(booking.code, token) : [];

  return (
    <div className="flex flex-col gap-8">
      <Link href={back} className="text-sm underline underline-offset-4">
        ← {booking.code}
      </Link>
      <div>
        <h1 className="heading text-4xl sm:text-5xl">{m.rescheduleTitle}</h1>
        <p className="mt-2 text-muted">
          {getTour(booking.tourSlug)?.name[locale]} · {m.rescheduleSubtitle}
        </p>
        <p className="mt-4 text-sm">
          {t.booking.departure}: <strong>{formatDateRange(departure.startDate, departure.endDate, locale)}</strong>
        </p>
      </div>

      {!reschedule.allowed ? (
        <p className="card p-6">
          {fill(m.rescheduleNotAllowed, { days: policies.reschedule.minDaysBefore, max: policies.reschedule.maxCount })}
        </p>
      ) : (
        <>
          <div className="card p-5 text-sm">
            <p className="font-semibold">{reschedule.fee > 0 ? fill(m.rescheduleFee, { fee: money(reschedule.fee) }) : m.rescheduleFree}</p>
            <p className="mt-1 text-muted">{m.rescheduleRefundNote}</p>
          </div>
          {options.length === 0 ? (
            <p className="card p-6 text-center text-muted">{m.noAlternatives}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {options.map((option) => {
                const newTotal = quote({
                  pricePerPerson: option.departure.pricePerPerson,
                  guests: booking.guests,
                  addonIds: booking.addons.map((a) => a.id),
                  extraFees: booking.extraFees + reschedule.fee,
                }).total;
                const difference = newTotal - booking.quote.total;
                return (
                  <li key={option.departure.id} className="card flex flex-wrap items-center gap-4 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{formatDateRange(option.departure.startDate, option.departure.endDate, locale)}</p>
                      <p className="text-sm text-muted">
                        {fill(m.rescheduleDifference, {
                          total: money(newTotal),
                          difference: `${difference >= 0 ? "+" : "−"}${money(Math.abs(difference))}`,
                        })}
                      </p>
                    </div>
                    <AvailabilityBadge status={option.status} label={plural(t.common.spotsLeft, option.spotsLeft, locale)} />
                    <form action={confirmReschedule}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="code" value={booking.code} />
                      <input type="hidden" name="token" value={booking.accessToken} />
                      <input type="hidden" name="departureId" value={option.departure.id} />
                      <button type="submit" className="btn btn-primary btn-sm">
                        {m.rescheduleConfirm}
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
