import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Photo } from "@/components/ui/Photo";
import { site } from "@/lib/content/site";
import { localePath, routes } from "@/lib/i18n/paths";
import { getDictionary, getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.about.title, description: t.about.subtitle };
}

export default async function AboutPage() {
  const { locale, t } = await getI18n();
  const stats = [
    { value: `${site.stats.rating}★`, label: t.home.stats.rating },
    { value: site.stats.travelers, label: t.home.stats.travelers },
    { value: site.stats.tours, label: t.home.stats.tours },
  ];

  return (
    <>
      <PageHeader title={t.about.title} subtitle={t.about.subtitle} />
      <section className="container-page grid items-center gap-12 py-12 pb-16 lg:grid-cols-2">
        <div>
          <div className="prose-body text-lg">
            {t.about.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <dl className="mt-8 grid grid-cols-3 gap-6 border-t border-line pt-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dd className="heading text-4xl">{stat.value}</dd>
                <dt className="mt-1 text-xs text-muted">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative row-span-2 aspect-[3/4] overflow-hidden rounded-card">
            <Photo name="sunsetCabin" alt="" sizes="(min-width: 1024px) 25vw, 50vw" />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-card">
            <Photo name="campMeal" alt="" sizes="25vw" />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-card">
            <Photo name="paddleboard" alt="" sizes="25vw" />
          </div>
        </div>
      </section>
      <section className="container-page grid gap-6 pb-16 md:grid-cols-3">
        {t.about.values.map((value, i) => (
          <div key={value.title} className="card p-8">
            <span className="font-display text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
            <h2 className="heading mt-2 text-3xl">{value.title}</h2>
            <p className="mt-3 text-muted">{value.body}</p>
          </div>
        ))}
      </section>
      <section className="container-page pb-24">
        <div className="relative overflow-hidden rounded-card">
          <div className="relative aspect-[21/9] min-h-72">
            <Photo name="turquoiseIsland" alt="" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/45 px-6 text-center text-white">
              <p className="heading max-w-2xl text-4xl sm:text-6xl">{t.home.plan.title}</p>
              <Link href={localePath(locale, routes.calendar)} className="rounded-full bg-bg px-6 py-3 text-sm font-semibold text-fg">
                {t.home.plan.submit}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
