import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { BookingForm } from "@/components/booking/BookingForm";
import { tourFacts } from "@/components/tours/TourCard";
import { isOpen } from "@/lib/booking/availability";
import { daysUntil, todayString } from "@/lib/booking/dates";
import { policies } from "@/lib/booking/policies";
import { availablePlans } from "@/lib/booking/schedule";
import { parseTripSearch } from "@/lib/booking/search-params";
import { getDepartureAvailability } from "@/lib/booking/service";
import { addons } from "@/lib/content/addons";
import { getTour } from "@/lib/content/tours";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { localePath, routes } from "@/lib/i18n/paths";
import { getDictionary, getI18n } from "@/lib/i18n/server";
import { isStripeEnabled } from "@/lib/payments/provider";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.booking.title, robots: { index: false } };
}

export default async function BookPage({ params, searchParams }: PageProps<"/[lang]/book/[departureId]">) {
  const { locale, t } = await getI18n();

  return (
    <div className="container-page py-10 pb-24">
      <h1 className="heading mb-8 text-4xl sm:text-5xl text-center">{t.booking.title}</h1>
      <Suspense fallback={<div className="card h-[36rem] animate-pulse" />}>
        <BookingLoader params={params} searchParams={searchParams} locale={locale} t={t} />
      </Suspense>
    </div>
  );
}

async function BookingLoader({
  params,
  searchParams,
  locale,
  t,
}: {
  params: Promise<{ departureId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  locale: Locale;
  t: Dictionary;
}) {
  await connection();
  const now = new Date();
  const { departureId } = await params;
  const search = parseTripSearch(await searchParams, now);
  const availability = await getDepartureAvailability(decodeURIComponent(departureId));
  if (!availability) notFound();

  const { departure, spotsLeft } = availability;
  const tour = getTour(departure.tourSlug)!;

  if (!isOpen(availability)) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p className="text-lg">{t.booking.failures.unavailable}</p>
        <Link href={localePath(locale, routes.tour(tour.slug))} className="btn btn-primary mt-6">
          {t.common.viewTour}
        </Link>
      </div>
    );
  }

  return (
    <BookingForm
      locale={locale}
      copy={{ booking: t.booking, common: t.common, installments: t.myTrip.installments }}
      today={todayString(now)}
      stripeEnabled={isStripeEnabled()}
      policiesUrl={localePath(locale, routes.policies)}
      departure={{
        id: departure.id,
        startDate: departure.startDate,
        endDate: departure.endDate,
        pricePerPerson: departure.pricePerPerson,
        isPeak: departure.isPeak,
        spotsLeft,
      }}
      tour={{ name: tour.name[locale], facts: tourFacts(tour, t), image: tour.image }}
      initialGuests={search.guests}
      plans={availablePlans(daysUntil(departure.startDate, now))}
      addons={addons.map((a) => ({ id: a.id, name: a.name[locale], description: a.description[locale], price: a.price, unit: a.unit }))}
      limits={{ holdMinutes: policies.holdMinutes, depositMinDays: policies.depositMinDays }}
    />
  );
}
