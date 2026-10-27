import Link from "next/link";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { Photo } from "@/components/ui/Photo";
import { isOpen, type DepartureAvailability } from "@/lib/booking/availability";
import { tripQuery } from "@/lib/booking/search-params";
import { getTour } from "@/lib/content/tours";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { fill, formatDate, formatDateRange, plural } from "@/lib/i18n/format";
import { localePath, routes } from "@/lib/i18n/paths";

/** Departures for a month, Akampa-style. No prices: the tour page shows them. */
export function DepartureList({
  items,
  locale,
  t,
  guests,
}: {
  items: DepartureAvailability[];
  locale: Locale;
  t: Dictionary;
  guests?: number;
}) {
  if (items.length === 0) {
    return <p className="card p-8 text-center text-muted">{t.calendar.noResults}</p>;
  }

  return (
    <ul className="grid gap-3">
      {items.map((item) => {
        const { departure, status, spotsLeft } = item;
        const tour = getTour(departure.tourSlug)!;
        const open = isOpen(item);
        const href = localePath(locale, routes.tour(tour.slug)) + tripQuery({ departure: departure.id, guests });
        return (
          // Mobile: date + details on top, availability + action below. Desktop: one row.
          <li
            key={departure.id}
            className={`card grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 p-4 md:flex md:gap-6 ${open ? "" : "opacity-60"}`}
          >
            <div className="relative hidden size-20 shrink-0 overflow-hidden rounded-xl md:block">
              <Photo name={tour.image} alt="" sizes="80px" />
            </div>
            <div className="flex w-14 shrink-0 flex-col items-center text-center">
              <span className="text-[11px] text-muted uppercase">{formatDate(departure.startDate, locale, { weekday: "short" })}</span>
              <span className="heading text-3xl leading-none">{formatDate(departure.startDate, locale, { day: "numeric" })}</span>
              <span className="text-xs text-muted uppercase">{formatDate(departure.startDate, locale, { month: "short" })}</span>
            </div>
            <div className="min-w-0 md:flex-1">
              <p className="heading line-clamp-2 text-xl leading-tight">{tour.name[locale]}</p>
              <p className="mt-1 text-sm text-muted">
                {formatDateRange(departure.startDate, departure.endDate, locale)} ·{" "}
                {fill(t.common.daysNights, { days: tour.days, nights: tour.nights })}
                {departure.isPeak && <span className="text-highlight"> · {t.common.peak}</span>}
              </p>
            </div>
            <div className="col-span-2 flex items-center justify-between gap-3 border-t border-line pt-3 md:ml-auto md:gap-6 md:border-0 md:pt-0">
              <div className="flex flex-col items-start gap-1 md:items-end">
                <AvailabilityBadge status={status} label={t.common.availability[status]} />
                {open && <span className="text-xs text-muted">{plural(t.common.spotsLeft, spotsLeft, locale)}</span>}
              </div>
              {open ? (
                <Link href={href} className="btn btn-primary btn-sm">
                  {t.calendar.viewTour}
                </Link>
              ) : (
                <span className="btn btn-outline btn-sm" aria-disabled="true">
                  {t.common.availability[status]}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
