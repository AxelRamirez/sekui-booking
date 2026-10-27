import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { policies } from "@/lib/booking/policies";
import { fill, formatMoney } from "@/lib/i18n/format";
import { getDictionary, getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.policies.title };
}

export default async function PoliciesPage() {
  const { locale, t } = await getI18n();
  const p = t.policies;

  const sections = [
    { title: p.booking, body: fill(p.bookingBody, { cutoff: policies.bookingCutoffDays }) },
    {
      title: p.payments,
      body: fill(p.paymentsBody, { depositDays: policies.depositMinDays, balanceDays: policies.balanceDueDays }),
    },
    {
      title: p.reschedule,
      body: fill(p.rescheduleBody, {
        freeDays: policies.reschedule.freeDaysBefore,
        minDays: policies.reschedule.minDaysBefore,
        fee: formatMoney(policies.reschedule.fee, locale),
        max: policies.reschedule.maxCount,
      }),
    },
    { title: p.weather, body: t.weather.body },
  ];

  return (
    <>
      <PageHeader title={p.title} />
      <div className="container-page flex max-w-3xl flex-col gap-10 pb-24">
        {sections.map((section) => (
          <section key={section.title} className="border-t border-line pt-6">
            <h2 className="heading mb-3 text-2xl">{section.title}</h2>
            <p className="leading-relaxed text-muted">{section.body}</p>
          </section>
        ))}
        <section className="border-t border-line pt-6">
          <h2 className="heading mb-3 text-2xl">{p.cancellation}</h2>
          <ul className="list-disc pl-5 text-muted">
            {policies.cancellationTiers.map((tier) => (
              <li key={tier.minDays}>{fill(p.cancellationTier, { days: tier.minDays, rate: tier.refundRate * 100 })}</li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
