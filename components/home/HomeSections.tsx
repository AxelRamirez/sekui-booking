import Link from "next/link";
import { TourCard } from "@/components/tours/TourCard";
import { TripSearch } from "@/components/tours/TripSearch";
import { Photo } from "@/components/ui/Photo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cabinsAt } from "@/lib/content/eco-cabins";
import type { PhotoKey } from "@/lib/content/images";
import { locations } from "@/lib/content/locations";
import { reviews } from "@/lib/content/reviews";
import { site } from "@/lib/content/site";
import { getTour, tours } from "@/lib/content/tours";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { localePath, routes } from "@/lib/i18n/paths";
import { HeroVideo } from "./HeroVideo";

const moods: { key: keyof Dictionary["home"]["moods"]["items"]; image: PhotoKey }[] = [
  { key: "kayak", image: "paddleboard" },
  { key: "snorkel", image: "fishSchool" },
  { key: "whales", image: "whaleSurface" },
  { key: "hiking", image: "ridgeHiker" },
  { key: "stars", image: "milkyWay" },
];

const FEATURED_TOURS = 6;

/** All sections of the home page. */
export function HomeSections({ locale, t }: { locale: Locale; t: Dictionary }) {
  const h = t.home;
  const to = (path: string) => localePath(locale, path);
  const [featured, ...otherReviews] = reviews;
  const stats = [
    { value: `${site.stats.rating}★`, label: h.stats.rating },
    { value: site.stats.travelers, label: h.stats.travelers },
    { value: site.stats.tours, label: h.stats.tours },
  ];

  return (
    <>
      {/* Video hero with frosted search panel */}
      <section className="relative flex min-h-[94vh] flex-col justify-between overflow-hidden text-white">
        <HeroVideo />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-black/60" />
        <div className="relative container-page flex flex-col items-center pt-20 text-center sm:pt-28">
          <p className="mb-6 text-xs tracking-[0.25em] text-white/85 uppercase">{h.hero.eyebrow}</p>
          <h1 className="heading max-w-4xl text-5xl leading-[1] sm:text-7xl lg:text-[5.25rem]">{h.hero.title}</h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">{h.hero.subtitle}</p>
          <Link href={to(routes.tours)} className="mt-8 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition hover:opacity-90">
            {h.hero.cta} ↗
          </Link>
        </div>
        <div className="relative container-page pt-16 pb-8">
          <TripSearch locale={locale} t={t} variant="glass" />
        </div>
      </section>

      {/* Statement */}
      <section className="container-page py-24 text-center sm:py-32">
        <h2 className="statement mx-auto max-w-5xl text-4xl sm:text-6xl lg:text-7xl">{h.statement.title}</h2>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted sm:text-base">{h.statement.body}</p>
      </section>

      {/* Discover collage */}
      <section className="container-page grid items-center gap-12 pb-24 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <h2 className="heading text-6xl leading-[0.95] sm:text-7xl lg:text-8xl">
          {h.discover.title.split(/(?<=\.)\s+/).map((word) => (
            <span key={word} className="block">
              {word}
            </span>
          ))}
        </h2>
        <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-card sm:row-span-2">
            <Photo name="turquoiseIsland" alt="" sizes="(min-width: 1024px) 35vw, 60vw" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(["rockyCove", "milkyWay"] as const).map((image) => (
              <div key={image} className="relative aspect-square overflow-hidden rounded-2xl">
                <Photo name={image} alt="" sizes="15vw" />
              </div>
            ))}
          </div>
          <div className="col-span-2 flex flex-col justify-end gap-4 sm:col-span-1">
            <p className="text-sm leading-relaxed text-muted">{h.discover.body}</p>
            <Link href={to(routes.tours)} className="btn btn-outline btn-sm w-fit border-line">
              {h.discover.cta} ↗
            </Link>
          </div>
        </div>
      </section>

      {/* About split with stats and moods */}
      <section className="grid lg:grid-cols-2">
        <div className="relative min-h-[34rem] overflow-hidden">
          <Photo name="sunsetCabin" alt="" sizes="(min-width: 1024px) 50vw, 100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-transparent" />
          <dl className="absolute inset-x-0 bottom-0 grid grid-cols-3 gap-4 p-6 sm:p-10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dd className="heading text-4xl sm:text-5xl">{stat.value}</dd>
                <dt className="mt-1 text-[11px] text-muted">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex flex-col justify-between gap-16 px-4 py-16 sm:px-10 lg:px-16">
          <div>
            <p className="eyebrow mb-5">{h.about.eyebrow}</p>
            <h2 className="heading max-w-md text-4xl sm:text-5xl">{h.about.title}</h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted sm:text-base">{h.about.body}</p>
            <Link href={to(routes.about)} className="btn btn-outline btn-sm mt-8 border-line">
              {h.about.cta} ↗
            </Link>
          </div>
          <div className="text-center">
            <ul className="mb-8 flex flex-wrap justify-center gap-3 sm:gap-5">
              {moods.map((mood) => (
                <li key={mood.key} className="flex flex-col items-center gap-2">
                  <span className="relative block size-14 overflow-hidden rounded-full ring-1 ring-line sm:size-20">
                    <Photo name={mood.image} alt="" sizes="80px" />
                  </span>
                  <span className="text-xs text-muted">{h.moods.items[mood.key]}</span>
                </li>
              ))}
            </ul>
            <p className="heading text-3xl">{h.moods.title}</p>
            <p className="mt-1 text-xs text-muted">{h.moods.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Tours */}
      <section className="relative py-24 sm:py-32">
        <div className="pointer-events-none absolute top-16 left-0 hidden aspect-[4/3] w-[16vw] overflow-hidden rounded-r-3xl lg:block">
          <Photo name="beachDusk" alt="" sizes="16vw" />
        </div>
        <div className="pointer-events-none absolute top-0 right-0 hidden aspect-[4/3] w-[18vw] overflow-hidden rounded-l-3xl lg:block">
          <Photo name="islandRock" alt="" sizes="18vw" />
        </div>
        <div className="container-page">
          <SectionHeading align="center" eyebrow={h.collection.eyebrow} title={h.collection.title} body={h.collection.body} />
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {tours.slice(0, FEATURED_TOURS).map((tour) => (
              <TourCard key={tour.slug} tour={tour} locale={locale} t={t} />
            ))}
          </div>
          <div className="mt-14 text-center">
            <Link href={to(routes.tours)} className="btn btn-primary">
              {t.common.viewAll} ↗
            </Link>
          </div>
        </div>
      </section>

      {/* What's included + how it works */}
      <section className="container-page grid gap-8 pb-24 lg:grid-cols-2">
        <div className="rounded-card bg-sunken p-8 sm:p-10">
          <p className="heading mb-6 text-3xl sm:text-4xl">{t.included.title}</p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {t.included.items.map((item) => (
              <li key={item.title}>
                <span className="font-semibold">{item.title}</span>
                <span className="block text-sm text-muted">{item.body}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-card border border-line p-8 sm:p-10">
          <p className="eyebrow mb-2">{h.process.eyebrow}</p>
          <p className="heading mb-6 text-3xl sm:text-4xl">{h.process.title}</p>
          <ol className="grid gap-5">
            {h.process.steps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-fg">
                  {i + 1}
                </span>
                <span>
                  <span className="font-semibold">{step.title}</span>
                  <span className="block text-sm text-muted">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Cabins in both locations */}
      <section className="container-page pb-24">
        <SectionHeading eyebrow={h.stay.eyebrow} title={h.stay.title} body={h.stay.body} action={{ href: to(routes.ecoCabins), label: h.stay.cta }} />
        <div className="grid gap-6 md:grid-cols-2">
          {locations.map((location) => (
            <Link
              key={location.slug}
              href={`${to(routes.ecoCabins)}#${location.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-card sm:aspect-[16/11]"
            >
              <Photo name={location.image} alt={location.name} sizes="(min-width: 768px) 50vw, 100vw" className="transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                <p className="text-xs tracking-[0.2em] uppercase opacity-80">{location.region[locale]}</p>
                <p className="heading text-4xl sm:text-5xl">{location.name}</p>
                <p className="mt-1 text-sm opacity-90">{location.tagline[locale]}</p>
                <p className="mt-3 text-xs opacity-80">{cabinsAt(location.slug).map((cabin) => cabin.name[locale]).join(" · ")}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-page pb-24">
        <p className="eyebrow mb-6 text-center">{h.reviews.eyebrow}</p>
        <h2 className="heading mx-auto max-w-4xl text-center text-4xl leading-[1.15] sm:text-6xl">
          {h.reviews.titleStart}{" "}
          <span className="relative inline-block h-[0.8em] w-[1.9em] translate-y-[0.08em] overflow-hidden rounded-full align-baseline">
            <Photo name="turquoiseIsland" alt="" sizes="160px" />
          </span>{" "}
          {h.reviews.titleMiddle}{" "}
          <span className="inline-flex translate-y-[0.08em] -space-x-3 align-baseline">
            {reviews.slice(0, 3).map((review) => (
              <span key={review.name} className="relative inline-block size-[0.85em] overflow-hidden rounded-full ring-2 ring-bg">
                <Photo name={review.photo} alt="" sizes="64px" />
              </span>
            ))}
          </span>{" "}
          {h.reviews.titleEnd}
        </h2>

        <div className="mt-16 grid items-center gap-8 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.4fr)]">
          <div className="flex flex-col gap-3">
            {otherReviews.map((review) => (
              <div key={review.name} className="flex items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line">
                <span className="relative size-10 shrink-0 overflow-hidden rounded-full">
                  <Photo name={review.photo} alt="" sizes="40px" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{review.name}</p>
                  <p className="truncate text-xs text-muted">{getTour(review.tour)?.name[locale]}</p>
                </div>
                <span className="text-xs">{review.rating.toFixed(1)} ★</span>
              </div>
            ))}
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-card">
            <Photo name={featured.photo} alt={featured.name} sizes="(min-width: 1024px) 30vw, 100vw" />
          </div>
          <blockquote className="flex flex-col gap-8">
            <p className="heading text-3xl leading-snug sm:text-4xl">“{featured.quote[locale]}”</p>
            <footer className="flex flex-wrap items-end justify-between gap-6 border-t border-line pt-6 text-sm">
              <div>
                <p className="font-medium">{featured.name}</p>
                <p className="text-xs text-muted">
                  {featured.from[locale]} · {getTour(featured.tour)?.name[locale]}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">{h.reviews.satisfaction}</p>
                <p className="font-medium">{site.stats.rating} ★★★★★</p>
              </div>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Dark band + plan your trip */}
      <section className="bg-fg text-bg">
        <div className="container-page py-20 text-center">
          <h2 className="heading text-4xl sm:text-6xl">{h.plan.title}</h2>
          <p className="mx-auto mt-4 max-w-md text-sm opacity-75">{h.plan.body}</p>
        </div>
        <div className="relative min-h-[40rem]">
          <Photo name="coastAerial" alt="" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
          <div className="relative container-page flex min-h-[40rem] items-center py-12">
            <div className="w-full max-w-sm rounded-card bg-bg p-7 text-fg shadow-2xl">
              <p className="heading text-3xl">{h.plan.cardTitle}</p>
              <p className="mt-1 mb-6 text-xs text-muted">{h.plan.cardBody}</p>
              <TripSearch locale={locale} t={t} variant="stack" submitLabel={h.plan.submit} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
