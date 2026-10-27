"use client";

import Image from "next/image";
import { startTransition, useActionState, useMemo, useRef, useState } from "react";
import { startBooking } from "@/app/actions/booking";
import { initialFormState } from "@/app/actions/form-state";
import { priceLineLabel } from "@/lib/booking/labels";
import { quote } from "@/lib/booking/pricing";
import { buildSchedule } from "@/lib/booking/schedule";
import type { PaymentPlan, Traveler } from "@/lib/booking/types";
import type { AddonId } from "@/lib/content/addons";
import { photo, type PhotoKey } from "@/lib/content/images";
import { intlLocales, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { fill, formatDate, formatDateRange, formatMoney, plural } from "@/lib/i18n/format";

const COUNTRIES = ["MX", "US", "CA", "FR", "BE", "CH", "ES", "GB", "DE", "IT", "NL", "AR", "CO", "CL", "BR", "PE"];
/** Most likely country of residence for each site language. */
const DEFAULT_COUNTRY: Record<Locale, string> = { en: "US", es: "MX", fr: "FR" };
const STEPS = ["trip", "travelers", "payment"] as const;

interface BookingFormProps {
  locale: Locale;
  copy: { booking: Dictionary["booking"]; common: Dictionary["common"]; installments: Dictionary["myTrip"]["installments"] };
  today: string;
  stripeEnabled: boolean;
  policiesUrl: string;
  departure: { id: string; startDate: string; endDate: string; pricePerPerson: number; isPeak: boolean; spotsLeft: number };
  tour: { name: string; facts: string; image: PhotoKey };
  initialGuests: number;
  plans: PaymentPlan[];
  addons: { id: AddonId; name: string; description: string; price: number; unit: "person" | "booking" }[];
  limits: { holdMinutes: number; depositMinDays: number };
}

export function BookingForm({
  locale,
  copy,
  today,
  stripeEnabled,
  policiesUrl,
  departure,
  tour,
  initialGuests,
  plans,
  addons,
  limits,
}: BookingFormProps) {
  const b = copy.booking;
  const money = (amount: number) => formatMoney(amount, locale);
  const [state, dispatch, pending] = useActionState(startBooking, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const stepRefs = useRef<(HTMLFieldSetElement | null)[]>([]);

  const maxGuests = departure.spotsLeft;
  const [step, setStep] = useState(0);
  const [guests, setGuests] = useState(Math.max(1, Math.min(initialGuests, maxGuests)));
  const [addonIds, setAddonIds] = useState<AddonId[]>([]);
  const [lead, setLead] = useState({ firstName: "", lastName: "", email: "", phone: "", country: DEFAULT_COUNTRY[locale] });
  const [travelers, setTravelers] = useState<Traveler[]>(() =>
    Array.from({ length: Math.max(1, Math.min(initialGuests, maxGuests)) }, () => ({ fullName: "", dietary: "" })),
  );
  const [notes, setNotes] = useState("");
  const [plan, setPlan] = useState<PaymentPlan>(plans.includes("deposit") ? "deposit" : "full");
  const [terms, setTerms] = useState(false);

  const bookingQuote = useMemo(
    () => quote({ pricePerPerson: departure.pricePerPerson, guests, addonIds }),
    [departure.pricePerPerson, guests, addonIds],
  );
  const schedule = useMemo(
    () => buildSchedule({ plan, total: bookingQuote.total, bookedOn: today, departureDate: departure.startDate }),
    [plan, bookingQuote.total, today, departure.startDate],
  );
  const dueToday = schedule[0].amount;
  const countryNames = useMemo(() => new Intl.DisplayNames([intlLocales[locale]], { type: "region" }), [locale]);

  function changeGuests(next: number) {
    const value = Math.max(1, Math.min(maxGuests, next));
    setGuests(value);
    setTravelers((current) => Array.from({ length: value }, (_, i) => current[i] ?? { fullName: "", dietary: "" }));
  }

  function firstInvalid(index: number) {
    const fieldset = stepRefs.current[index];
    if (!fieldset) return null;
    return Array.from(fieldset.querySelectorAll<HTMLInputElement>("input, select, textarea")).find((el) => !el.checkValidity()) ?? null;
  }

  /** Validates every step before `index`; jumps to the first one with errors. */
  function validateUpTo(index: number): boolean {
    for (let i = 0; i < index; i++) {
      const invalid = firstInvalid(i);
      if (invalid) {
        setStep(i);
        requestAnimationFrame(() => invalid.reportValidity());
        return false;
      }
    }
    return true;
  }

  function goTo(index: number) {
    if (!validateUpTo(index)) return;
    setStep(index);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateUpTo(STEPS.length)) return;
    const formData = new FormData(event.currentTarget);
    // Dispatch manually so React doesn't reset the (controlled) form on error.
    startTransition(() => dispatch(formData));
  }

  const error = (field: string) =>
    state.fieldErrors?.[field] ? <p className="mt-1 text-sm text-danger">{state.fieldErrors[field]}</p> : null;
  const longDate = (date: string) => formatDate(date, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid scroll-mt-28 grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="departureId" value={departure.id} />

      <div className="flex flex-col gap-8">
        <ol className="grid grid-cols-3 gap-2">
          {STEPS.map((key, index) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => (index < step ? setStep(index) : goTo(index))}
                className={`flex w-full flex-col gap-2 text-left text-sm ${index <= step ? "text-fg" : "text-muted"}`}
                aria-current={index === step ? "step" : undefined}
              >
                <span className={`h-1 w-full rounded-full ${index <= step ? "bg-accent" : "bg-line"}`} />
                <span className="font-semibold">
                  {index + 1}. {b.steps[key]}
                </span>
              </button>
            </li>
          ))}
        </ol>

        {state.status === "error" && state.message && (
          <div role="alert" className="rounded-card border border-danger/40 bg-danger/10 p-4 text-danger">
            {state.message}
            {state.fieldErrors && (
              <ul className="mt-2 list-disc pl-5 text-sm">
                {Object.entries(state.fieldErrors).map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Step 1 — trip */}
        <fieldset ref={(el) => void (stepRefs.current[0] = el)} hidden={step !== 0} className="flex flex-col gap-8">
          <legend className="sr-only">{b.steps.trip}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-4">
              <p className="label">{b.departure}</p>
              <p className="text-lg font-semibold first-letter:uppercase">{longDate(departure.startDate)}</p>
            </div>
            <div className="card p-4">
              <p className="label">{b.return}</p>
              <p className="text-lg font-semibold first-letter:uppercase">{longDate(departure.endDate)}</p>
            </div>
          </div>

          <div>
            <p className="label">{b.guests}</p>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => changeGuests(guests - 1)} disabled={guests <= 1} className="btn btn-outline size-11 !p-0 text-xl" aria-label="−">
                −
              </button>
              <output className="heading w-10 text-center text-3xl">{guests}</output>
              <input type="hidden" name="guests" value={guests} />
              <button type="button" onClick={() => changeGuests(guests + 1)} disabled={guests >= maxGuests} className="btn btn-outline size-11 !p-0 text-xl" aria-label="+">
                +
              </button>
              <span className="text-sm text-muted">{plural(copy.common.spotsLeft, departure.spotsLeft, locale)}</span>
            </div>
          </div>

          <div>
            <p className="label">{b.addons}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {addons.map((addon) => (
                <label key={addon.id} className="choice flex gap-3">
                  <input
                    type="checkbox"
                    name="addons"
                    value={addon.id}
                    checked={addonIds.includes(addon.id)}
                    onChange={(e) => setAddonIds((current) => (e.target.checked ? [...current, addon.id] : current.filter((id) => id !== addon.id)))}
                    className="mt-1 size-4 accent-[var(--accent)]"
                  />
                  <span>
                    <span className="block font-semibold">{addon.name}</span>
                    <span className="block text-sm text-muted">{addon.description}</span>
                    <span className="mt-1 block text-sm">
                      {money(addon.price)} <span className="text-muted">{b.addonUnit[addon.unit]}</span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={() => goTo(1)} className="btn btn-primary">
              {copy.common.continue}
            </button>
          </div>
        </fieldset>

        {/* Step 2 — travelers */}
        <fieldset ref={(el) => void (stepRefs.current[1] = el)} hidden={step !== 1} className="flex flex-col gap-8">
          <legend className="heading mb-4 text-2xl">{b.leadGuest}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="label">{b.firstName}</span>
              <input name="firstName" required autoComplete="given-name" className="field" value={lead.firstName} onChange={(e) => setLead({ ...lead, firstName: e.target.value })} />
              {error("firstName")}
            </label>
            <label>
              <span className="label">{b.lastName}</span>
              <input name="lastName" required autoComplete="family-name" className="field" value={lead.lastName} onChange={(e) => setLead({ ...lead, lastName: e.target.value })} />
              {error("lastName")}
            </label>
            <label>
              <span className="label">{b.email}</span>
              <input name="email" type="email" required autoComplete="email" className="field" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} />
              {error("email")}
            </label>
            <label>
              <span className="label">{b.phone}</span>
              <input name="phone" type="tel" required autoComplete="tel" className="field" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} />
              {error("phone")}
            </label>
            <label className="sm:col-span-2">
              <span className="label">{b.country}</span>
              <select name="country" required className="field" value={lead.country} onChange={(e) => setLead({ ...lead, country: e.target.value })}>
                {COUNTRIES.map((code) => (
                  <option key={code} value={code}>
                    {countryNames.of(code)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <h3 className="heading mb-4 text-2xl">{b.travelers}</h3>
            {error("travelers")}
            <div className="flex flex-col gap-4">
              {travelers.map((traveler, i) => (
                <div key={i} className="grid gap-3 sm:grid-cols-2">
                  <label>
                    <span className="label">{fill(b.travelerName, { number: i + 1 })}</span>
                    <input
                      name={`traveler_${i}`}
                      required
                      className="field"
                      value={traveler.fullName}
                      placeholder={i === 0 ? `${lead.firstName} ${lead.lastName}`.trim() : undefined}
                      onFocus={() => {
                        if (i === 0 && !traveler.fullName && lead.firstName) {
                          setTravelers((current) => current.map((t, j) => (j === 0 ? { ...t, fullName: `${lead.firstName} ${lead.lastName}`.trim() } : t)));
                        }
                      }}
                      onChange={(e) => setTravelers((current) => current.map((t, j) => (j === i ? { ...t, fullName: e.target.value } : t)))}
                    />
                  </label>
                  <label>
                    <span className="label">
                      {b.dietary} <span className="font-normal">({copy.common.optional})</span>
                    </span>
                    <input
                      name={`dietary_${i}`}
                      className="field"
                      placeholder={b.dietaryPlaceholder}
                      value={traveler.dietary}
                      onChange={(e) => setTravelers((current) => current.map((t, j) => (j === i ? { ...t, dietary: e.target.value } : t)))}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <label>
            <span className="label">
              {b.notes} <span className="font-normal">({copy.common.optional})</span>
            </span>
            <textarea name="notes" rows={3} className="field" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(0)} className="btn btn-ghost">
              ← {copy.common.back}
            </button>
            <button type="button" onClick={() => goTo(2)} className="btn btn-primary">
              {copy.common.continue}
            </button>
          </div>
        </fieldset>

        {/* Step 3 — payment */}
        <fieldset ref={(el) => void (stepRefs.current[2] = el)} hidden={step !== 2} className="flex flex-col gap-8">
          <legend className="heading mb-4 text-2xl">{b.paymentPlan}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["full", "deposit"] as const).map((option) => (
              <label key={option} className="choice">
                <input
                  type="radio"
                  name="paymentPlan"
                  value={option}
                  checked={plan === option}
                  disabled={!plans.includes(option)}
                  onChange={() => setPlan(option)}
                  className="sr-only"
                />
                <span className="block font-semibold">{b.plans[option].title}</span>
                <span className="mt-1 block text-sm text-muted">{b.plans[option].body}</span>
              </label>
            ))}
          </div>
          {!plans.includes("deposit") && <p className="-mt-4 text-sm text-muted">{fill(b.plansUnavailable, { days: limits.depositMinDays })}</p>}

          <div className="card p-5">
            <p className="label">{b.schedule}</p>
            <ul className="divide-y divide-line">
              {schedule.map((item, i) => (
                <li key={item.key} className="flex justify-between py-2 text-sm">
                  <span>
                    {copy.installments[item.key]} <span className="text-muted">· {i === 0 ? b.dueToday : formatDate(item.dueDate, locale)}</span>
                  </span>
                  <span className="font-semibold">{money(item.amount)}</span>
                </li>
              ))}
            </ul>
          </div>

          <label className="flex items-start gap-3">
            <input type="checkbox" name="terms" required checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 size-4 accent-[var(--accent)]" />
            <span className="text-sm">
              {b.acceptTerms}{" "}
              <a href={policiesUrl} target="_blank" className="underline underline-offset-2">
                {b.viewPolicies}
              </a>
            </span>
          </label>
          {error("terms")}

          <div className="flex flex-col gap-2 text-sm text-muted">
            <p>{fill(b.holdNotice, { minutes: limits.holdMinutes })}</p>
            <p>{stripeEnabled ? b.redirectNotice : b.simulatedNotice}</p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button type="button" onClick={() => setStep(1)} className="btn btn-ghost">
              ← {copy.common.back}
            </button>
            <button type="submit" disabled={pending} className="btn btn-primary">
              {pending ? copy.common.loading : fill(b.pay, { amount: money(dueToday) })}
            </button>
          </div>
        </fieldset>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card overflow-hidden">
          <div className="relative aspect-[16/10]">
            <Image src={photo(tour.image, 800)} alt="" fill sizes="24rem" className="object-cover" />
          </div>
          <div className="flex flex-col gap-4 p-5">
            <div>
              <p className="heading text-2xl">{tour.name}</p>
              <p className="text-xs tracking-wide text-muted uppercase">{tour.facts}</p>
              <p className="mt-2 text-sm">
                {formatDateRange(departure.startDate, departure.endDate, locale)}
                {departure.isPeak && <span className="ml-2 text-highlight">· {copy.common.peak}</span>}
              </p>
            </div>
            <div>
              <p className="label">{b.summary}</p>
              <ul className="flex flex-col gap-1.5 text-sm">
                {bookingQuote.lines.map((line, i) => (
                  <li key={i} className="flex justify-between gap-4">
                    <span className="text-muted">{priceLineLabel(line, b.priceLines, locale)}</span>
                    <span>{money(line.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-end justify-between border-t border-line pt-3">
              <span className="font-semibold">{copy.common.total}</span>
              <span className="heading text-3xl">{money(bookingQuote.total)}</span>
            </div>
            <div className="flex justify-between rounded-control bg-sunken px-4 py-2 text-sm">
              <span>{b.dueToday}</span>
              <span className="font-semibold">{money(dueToday)}</span>
            </div>
          </div>
        </div>
      </aside>
    </form>
  );
}
