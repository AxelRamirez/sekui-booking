import { Photo } from "@/components/ui/Photo";
import { priceLineLabel } from "@/lib/booking/labels";
import type { Booking, Departure } from "@/lib/booking/types";
import { getAddon } from "@/lib/content/addons";
import { site } from "@/lib/content/site";
import { getTour } from "@/lib/content/tours";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { fill, formatDate, formatMoney, plural } from "@/lib/i18n/format";

/** Read-only trip details shared by confirmation, checkout and "My trip" pages. */
export function TripSummary({
  booking,
  departure,
  locale,
  t,
  showLines = true,
}: {
  booking: Booking;
  departure: Departure;
  locale: Locale;
  t: Dictionary;
  showLines?: boolean;
}) {
  const tour = getTour(booking.tourSlug);
  const longDate = (date: string) => formatDate(date, locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="flex flex-col gap-5">
      {tour && (
        <div className="flex items-center gap-4">
          <span className="relative size-16 shrink-0 overflow-hidden rounded-xl">
            <Photo name={tour.image} alt="" sizes="64px" />
          </span>
          <div>
            <p className="heading text-2xl">{tour.name[locale]}</p>
            <p className="text-sm text-muted">
              {fill(t.common.daysNights, { days: tour.days, nights: tour.nights })} · {site.location[locale]}
            </p>
          </div>
        </div>
      )}
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="label">{t.booking.departure}</dt>
          <dd className="font-semibold capitalize">{longDate(departure.startDate)}</dd>
          <dd className="text-sm text-muted">{site.airport[locale]}</dd>
        </div>
        <div>
          <dt className="label">{t.booking.return}</dt>
          <dd className="font-semibold capitalize">{longDate(departure.endDate)}</dd>
        </div>
        <div>
          <dt className="label">{t.myTrip.travelers}</dt>
          <dd className="font-semibold">{plural(t.common.travelers, booking.guests, locale)}</dd>
        </div>
        {booking.addons.length > 0 && (
          <div>
            <dt className="label">{t.booking.addons}</dt>
            <dd className="text-sm">{booking.addons.map((a) => getAddon(a.id)?.name[locale]).join(", ")}</dd>
          </div>
        )}
      </dl>
      {showLines && (
        <div className="border-t border-line pt-4">
          <ul className="flex flex-col gap-1.5 text-sm">
            {booking.quote.lines.map((line, i) => (
              <li key={i} className="flex justify-between gap-4">
                <span className="text-muted">{priceLineLabel(line, t.booking.priceLines, locale)}</span>
                <span>{formatMoney(line.amount, locale)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
            <span className="font-semibold">{t.common.total}</span>
            <span className="heading text-2xl">{formatMoney(booking.quote.total, locale)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
