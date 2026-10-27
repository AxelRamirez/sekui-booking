import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { completeSimulatedPayment } from "@/app/actions/booking";
import { TripSummary } from "@/components/booking/TripSummary";
import { getPaymentContext } from "@/lib/booking/service";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { fill, formatMoney } from "@/lib/i18n/format";
import { localePath, routes } from "@/lib/i18n/paths";
import { getDictionary, getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.checkout.simulated.title, robots: { index: false } };
}

export default async function SimulatedCheckoutPage({ searchParams }: PageProps<"/[lang]/checkout/simulated">) {
  const { locale, t } = await getI18n();
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#f6f9fc] px-4 py-16 font-sans text-[#30313d]">
      <Suspense fallback={<p>{t.common.loading}</p>}>
        <SimulatedCheckout searchParams={searchParams} locale={locale} t={t} />
      </Suspense>
    </div>
  );
}

async function SimulatedCheckout({
  searchParams,
  locale,
  t,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  locale: Locale;
  t: Dictionary;
}) {
  await connection();
  const { payment: paymentId } = await searchParams;
  const context = typeof paymentId === "string" ? await getPaymentContext(paymentId) : null;
  const s = t.checkout.simulated;

  if (!context || context.payment.status !== "pending" || context.payment.provider !== "simulated") {
    return (
      <div className="max-w-md rounded-xl bg-white p-8 text-center shadow">
        <p>{s.expiredOrPaid}</p>
        <Link href={localePath(locale, routes.myTrip)} className="mt-4 inline-block font-semibold text-[#635bff]">
          {t.nav.myTrip}
        </Link>
      </div>
    );
  }

  const amount = formatMoney(context.payment.amount, locale);

  return (
    <div className="grid w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl md:grid-cols-2">
      <div className="bg-[#f6f9fc] p-8 [--fg:#30313d] [--muted:#6b7280] [--line:#e5e7eb]">
        <p className="mb-6 inline-block rounded bg-[#ffde92] px-2 py-0.5 text-xs font-bold text-[#7a5300]">TEST MODE</p>
        <p className="text-sm text-[#6b7280]">{context.booking.code}</p>
        <p className="mb-6 text-4xl font-semibold">{amount}</p>
        <TripSummary booking={context.booking} departure={context.departure} locale={locale} t={t} showLines={false} />
      </div>
      <form action={completeSimulatedPayment} className="flex flex-col gap-4 p-8">
        <h1 className="text-xl font-semibold">{s.title}</h1>
        <p className="text-sm text-[#6b7280]">{s.subtitle}</p>
        <input type="hidden" name="paymentId" value={context.payment.id} />
        <input type="hidden" name="locale" value={locale} />
        <label className="text-sm font-medium">
          Email
          <input readOnly value={context.booking.leadGuest.email} className="mt-1 w-full rounded-md border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2" />
        </label>
        <label className="text-sm font-medium">
          {s.card}
          <input readOnly value="4242 4242 4242 4242" className="mt-1 w-full rounded-md border border-[#e5e7eb] px-3 py-2 font-mono" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium">
            {s.expiry}
            <input readOnly value="12 / 34" className="mt-1 w-full rounded-md border border-[#e5e7eb] px-3 py-2 font-mono" />
          </label>
          <label className="text-sm font-medium">
            {s.cvc}
            <input readOnly value="123" className="mt-1 w-full rounded-md border border-[#e5e7eb] px-3 py-2 font-mono" />
          </label>
        </div>
        <button type="submit" name="outcome" value="pay" className="mt-2 rounded-md bg-[#635bff] px-4 py-3 font-semibold text-white hover:bg-[#5249e0]">
          {fill(s.pay, { amount })}
        </button>
        <button type="submit" name="outcome" value="decline" className="text-sm text-[#6b7280] underline">
          {s.decline}
        </button>
      </form>
    </div>
  );
}
