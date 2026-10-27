import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { getEmail } from "@/lib/booking/service";
import type { Locale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";
import { localePath, routes } from "@/lib/i18n/paths";
import { getI18n } from "@/lib/i18n/server";

export default async function EmailPreviewPage({ params }: PageProps<"/[lang]/admin/emails/[id]">) {
  const { locale, t } = await getI18n();
  return (
    <div className="container-page max-w-4xl py-12 pb-24">
      <Link href={localePath(locale, routes.admin)} className="text-sm underline underline-offset-4">
        ← {t.admin.title}
      </Link>
      <Suspense fallback={<p className="mt-6 text-muted">{t.common.loading}</p>}>
        <EmailPreview params={params} locale={locale} />
      </Suspense>
    </div>
  );
}

async function EmailPreview({ params, locale }: { params: Promise<{ id: string }>; locale: Locale }) {
  await connection();
  const { id } = await params;
  const email = await getEmail(id);
  if (!email) notFound();

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div>
        <h1 className="heading text-2xl">{email.subject}</h1>
        <p className="text-sm text-muted">
          {email.to} · {formatDate(email.createdAt, locale, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <iframe title={email.subject} srcDoc={email.html} sandbox="" className="h-[720px] w-full rounded-card border border-line bg-white" />
    </div>
  );
}
