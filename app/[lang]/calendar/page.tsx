import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { DepartureList } from "@/components/tours/DepartureList";
import { PageHeader } from "@/components/ui/PageHeader";
import { isOpen } from "@/lib/booking/availability";
import { parseTripSearch, tripQuery, upcomingMonths } from "@/lib/booking/search-params";
import { listDepartures, openDeparturesByMonth } from "@/lib/booking/service";
import { tours } from "@/lib/content/tours";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatMonth, plural } from "@/lib/i18n/format";
import { localePath, routes } from "@/lib/i18n/paths";
import { getDictionary, getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.calendar.title, description: t.calendar.subtitle };
}

export default async function CalendarPage({ searchParams }: PageProps<"/[lang]/calendar">) {
  const { locale, t } = await getI18n();

  return (
    <>
      <PageHeader title={t.calendar.title} subtitle={t.calendar.subtitle} />
      <div className="container-page pb-24">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-sunken" />}>
          <MonthCalendar searchParams={searchParams} locale={locale} t={t} />
        </Suspense>
      </div>
    </>
  );
}

async function MonthCalendar({
  searchParams,
  locale,
  t,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  locale: Locale;
  t: Dictionary;
}) {
  await connection();
  const now = new Date();
  const search = parseTripSearch(await searchParams, now);
  const months = upcomingMonths(now);
  const counts = await openDeparturesByMonth(search.tour);
  const month = search.month ?? months.find((m) => (counts[m] ?? 0) > 0) ?? months[0];
  const items = await listDepartures({ month, tourSlug: search.tour });
  // Open departures first, sold out at the end; both by date.
  const sorted = [...items.filter(isOpen), ...items.filter((item) => !isOpen(item))];
  const link = (next: { month?: string; tour?: string | null }) =>
    localePath(locale, routes.calendar) +
    tripQuery({ month: next.month ?? month, tour: next.tour === undefined ? search.tour : next.tour, guests: search.guests });

  return (
    <div className="flex flex-col gap-8">
      <nav aria-label={t.search.month} className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 pb-2">
        {months.map((key) => {
          const count = counts[key] ?? 0;
          const active = key === month;
          return (
            <Link
              key={key}
              href={link({ month: key })}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 flex-col items-center rounded-card border px-4 py-2 text-sm transition ${
                active ? "border-accent bg-accent text-accent-fg" : "border-line hover:border-fg"
              } ${count === 0 && !active ? "opacity-40" : ""}`}
            >
              <span className="font-semibold first-letter:uppercase">{formatMonth(key, locale).replace(/ de /, " ")}</span>
              <span className="text-xs opacity-80">{plural(t.calendar.count, count, locale)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 pb-2 md:flex-wrap md:overflow-visible">
        <Link
          href={link({ tour: null })}
          scroll={false}
          className={`shrink-0 rounded-control border px-3 py-1.5 text-sm whitespace-nowrap ${!search.tour ? "border-fg bg-fg text-bg" : "border-line"}`}
        >
          {t.calendar.allTours}
        </Link>
        {tours.map((tour) => (
          <Link
            key={tour.slug}
            href={link({ tour: tour.slug })}
            scroll={false}
            className={`shrink-0 rounded-control border px-3 py-1.5 text-sm whitespace-nowrap ${search.tour === tour.slug ? "border-fg bg-fg text-bg" : "border-line"}`}
          >
            {tour.name[locale]}
          </Link>
        ))}
      </div>

      <DepartureList items={sorted} locale={locale} t={t} guests={search.guests} />
    </div>
  );
}
