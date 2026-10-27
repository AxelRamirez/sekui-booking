import type { Metadata } from "next";
import { LookupForm } from "@/components/my-trip/LookupForm";
import { getDictionary, getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.myTrip.title };
}

export default async function MyTripLookupPage() {
  const { locale, t } = await getI18n();

  return (
    <div className="container-page grid max-w-5xl items-center gap-12 py-16 pb-24 md:grid-cols-2">
      <div>
        <p className="eyebrow mb-3">{t.nav.myTrip}</p>
        <h1 className="heading text-4xl sm:text-6xl">{t.myTrip.title}</h1>
        <p className="mt-4 text-lg text-muted">{t.myTrip.lookup.subtitle}</p>
      </div>
      <LookupForm locale={locale} copy={t.myTrip.lookup} />
    </div>
  );
}
