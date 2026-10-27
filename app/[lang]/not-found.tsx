import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";

export default async function NotFound() {
  const { locale, t } = await getI18n();
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="heading text-7xl text-accent">404</p>
      <h1 className="heading text-4xl">{t.notFound.title}</h1>
      <p className="text-muted">{t.notFound.body}</p>
      <Link href={`/${locale}`} className="btn btn-primary mt-4">
        {t.notFound.cta}
      </Link>
    </div>
  );
}
