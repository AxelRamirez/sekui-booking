import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { payOutstanding } from "@/app/actions/booking";
import { TripSummary } from "@/components/booking/TripSummary";
import { AutoRefresh } from "@/components/ui/AutoRefresh";
import { getPaymentContext } from "@/lib/booking/service";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { fill, formatMoney } from "@/lib/i18n/format";
import { localePath, routes } from "@/lib/i18n/paths";
import { getDictionary, getI18n } from "@/lib/i18n/server";
import { syncCheckoutSession } from "@/lib/payments/checkout";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.confirmation.title, robots: { index: false } };
}

export default async function ConfirmationPage({ searchParams }: PageProps<"/[lang]/booking/confirmation">) {
  const { locale, t } = await getI18n();
  return (
    <div className="container-page max-w-4xl py-14 pb-24">
      <Suspense fallback={<p className="text-center text-muted">{t.common.loading}</p>}>
        <Confirmation searchParams={searchParams} locale={locale} t={t} />
      </Suspense>
    </div>
  );
}

async function Confirmation({
  searchParams,
  locale,
  t,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  locale: Locale;
  t: Dictionary;
}) {
  await connection();
  const { payment: paymentId, session_id: sessionId } = await searchParams;

  // Don't wait for the webhook: reconcile with Stripe directly on return.
  if (typeof sessionId === "string") {
    try {
      await syncCheckoutSession(sessionId);
    } catch (error) {
      console.error("[confirmation] could not sync checkout session", error);
    }
  }

  const context = typeof paymentId === "string" ? await getPaymentContext(paymentId) : null;
  if (!context) {
    return (
      <div className="card p-8 text-center">
        <p>{t.checkout.simulated.expiredOrPaid}</p>
        <Link href={localePath(locale, routes.myTrip)} className="btn btn-primary mt-6">
          {t.nav.myTrip}
        </Link>
      </div>
    );
  }

  const { payment, booking, departure } = context;
  const manageHref = localePath(locale, routes.manageTrip(booking.code, booking.accessToken));
  const c = t.confirmation;

  if (payment.status === "pending") {
    return (
      <div className="card p-10 text-center">
        <AutoRefresh />
        <div className="mx-auto mb-6 size-10 animate-spin rounded-full border-4 border-line border-t-accent" />
        <h1 className="heading text-3xl">{c.pendingTitle}</h1>
        <p className="mt-3 text-muted">{c.pendingBody}</p>
      </div>
    );
  }

  if (payment.status !== "succeeded") {
    return (
      <div className="card p-10 text-center">
        <h1 className="heading text-3xl">{c.failedTitle}</h1>
        <p className="mt-3 text-muted">{c.failedBody}</p>
        <form action={payOutstanding} className="mt-6">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="code" value={booking.code} />
          <input type="hidden" name="token" value={booking.accessToken} />
          <button type="submit" className="btn btn-primary">
            {c.tryAgain}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-success/15 text-3xl text-success">✓</div>
        <h1 className="heading text-4xl sm:text-6xl">{c.title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">{fill(c.body, { email: booking.leadGuest.email })}</p>
        <p className="mt-2 text-sm">{fill(c.paymentReceived, { amount: formatMoney(payment.amount, locale) })}</p>
      </div>

      <div className="card flex flex-col items-center gap-2 p-6 text-center">
        <p className="label">{c.code}</p>
        <p className="font-mono text-3xl font-bold tracking-widest">{booking.code}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link href={manageHref} className="btn btn-primary">
            {c.manage}
          </Link>
          <a href={`/api/bookings/${booking.code}/calendar?t=${encodeURIComponent(booking.accessToken)}`} className="btn btn-outline">
            {c.addToCalendar}
          </a>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="card p-6">
          <TripSummary booking={booking} departure={departure} locale={locale} t={t} />
        </div>
        <div className="card p-6">
          <h2 className="heading mb-4 text-xl">{c.nextSteps}</h2>
          <ol className="flex flex-col gap-3 text-sm">
            {c.steps.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="font-semibold text-accent">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
