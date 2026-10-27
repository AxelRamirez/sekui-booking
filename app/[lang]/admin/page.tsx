import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { resetDemoData } from "@/app/actions/admin";
import { AvailabilityBadge, bookingStatusTone, StatusPill } from "@/components/ui/AvailabilityBadge";
import { getAdminSnapshot } from "@/lib/booking/service";
import { getTour } from "@/lib/content/tours";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatDate, formatMoney } from "@/lib/i18n/format";
import { localePath, routes } from "@/lib/i18n/paths";
import { getDictionary, getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.admin.title, robots: { index: false } };
}

export default async function AdminPage({ searchParams }: PageProps<"/[lang]/admin">) {
  const { locale, t } = await getI18n();
  return (
    <div className="container-page py-12 pb-24">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading text-4xl">{t.admin.title}</h1>
          <p className="mt-2 text-muted">{t.admin.subtitle}</p>
        </div>
        <form action={resetDemoData}>
          <input type="hidden" name="locale" value={locale} />
          <button type="submit" className="btn btn-outline btn-sm">
            {t.admin.reset}
          </button>
        </form>
      </div>
      <Suspense fallback={<p className="text-muted">{t.common.loading}</p>}>
        <Dashboard searchParams={searchParams} locale={locale} t={t} />
      </Suspense>
    </div>
  );
}

const th = "px-3 py-2 text-left text-xs font-semibold tracking-wide text-muted uppercase";
const td = "px-3 py-2.5 align-top";

async function Dashboard({
  searchParams,
  locale,
  t,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  locale: Locale;
  t: Dictionary;
}) {
  await connection();
  const { notice } = await searchParams;
  const data = await getAdminSnapshot();
  const a = t.admin;
  const money = (amount: number) => formatMoney(amount, locale);
  const confirmed = data.bookings.filter((b) => b.booking.status === "confirmed").length;
  const pending = data.bookings.filter((b) => b.holdActive).length;

  return (
    <div className="flex flex-col gap-12">
      {notice === "reset" && <p className="rounded-card border border-success/40 bg-success/10 p-4 text-success">{a.resetDone}</p>}

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: a.stats.bookings, value: confirmed },
          { label: a.stats.revenue, value: money(data.revenue) },
          { label: a.stats.pending, value: pending },
          { label: a.stats.inquiries, value: data.inquiries.length + data.subscribers },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <dt className="text-sm text-muted">{stat.label}</dt>
            <dd className="heading mt-1 text-3xl">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <section>
        <h2 className="heading mb-4 text-2xl">{a.sections.bookings}</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line">
              <tr>
                {[a.columns.code, a.columns.guest, a.columns.tour, a.columns.departure, a.columns.guests, a.columns.status, a.columns.total, a.columns.paid, ""].map((h, i) => (
                  <th key={i} className={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.bookings.length === 0 && (
                <tr>
                  <td colSpan={9} className={`${td} text-center text-muted`}>
                    {a.empty}
                  </td>
                </tr>
              )}
              {data.bookings.map(({ booking, departure, paid }) => (
                <tr key={booking.code}>
                  <td className={`${td} font-mono font-semibold`}>{booking.code}</td>
                  <td className={td}>
                    {booking.leadGuest.firstName} {booking.leadGuest.lastName}
                    <span className="block text-xs text-muted">{booking.leadGuest.email}</span>
                  </td>
                  <td className={td}>{getTour(booking.tourSlug)?.name[locale]}</td>
                  <td className={`${td} whitespace-nowrap`}>{departure && formatDate(departure.startDate, locale)}</td>
                  <td className={td}>{booking.guests}</td>
                  <td className={td}>
                    <StatusPill tone={bookingStatusTone[booking.status]}>{t.myTrip.status[booking.status]}</StatusPill>
                  </td>
                  <td className={`${td} whitespace-nowrap`}>{money(booking.quote.total)}</td>
                  <td className={`${td} whitespace-nowrap`}>{money(paid)}</td>
                  <td className={td}>
                    <Link href={localePath(locale, routes.manageTrip(booking.code, booking.accessToken))} className="font-semibold text-accent">
                      {a.open}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="heading mb-4 text-2xl">{a.sections.departures}</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line">
              <tr>
                {[a.columns.departure, a.columns.tour, a.columns.occupancy, a.columns.status].map((h) => (
                  <th key={h} className={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.departures.map(({ departure, spotsLeft, status }) => {
                const taken = departure.capacity - spotsLeft;
                return (
                  <tr key={departure.id}>
                    <td className={`${td} whitespace-nowrap`}>{formatDate(departure.startDate, locale)}</td>
                    <td className={td}>{getTour(departure.tourSlug)?.name[locale]}</td>
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-sunken">
                          <div className="h-full bg-accent" style={{ width: `${(taken / departure.capacity) * 100}%` }} />
                        </div>
                        <span className="text-xs text-muted">
                          {taken}/{departure.capacity}
                        </span>
                      </div>
                    </td>
                    <td className={td}>
                      <AvailabilityBadge status={status} label={t.common.availability[status]} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="heading mb-4 text-2xl">{a.sections.emails}</h2>
          <ul className="card divide-y divide-line">
            {data.emails.length === 0 && <li className="p-4 text-sm text-muted">{a.empty}</li>}
            {data.emails.map((email) => (
              <li key={email.id}>
                <Link href={localePath(locale, `/admin/emails/${email.id}`)} className="flex flex-col gap-0.5 p-4 text-sm hover:bg-sunken">
                  <span className="font-semibold">{email.subject}</span>
                  <span className="text-xs text-muted">
                    {email.to} · {formatDate(email.createdAt, locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="heading mb-4 text-2xl">{a.sections.inquiries}</h2>
          <ul className="card divide-y divide-line">
            {data.inquiries.length === 0 && <li className="p-4 text-sm text-muted">{a.empty}</li>}
            {data.inquiries.map((inquiry) => (
              <li key={inquiry.id} className="flex flex-col gap-1 p-4 text-sm">
                <span className="font-semibold">{inquiry.name}</span>
                <span className="text-xs text-muted">
                  {t.contact.form.kinds[inquiry.kind]} · {a.columns.guests}: {inquiry.groupSize} · {inquiry.email}
                  {inquiry.preferredDates && ` · ${inquiry.preferredDates}`}
                </span>
                {inquiry.message && <span className="text-muted">{inquiry.message}</span>}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
