"use client";

import Link from "next/link";
import { useState } from "react";
import type { AvailabilityStatus } from "@/lib/booking/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { fill, formatDateRange, formatMoney, formatMonth, plural } from "@/lib/i18n/format";

export interface PickerDeparture {
  id: string;
  startDate: string;
  endDate: string;
  spotsLeft: number;
  status: AvailabilityStatus;
  isPeak: boolean;
  pricePerPerson: number;
}

const isOpen = (d: PickerDeparture) => d.status === "available" || d.status === "limited";

/** Month → departure → travelers. The only place where tour prices are shown. */
export function DeparturePicker({
  locale,
  months,
  departures,
  basePrice,
  maxGuests,
  initial,
  bookPath,
  copy,
}: {
  locale: Locale;
  /** Next 12 months as "YYYY-MM". */
  months: string[];
  departures: PickerDeparture[];
  basePrice: number;
  maxGuests: number;
  initial: { month: string | null; departureId: string | null; guests: number };
  /** Booking URL without the departure id, e.g. "/en/book/". */
  bookPath: string;
  copy: { tours: Dictionary["tours"]; common: Dictionary["common"] };
}) {
  const openCount = (month: string) => departures.filter((d) => d.startDate.startsWith(month) && isOpen(d)).length;
  const preselected = departures.find((d) => d.id === initial.departureId && isOpen(d));
  const [month, setMonth] = useState(
    () =>
      preselected?.startDate.slice(0, 7) ??
      (initial.month && openCount(initial.month) > 0 ? initial.month : null) ??
      months.find((m) => openCount(m) > 0) ??
      months[0],
  );
  const [selectedId, setSelectedId] = useState<string | null>(preselected?.id ?? null);
  const [guests, setGuests] = useState(Math.min(initial.guests, maxGuests));

  const inMonth = departures.filter((d) => d.startDate.startsWith(month));
  const selected = departures.find((d) => d.id === selectedId) ?? null;
  const maxForSelection = Math.min(maxGuests, selected?.spotsLeft ?? maxGuests);
  const travelers = Math.min(guests, maxForSelection);
  const price = selected?.pricePerPerson ?? Math.min(basePrice, ...inMonth.filter(isOpen).map((d) => d.pricePerPerson));
  const money = (amount: number) => formatMoney(amount, locale);
  const t = copy.tours;

  return (
    <div className="card flex flex-col gap-5 p-5 sm:p-6">
      <div>
        <p>
          <span className="heading text-4xl">{money(price)}</span>
        </p>
        <p className="text-sm text-muted">{t.pricePerPerson}</p>
      </div>

      <div>
        <p className="label">{t.chooseMonth}</p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {months.map((key) => {
            const count = openCount(key);
            const active = key === month;
            return (
              <button
                key={key}
                type="button"
                disabled={count === 0}
                onClick={() => {
                  setMonth(key);
                  setSelectedId(null);
                }}
                aria-pressed={active}
                className={`shrink-0 rounded-control border px-3 py-1.5 text-sm capitalize transition ${
                  active ? "border-accent bg-accent text-accent-fg" : "border-line hover:border-fg"
                } disabled:cursor-not-allowed disabled:opacity-35`}
              >
                {formatMonth(key, locale).replace(/ de /, " ")}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="label">{t.departures}</p>
        {inMonth.length === 0 || openCount(month) === 0 ? (
          <p className="rounded-xl bg-sunken p-4 text-sm text-muted">{t.noDeparturesMonth}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {inMonth.map((departure) => {
              const open = isOpen(departure);
              return (
                <label key={departure.id} className={`choice flex items-center justify-between gap-3 !p-3 ${open ? "" : "line-through"}`}>
                  <input
                    type="radio"
                    name="departure"
                    value={departure.id}
                    checked={selectedId === departure.id}
                    disabled={!open}
                    onChange={() => setSelectedId(departure.id)}
                    className="sr-only"
                  />
                  <span>
                    <span className="block text-sm font-semibold">{formatDateRange(departure.startDate, departure.endDate, locale)}</span>
                    <span className={`text-xs ${departure.status === "limited" ? "text-warning" : "text-muted"}`}>
                      {open ? plural(copy.common.spotsLeft, departure.spotsLeft, locale) : copy.common.availability[departure.status]}
                      {departure.isPeak && open && ` · ${copy.common.peak}`}
                    </span>
                  </span>
                  <span className="text-sm font-medium">{money(departure.pricePerPerson)}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <label>
        <span className="label">{t.travelers}</span>
        <select value={travelers} onChange={(e) => setGuests(Number(e.target.value))} className="field">
          {Array.from({ length: maxForSelection }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {plural(copy.common.travelers, n, locale)}
            </option>
          ))}
        </select>
      </label>

      {selected && (
        <div className="flex items-end justify-between border-t border-line pt-4">
          <span className="text-sm text-muted">
            {money(selected.pricePerPerson)} × {travelers}
          </span>
          <span className="heading text-2xl">{money(selected.pricePerPerson * travelers)}</span>
        </div>
      )}

      {selected ? (
        <Link href={`${bookPath}${selected.id}?guests=${travelers}`} className="btn btn-primary w-full">
          {t.reserve}
        </Link>
      ) : (
        <span className="btn btn-primary w-full" aria-disabled="true">
          {t.reserve}
        </span>
      )}
      {!selected && <p className="-mt-2 text-center text-xs text-muted">{t.selectDeparture}</p>}
      <p className="text-center text-xs text-muted">{fill(copy.common.maxGroup, { count: maxGuests })}</p>
    </div>
  );
}
