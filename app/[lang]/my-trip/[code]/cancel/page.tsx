import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { confirmCancellation } from "@/app/actions/booking";
import { TripSummary } from "@/components/booking/TripSummary";
import { policies } from "@/lib/booking/policies";
import { getGuestBooking } from "@/lib/booking/service";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { fill, formatMoney } from "@/lib/i18n/format";
import { localePath, routes } from "@/lib/i18n/paths";
import { getDictionary, getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.myTrip.cancelTitle, robots: { index: false } };
}

export default async function CancelPage({ params, searchParams }: PageProps<"/[lang]/my-trip/[code]/cancel">) {
  const { locale, t } = await getI18n();
  return (
    <div className="container-page max-w-3xl py-12 pb-24">
      <Suspense fallback={<p className="text-muted">{t.common.loading}</p>}>
        <CancelBooking params={params} searchParams={searchParams} locale={locale} t={t} />
      </Suspense>
    </div>
  );
}

async function CancelBooking({
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
  const view = await getGuestBooking(decodeURIComponent(code), typeof tokenParam === "string" ? tokenParam : "");
  const m = t.myTrip;

  if (!view) {
    return <p className="card p-8 text-center">{m.lookup.notFound}</p>;
  }

  const { booking, departure, cancellation } = view;
  const back = localePath(locale, routes.manageTrip(booking.code, booking.accessToken));

  return (
    <div className="flex flex-col gap-8">
      <Link href={back} className="text-sm underline underline-offset-4">
        ← {booking.code}
      </Link>
      <h1 className="heading text-4xl">{m.cancelTitle}</h1>

      <div className="card p-6">
        <TripSummary booking={booking} departure={departure} locale={locale} t={t} showLines={false} />
      </div>

      <div className="card p-6">
        <h2 className="heading mb-3 text-xl">{m.cancelPolicy}</h2>
        <ul className="list-disc pl-5 text-sm text-muted">
          {policies.cancellationTiers.map((tier) => (
            <li key={tier.minDays}>{fill(t.policies.cancellationTier, { days: tier.minDays, rate: tier.refundRate * 100 })}</li>
          ))}
        </ul>
      </div>

      {cancellation.allowed ? (
        <div className="card flex flex-col gap-5 border-danger/40 p-6">
          <p className="text-lg">
            {cancellation.refundAmount > 0
              ? fill(m.cancelRefund, { amount: formatMoney(cancellation.refundAmount, locale), rate: Math.round(cancellation.refundRate * 100) })
              : m.cancelNoRefund}
          </p>
          <div className="flex flex-wrap gap-3">
            <form action={confirmCancellation}>
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="code" value={booking.code} />
              <input type="hidden" name="token" value={booking.accessToken} />
              <button type="submit" className="btn bg-danger text-white">
                {m.cancelConfirm}
              </button>
            </form>
            <Link href={back} className="btn btn-outline">
              {m.keepBooking}
            </Link>
          </div>
        </div>
      ) : (
        <p className="card p-6">{m.cancelNotAllowed}</p>
      )}
    </div>
  );
}
