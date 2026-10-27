import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { DeparturePicker } from "@/components/tours/DeparturePicker";
import { TourCard } from "@/components/tours/TourCard";
import { Photo } from "@/components/ui/Photo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { parseTripSearch, upcomingMonths } from "@/lib/booking/search-params";
import { listDepartures } from "@/lib/booking/service";
import { cabinsAt } from "@/lib/content/eco-cabins";
import { site } from "@/lib/content/site";
import { getTour, itineraryFor, tours, type Tour } from "@/lib/content/tours";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { fill, seasonLabel } from "@/lib/i18n/format";
import { localePath, routes } from "@/lib/i18n/paths";
import { getI18n } from "@/lib/i18n/server";

export function generateStaticParams() {
  return tours.map((tour) => ({ slug: tour.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/tours/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { locale } = await getI18n();
  const tour = getTour(slug);
  return tour ? { title: tour.name[locale], description: tour.summary[locale] } : {};
}

export default async function TourPage({ params, searchParams }: PageProps<"/[lang]/tours/[slug]">) {
  const { slug } = await params;
  const tour = getTour(slug);
  if (!tour) notFound();

  const { locale, t } = await getI18n();
  const facts = [
    { label: t.tours.duration, value: fill(t.common.daysNights, { days: tour.days, nights: tour.nights }) },
    { label: t.tours.groupSize, value: fill(t.common.maxGroup, { count: tour.maxGuests }) },
    { label: t.tours.level, value: t.difficulty[tour.difficulty] },
    { label: t.tours.season, value: seasonLabel(tour.seasonMonths, locale) },
  ];
  const related = tours.filter((other) => other.slug !== tour.slug && other.category === tour.category).slice(0, 3);

  return (
    <>
      <section className="container-page pt-10 text-center">
        <p className="eyebrow mb-4">
          {t.categories[tour.category]} · {site.location[locale]}
        </p>
        <h1 className="heading text-5xl sm:text-7xl">{tour.name[locale]}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">{tour.summary[locale]}</p>
      </section>

      <section className="container-page mt-10 grid gap-3 sm:grid-cols-4 sm:grid-rows-2">
        <div className="relative aspect-[4/3] overflow-hidden sm:col-span-2 sm:row-span-2 sm:aspect-auto rounded-card">
          <Photo name={tour.image} alt={tour.name[locale]} preload sizes="(min-width: 640px) 50vw, 100vw" />
        </div>
        {tour.gallery.map((image) => (
          <div key={image} className="relative hidden aspect-[4/3] overflow-hidden sm:block rounded-card">
            <Photo name={image} alt="" sizes="25vw" />
          </div>
        ))}
      </section>

      <div className="container-page grid gap-14 py-14 lg:grid-cols-[1fr_25rem]">
        <div className="flex flex-col gap-14">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line text-sm sm:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="bg-surface p-4">
                <dt className="text-xs text-muted">{fact.label}</dt>
                <dd className="mt-1 font-semibold">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <section className="prose-body text-lg">
            {tour.description[locale].map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>

          <section>
            <SectionHeading title={t.tours.highlights} />
            <ul className="grid gap-3 sm:grid-cols-2">
              {tour.highlights[locale].map((highlight) => (
                <li key={highlight} className="flex items-start gap-3">
                  <span className="mt-1 text-highlight" aria-hidden>
                    ✦
                  </span>
                  {highlight}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionHeading title={t.tours.itinerary} />
            <ol className="flex flex-col">
              {itineraryFor(tour).map((day, i) => (
                <li key={i} className="grid gap-2 border-t border-line py-6 sm:grid-cols-[8rem_1fr]">
                  <span className="heading text-xl text-accent">
                    {fill(t.tours.day, { number: i + 1 })}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{day.title[locale]}</h3>
                    <p className="mt-1 text-muted">{day.description[locale]}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="grid gap-8 sm:grid-cols-[1.6fr_1fr]">
            <div>
              <h2 className="heading mb-4 text-2xl">{t.included.title}</h2>
              <ul className="grid gap-3">
                {t.included.items.map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <span className="text-success" aria-hidden>
                      ✓
                    </span>
                    <span>
                      <span className="font-medium">{item.title}</span>
                      <span className="block text-sm text-muted">{item.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="heading mb-4 text-2xl">{t.included.notIncludedTitle}</h2>
              <ul className="grid gap-2 text-sm text-muted">
                {t.included.notIncluded.map((item) => (
                  <li key={item}>— {item}</li>
                ))}
                <li>— {fill(t.tours.minAge, { age: tour.minAge })}</li>
              </ul>
            </div>
          </section>

          <section className="rounded-card border border-warning/40 bg-warning/10 p-6">
            <h2 className="heading mb-2 text-2xl">{t.weather.title}</h2>
            <p className="text-sm">{t.weather.body}</p>
          </section>

          <section>
            <SectionHeading title={t.tours.whereYouStay} action={{ href: `${localePath(locale, routes.ecoCabins)}#${tour.location}`, label: t.nav.ecoCabins }} />
            <div className="grid gap-4 sm:grid-cols-3">
              {cabinsAt(tour.location).map((cabin) => (
                <div key={cabin.id} className="flex flex-col gap-2">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-card">
                    <Photo name={cabin.image} alt="" sizes="(min-width: 640px) 20vw, 100vw" />
                  </div>
                  <p className="font-semibold">{cabin.name[locale]}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside id="departures" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
          <Suspense fallback={<div className="card h-[32rem] animate-pulse" />}>
            <TourDepartures tour={tour} searchParams={searchParams} locale={locale} t={t} />
          </Suspense>
          <div className="mt-4 rounded-card bg-sunken p-5 text-sm">
            <p className="font-semibold">{t.tours.private.title}</p>
            <p className="mt-1 text-muted">{t.tours.private.body}</p>
            <Link href={localePath(locale, routes.contact)} className="mt-3 inline-block font-semibold underline underline-offset-4">
              {t.tours.private.cta}
            </Link>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="container-page pb-24">
          <SectionHeading title={t.tours.otherTours} action={{ href: localePath(locale, routes.tours), label: t.common.viewAll }} />
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((other) => (
              <TourCard key={other.slug} tour={other} locale={locale} t={t} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

async function TourDepartures({
  tour,
  searchParams,
  locale,
  t,
}: {
  tour: Tour;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  locale: Locale;
  t: Dictionary;
}) {
  await connection();
  const now = new Date();
  const query = await searchParams;
  const search = parseTripSearch(query, now);
  const departures = await listDepartures({ tourSlug: tour.slug });

  return (
    <DeparturePicker
      locale={locale}
      months={upcomingMonths(now)}
      departures={departures.map(({ departure, spotsLeft, status }) => ({
        id: departure.id,
        startDate: departure.startDate,
        endDate: departure.endDate,
        spotsLeft,
        status,
        isPeak: departure.isPeak,
        pricePerPerson: departure.pricePerPerson,
      }))}
      basePrice={tour.basePrice}
      maxGuests={tour.maxGuests}
      initial={{
        month: search.month,
        departureId: typeof query.departure === "string" ? query.departure : null,
        guests: search.guests,
      }}
      bookPath={localePath(locale, "/book/")}
      copy={{ tours: t.tours, common: t.common }}
    />
  );
}
