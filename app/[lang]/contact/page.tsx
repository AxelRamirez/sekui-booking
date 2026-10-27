import type { Metadata } from "next";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Photo } from "@/components/ui/Photo";
import { site } from "@/lib/content/site";
import { getDictionary, getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.contact.title, description: t.contact.subtitle };
}

export default async function ContactPage() {
  const { locale, t } = await getI18n();
  const c = t.contact;
  const details = [
    { label: c.details.address, value: site.address },
    { label: c.details.email, value: site.email, href: `mailto:${site.email}` },
    { label: c.details.whatsapp, value: site.whatsapp, href: site.whatsappUrl },
    { label: c.details.hours, value: c.details.hoursValue },
  ];

  return (
    <>
      <PageHeader title={c.title} subtitle={c.subtitle} />
      <section className="container-page grid gap-10 pb-24 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="flex flex-col gap-8">
          <dl className="grid gap-6">
            {details.map((item) => (
              <div key={item.label} className="border-t border-line pt-4">
                <dt className="label">{item.label}</dt>
                <dd className="text-lg">
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <div className="relative aspect-[4/3] overflow-hidden rounded-card">
            <Photo name="beachDusk" alt="" sizes="(min-width: 1024px) 40vw, 100vw" />
          </div>
        </div>
        <InquiryForm locale={locale} copy={c.form} />
      </section>
    </>
  );
}
