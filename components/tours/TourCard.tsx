import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import type { Tour } from "@/lib/content/tours";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { fill, seasonLabel } from "@/lib/i18n/format";
import { localePath, routes } from "@/lib/i18n/paths";

export function tourFacts(tour: Tour, t: Dictionary): string {
  return [
    fill(t.common.daysNights, { days: tour.days, nights: tour.nights }),
    fill(t.common.maxGroup, { count: tour.maxGuests }),
    t.difficulty[tour.difficulty],
  ].join(" · ");
}

/** Tour teaser. Prices are intentionally shown only on the tour page. */
export function TourCard({ tour, locale, t }: { tour: Tour; locale: Locale; t: Dictionary }) {
  const name = tour.name[locale];

  return (
    <Link href={localePath(locale, routes.tour(tour.slug))} className="group flex flex-col gap-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-card">
        <Photo name={tour.image} alt={name} sizes="(min-width: 1024px) 33vw, 100vw" className="transition duration-700 group-hover:scale-105" />
        <span className="absolute top-4 left-4 rounded-full bg-bg/90 px-3 py-1 text-[11px] font-medium text-fg">
          {t.categories[tour.category]} · {seasonLabel(tour.seasonMonths, locale)}
        </span>
        <span className="absolute right-4 bottom-4 flex size-10 items-center justify-center rounded-full bg-bg text-fg transition group-hover:rotate-45">
          ↗
        </span>
      </div>
      <div className="flex flex-col gap-1 px-1">
        <h3 className="heading text-3xl">{name}</h3>
        <p className="text-xs tracking-wide text-muted uppercase">{tourFacts(tour, t)}</p>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{tour.summary[locale]}</p>
      </div>
    </Link>
  );
}
