import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Photo } from "@/components/ui/Photo";
import { cabinsAt } from "@/lib/content/eco-cabins";
import { locations } from "@/lib/content/locations";
import { toursAt } from "@/lib/content/tours";
import { fill } from "@/lib/i18n/format";
import { localePath, routes } from "@/lib/i18n/paths";
import { getDictionary, getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.ecoCabins.title, description: t.ecoCabins.subtitle };
}

export default async function CabinsPage() {
  const { locale, t } = await getI18n();
  const c = t.ecoCabins;

  return (
    <>
      <PageHeader title={c.title} subtitle={c.subtitle} />

      <nav className="container-page mb-16 grid gap-4 sm:grid-cols-2">
        {locations.map((location) => (
          <a key={location.slug} href={`#${location.slug}`} className="group relative block aspect-[16/10] overflow-hidden rounded-card">
            <Photo name={location.image} alt={location.name} preload sizes="(min-width: 640px) 50vw, 100vw" className="transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <p className="text-xs tracking-[0.2em] uppercase opacity-80">{location.region[locale]}</p>
              <p className="heading text-4xl sm:text-5xl">{location.name}</p>
              <p className="mt-1 text-sm opacity-90">{location.tagline[locale]}</p>
            </div>
          </a>
        ))}
      </nav>

      {locations.map((location) => {
        const cabins = cabinsAt(location.slug);
        const hasTours = toursAt(location.slug).length > 0;
        return (
          <section key={location.slug} id={location.slug} className="container-page scroll-mt-24 pb-20">
            <div className="mb-10 grid gap-8 border-t border-line pt-10 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div>
                <p className="eyebrow mb-3">
                  {location.region[locale]} · {fill(c.cabins[cabins.length === 1 ? "one" : "other"], { count: cabins.length })}
                </p>
                <h2 className="heading text-4xl sm:text-6xl">{location.name}</h2>
              </div>
              <div className="flex flex-col gap-4 text-muted">
                <p className="text-lg">{location.description[locale]}</p>
                <p className="text-sm">
                  <span className="font-semibold text-fg">{c.gettingThere}:</span> {location.gettingThere[locale]}
                </p>
                <Link
                  href={localePath(locale, hasTours ? routes.tours : routes.contact)}
                  className="btn btn-outline btn-sm w-fit border-line text-fg"
                >
                  {hasTours ? c.toursCta : c.contactCta} ↗
                </Link>
              </div>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {cabins.map((cabin) => (
                <article key={cabin.id} className="card overflow-hidden">
                  <div className="relative aspect-[4/3]">
                    <Photo name={cabin.image} alt={cabin.name[locale]} sizes="(min-width: 768px) 33vw, 100vw" />
                  </div>
                  <div className="flex flex-col gap-3 p-6">
                    <h3 className="heading text-3xl">{cabin.name[locale]}</h3>
                    <p className="text-sm text-muted">{fill(c.sleeps, { count: cabin.sleeps })}</p>
                    <p className="text-muted">{cabin.description[locale]}</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {cabin.features[locale].map((feature) => (
                        <li key={feature} className="rounded-control border border-line px-3 py-1 text-xs">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <section className="container-page grid gap-10 pb-24 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="prose-body text-lg">
          {c.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(["bedroomWarm", "vineyardSunset", "campfire", "wineToast"] as const).map((image) => (
            <div key={image} className="relative aspect-[4/3] overflow-hidden rounded-card">
              <Photo name={image} alt="" sizes="(min-width: 1024px) 25vw, 50vw" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
