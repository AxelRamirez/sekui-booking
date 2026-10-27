# Sekui — all-inclusive tours in Agua Verde (demo)

A demo booking site for **Sekui**: all-inclusive tour packages in Agua Verde, Baja California Sur. Sekui has cabins in two places, Agua Verde (BCS) and Valle de Guadalupe (BC); the tours are based in Agua Verde. Each package includes the airport transfer from Loreto, lodging in Sekui eco-cabins and guided activities. All content is **dummy data**, so the client can review the full flow before content and admin move to Supabase.

- **Three languages (i18n)**: English, Spanish and French, with a locale prefix in every URL (`/en`, `/es`, `/fr`). The browser language is detected on the first visit and the choice is remembered.
- **One design**: sand/teal palette, Outfit type and rounded corners, with a video hero and booking panel, a large statement section, About with stats, tour collection and a dark footer with a giant wordmark. All colors and type are tokens in `app/globals.css`.
- **Tour booking engine (Akampa-style)**:
  - 12 tours with fixed departures and a maximum of 10 travelers each.
  - Visitors choose the **month** they want to travel, then a tour and a departure.
  - **Prices only appear on the tour page.**
  - Full departures show as sold out and can't be booked.
  - Spots are held while the guest pays.
  - Pay in full or with a 30% deposit.
  - Confirmation emails, self-service departure changes and cancellation with automatic refunds, and an `.ics` download.
- **Looping hero video**: a short placeholder clip served from `public/media`. Mobile gets a 0.5 MB version and desktop a 2.5 MB one. A poster image paints instantly, playback pauses off-screen, and the video is skipped when the visitor prefers reduced motion.
- **Stripe sandbox checkout**, or a built-in simulated checkout when no keys are set.
- **Back office** at `/en/admin`: bookings, departure occupancy, sent emails, contact messages, and a demo-data reset.

All code is in English. Built with Next.js 16 (App Router, Cache Components, Proxy), React 19, Tailwind CSS 4, Zod and Stripe.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — add Stripe sandbox keys
npm run dev
```

Open http://localhost:3000. You'll be redirected to `/en`, `/es` or `/fr`.

### Demo walkthrough

1. **Choose a month**: use the panel in the hero, or go to _Calendar_. Pick a month and, optionally, a tour. You'll see every departure with spots left; there are no prices at this step.
2. **Open a tour**: see the itinerary, what's included, the weather notice, the eco-cabins and the **price per person**. Pick a month, a departure and the number of travelers.
3. **Book**: complete the 3-step form (travelers & add-ons → traveler details → payment plan).
4. **Pay**: with Stripe keys, use test card `4242 4242 4242 4242`. Without keys, the simulated checkout appears; it can also simulate a declined card.
5. **Manage**: go to _My trip_. Demo bookings are preloaded: `SEK-DEMO01` (paid in full) and `SEK-DEMO02` (deposit paid), both with `demo@example.com`. From there you can pay the balance, change departure or cancel.

Old design-preview links from the review phase (`/en/hybrid/…`, `?design=…`) redirect to the normal URLs.

## Stripe (sandbox)

1. Copy your test keys from https://dashboard.stripe.com/test/apikeys into `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
2. Optional but recommended: forward webhooks so async payment events also reach the app.
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   # copy the whsec_... it prints into STRIPE_WEBHOOK_SECRET
   ```
   The confirmation page also checks the Checkout Session directly, so bookings confirm even when no webhook is running.

Payments are charged in MXN. Refunds for departure changes and cancellations go through the Stripe Refunds API.

## Tours and booking rules

Tours live in `lib/content/tours.ts`: location, name, itinerary, season months, departure weekdays, price and max group size. Cabin locations live in `lib/content/locations.ts`, and the cabins at each one in `lib/content/eco-cabins.ts`. Each tour page shows the cabins of its own location. Departures are generated for the next 12 months and stored in the database, which is the part that will become admin-managed (Supabase). Rules live in `lib/booking/policies.ts`:

| Rule | Default |
| --- | --- |
| Group size | 10 travelers per departure |
| Booking cutoff | 7 days before departure |
| Hold while paying | 35 min (matches the Stripe session expiry) |
| Payment plans | Pay in full · 30% deposit (departures > 30 days away), balance due 21 days before |
| Departure changes | Same tour, free ≥ 30 days before, MXN 1,500 fee 15–29 days before, max 2 changes |
| Cancellation refund | 100% ≥ 45 days · 50% 30–44 days · 0% < 30 days |
| Weather | Activities depend on conditions; weather cancellations → free change or full refund |

## Project structure

```
proxy.ts                      Locale detection and redirect
app/
  [lang]/                     All pages (lang is the root param)
    tours/[slug]/             Tour page with month/departure picker (the only place with prices)
    calendar/                 Departures by month
    eco-cabins/               Lodging included in every package
    book/[departureId]/       Booking form
    booking/confirmation/     Post-payment confirmation
    checkout/simulated/       Fake checkout used when Stripe keys are missing
    my-trip/[code]/…          Manage, change departure, cancel
    admin/                    Demo back office
  actions/                    Server Actions (booking, leads, admin)
  api/stripe/webhook/         Stripe webhook
  api/bookings/[code]/calendar/  .ics download
components/                   UI components
lib/
  booking/                    Domain: pricing, availability, schedule, policies, service
  content/                    Dummy content (tours, locations, cabins, add-ons, reviews, FAQ, brand, images/video)
  db/                         JSON-file store + seed (departures and demo bookings)
  email/                      Transactional emails (stored in the outbox)
  i18n/                       Locales, dictionaries (en/es/fr), formatting helpers
  payments/                   Stripe provider + checkout orchestration
public/media/                 Hero video (mobile + desktop) and poster
```

### How routing works

Public URLs look like `/fr/tours/kayak-islands`. The language is the root route param, so every page is prerendered statically for each language. Live data (departures, spots, bookings) streams in through `<Suspense>`.

To add another language, add it to `lib/i18n/config.ts` and create its dictionary in `lib/i18n/dictionaries/`. TypeScript then flags every piece of content in `lib/content/` that still needs a translation.

### Data

The demo stores everything in `.data/db.json`. The file is created on first request, with 12 months of departures (some partially booked or sold out) and two demo bookings. Delete it, or use **Reset demo data** in the admin, to start fresh.

On serverless hosts the file goes to `/tmp` and doesn't persist between instances. For the real deployment, swap `lib/db/store.ts` for Supabase. The rest of the app only uses `readDb`/`mutateDb`.

Emails go to a local outbox (visible in the admin) and are logged to the console. To send real emails, plug a provider such as Resend or SES into `lib/email/send.ts`.

## Content

The tours, prices, stats, reviews and contact details are placeholders. Photos come from Unsplash. The hero clip is a free Mixkit stock video; replace `public/media/hero-*.mp4` and `hero-poster.jpg` with the client's footage. Keep the mobile file under about 1 MB and the desktop file under about 3 MB, H.264, with no audio track.
