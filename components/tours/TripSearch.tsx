import { tours } from "@/lib/content/tours";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { monthName, plural } from "@/lib/i18n/format";
import { localePath, routes } from "@/lib/i18n/paths";

const MAX_TRAVELERS = 10;

interface TripSearchProps {
  locale: Locale;
  t: Dictionary;
  /** "glass": frosted panel over imagery · "stack": vertical card · "bar": inline row. */
  variant?: "glass" | "stack" | "bar";
  submitLabel?: string;
}

/**
 * Month + tour search. Sends a month number ("3" = next March) to the calendar,
 * so it stays fully static. Plain GET form — works without JavaScript.
 */
export function TripSearch({ locale, t, variant = "bar", submitLabel }: TripSearchProps) {
  const glass = variant === "glass";
  const label = glass ? "mb-1 block text-[11px] tracking-wide text-white/70 uppercase" : "label";
  const field = glass
    ? "w-full border-0 border-b border-white/30 bg-transparent px-0 py-2 text-sm text-white outline-none focus:border-white"
    : "field";
  const option = glass ? "text-neutral-900" : undefined;

  const fields = (
    <>
      <label className="flex flex-col">
        <span className={label}>{t.search.month}</span>
        <select name="month" defaultValue="" className={field}>
          <option value="" className={option}>
            {t.search.anyMonth}
          </option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <option key={month} value={month} className={option}>
              {monthName(month, locale)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col">
        <span className={label}>{t.search.tour}</span>
        <select name="tour" defaultValue="" className={field}>
          <option value="" className={option}>
            {t.search.anyTour}
          </option>
          {tours.map((tour) => (
            <option key={tour.slug} value={tour.slug} className={option}>
              {tour.name[locale]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col">
        <span className={label}>{t.search.guests}</span>
        <select name="guests" defaultValue="2" className={field}>
          {Array.from({ length: MAX_TRAVELERS }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n} className={option}>
              {plural(t.common.travelers, n, locale)}
            </option>
          ))}
        </select>
      </label>
    </>
  );
  const action = localePath(locale, routes.calendar);

  if (glass) {
    return (
      <form action={action} className="glass rounded-card p-5 text-white sm:p-7">
        <div className="mb-5">
          <p className="heading text-2xl">{t.search.title}</p>
          <p className="text-xs text-white/70">{t.search.subtitle}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">{fields}</div>
        <button type="submit" className="mt-6 w-full rounded-full bg-bg py-3 text-sm font-semibold text-fg transition hover:bg-white">
          {submitLabel ?? t.search.submit}
        </button>
      </form>
    );
  }

  if (variant === "stack") {
    return (
      <form action={action} className="flex flex-col gap-4">
        {fields}
        <button type="submit" className="btn btn-primary mt-2 w-full">
          {submitLabel ?? t.search.submit}
        </button>
      </form>
    );
  }

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2 sm:items-end lg:grid-cols-[1fr_1.4fr_1fr_auto]">
      {fields}
      <button type="submit" className="btn btn-primary">
        {submitLabel ?? t.search.submit}
      </button>
    </form>
  );
}
