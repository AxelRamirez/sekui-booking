import type { Metadata } from "next";
import { TourCard } from "@/components/tours/TourCard";
import { TourFilter } from "@/components/tours/TourFilter";
import { TripSearch } from "@/components/tours/TripSearch";
import { PageHeader } from "@/components/ui/PageHeader";
import { tours } from "@/lib/content/tours";
import { getDictionary, getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.tours.title, description: t.tours.subtitle };
}

export default async function ToursPage() {
  const { locale, t } = await getI18n();

  return (
    <>
      <PageHeader title={t.tours.title} subtitle={t.tours.subtitle} />
      <section className="container-page pb-12">
        <div className="card p-5">
          <TripSearch locale={locale} t={t} />
        </div>
      </section>
      <section className="container-page pb-24">
        <TourFilter
          labels={t.categories}
          items={tours.map((tour) => ({
            key: tour.slug,
            category: tour.category,
            card: <TourCard tour={tour} locale={locale} t={t} />,
          }))}
        />
      </section>
    </>
  );
}
