import { addDays, parseDate, toDateString } from "@/lib/booking/dates";
import { quote, resolveAddons } from "@/lib/booking/pricing";
import { buildSchedule } from "@/lib/booking/schedule";
import type { Booking, Departure, Payment } from "@/lib/booking/types";
import type { AddonId } from "@/lib/content/addons";
import { tours, type TourSlug } from "@/lib/content/tours";
import type { Database } from "./store";

export const SCHEMA_VERSION = 3;
const SEASON_WINDOW_MONTHS = 12;

/** Deterministic PRNG so every fresh database looks the same. */
function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function isPeakDate(date: string): boolean {
  const md = date.slice(5);
  return md >= "12-18" || md <= "01-06" || (md >= "03-20" && md <= "04-05");
}

/** Generates fixed departures for every tour over the next 12 months. */
function seedDepartures(now: Date): Departure[] {
  const start = toDateString(now);
  const end = toDateString(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + SEASON_WINDOW_MONTHS, 1)));
  const departures: Departure[] = [];

  for (const tour of tours) {
    let count = 0;
    for (let date = addDays(start, 1); date < end; date = addDays(date, 1)) {
      const d = parseDate(date);
      if (!tour.seasonMonths.includes(d.getUTCMonth() + 1)) continue;
      if (!tour.departureWeekdays.includes(d.getUTCDay())) continue;

      const id = `${tour.slug}_${date}`;
      const random = seededRandom(id);
      const roll = random();
      // Nearer departures are busier, like a real calendar.
      const busy = count++ < 2 ? 3 : 0;
      const blocked =
        roll < 0.12
          ? tour.maxGuests
          : roll < 0.32
            ? tour.maxGuests - 1 - Math.floor(random() * 3)
            : Math.min(tour.maxGuests - 4, Math.floor(random() * 6) + busy);
      const peak = isPeakDate(date);

      departures.push({
        id,
        tourSlug: tour.slug,
        startDate: date,
        endDate: addDays(date, tour.days - 1),
        capacity: tour.maxGuests,
        blockedSpots: blocked,
        pricePerPerson: Math.round((tour.basePrice * (peak ? 1.15 : 1)) / 100) * 100,
        isPeak: peak,
        status: "scheduled",
      });
    }
  }

  return departures.sort((a, b) => a.startDate.localeCompare(b.startDate) || a.tourSlug.localeCompare(b.tourSlug));
}

interface DemoSpec {
  code: string;
  token: string;
  tour: TourSlug;
  minDaysAhead: number;
  guests: number;
  plan: Booking["paymentPlan"];
  addonIds: AddonId[];
  lead: Booking["leadGuest"];
}

/** Sample bookings so "My trip" can be demoed without paying first. */
const demoSpecs: DemoSpec[] = [
  {
    code: "SEK-DEMO01",
    token: "demo-token-0001",
    tour: "agua-verde-essentials",
    minDaysAhead: 50,
    guests: 2,
    plan: "full",
    addonIds: ["private-cabin"],
    lead: { firstName: "Sofía", lastName: "Hernández", email: "demo@example.com", phone: "+52 55 1234 5678", country: "MX" },
  },
  {
    code: "SEK-DEMO02",
    token: "demo-token-0002",
    tour: "kayak-islands",
    minDaysAhead: 70,
    guests: 3,
    plan: "deposit",
    addonIds: ["photo-package"],
    lead: { firstName: "James", lastName: "Carter", email: "demo@example.com", phone: "+1 415 555 0134", country: "US" },
  },
];

function seedDemoBookings(departures: Departure[], now: Date): { bookings: Booking[]; payments: Payment[] } {
  const bookings: Booking[] = [];
  const payments: Payment[] = [];
  const today = toDateString(now);
  const createdAt = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();

  for (const spec of demoSpecs) {
    const departure = departures.find(
      (d) =>
        d.tourSlug === spec.tour &&
        d.startDate >= addDays(today, spec.minDaysAhead) &&
        d.capacity - d.blockedSpots >= spec.guests + 2,
    );
    if (!departure) continue;

    const bookingQuote = quote({ pricePerPerson: departure.pricePerPerson, guests: spec.guests, addonIds: spec.addonIds });
    const [firstInstallment] = buildSchedule({
      plan: spec.plan,
      total: bookingQuote.total,
      bookedOn: createdAt.slice(0, 10),
      departureDate: departure.startDate,
    });

    bookings.push({
      code: spec.code,
      accessToken: spec.token,
      status: "confirmed",
      locale: "en",
      tourSlug: spec.tour,
      departureId: departure.id,
      guests: spec.guests,
      leadGuest: spec.lead,
      travelers: Array.from({ length: spec.guests }, (_, i) => ({
        fullName: i === 0 ? `${spec.lead.firstName} ${spec.lead.lastName}` : `Guest ${i + 1}`,
        dietary: "",
      })),
      addons: resolveAddons(spec.addonIds, spec.guests),
      notes: "",
      paymentPlan: spec.plan,
      quote: bookingQuote,
      extraFees: 0,
      holdExpiresAt: null,
      rescheduleCount: 0,
      history: [
        { at: createdAt, type: "created" },
        { at: createdAt, type: "payment_succeeded", data: { amount: firstInstallment.amount } },
        { at: createdAt, type: "confirmed" },
      ],
      createdAt,
      confirmedAt: createdAt,
      cancelledAt: null,
      isDemo: true,
    });
    payments.push({
      id: `pay_demo_${spec.code}`,
      bookingCode: spec.code,
      purpose: "initial",
      amount: firstInstallment.amount,
      refundedAmount: 0,
      status: "succeeded",
      provider: "simulated",
      checkoutSessionId: null,
      paymentIntentId: null,
      createdAt,
      paidAt: createdAt,
    });
  }

  return { bookings, payments };
}

export function createSeedDatabase(now: Date): Database {
  const departures = seedDepartures(now);
  const { bookings, payments } = seedDemoBookings(departures, now);
  return {
    schemaVersion: SCHEMA_VERSION,
    seededAt: now.toISOString(),
    departures,
    bookings,
    payments,
    emails: [],
    inquiries: [],
    subscribers: [],
  };
}
