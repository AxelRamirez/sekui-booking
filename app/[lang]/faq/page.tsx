import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { faqs } from "@/lib/content/faqs";
import { getDictionary, getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.faq.title };
}

export default async function FaqPage() {
  const { locale, t } = await getI18n();

  return (
    <>
      <PageHeader title={t.faq.title} />
      <section className="container-page max-w-3xl pb-24">
        <div className="divide-y divide-line border-y border-line">
          {faqs.map((faq) => (
            <details key={faq.question.en} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                {faq.question[locale]}
                <span className="text-2xl text-accent transition group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-muted">{faq.answer[locale]}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
