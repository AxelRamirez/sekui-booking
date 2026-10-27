import { HomeSections } from "@/components/home/HomeSections";
import { getI18n } from "@/lib/i18n/server";

export default async function HomePage() {
  const { locale, t } = await getI18n();
  return <HomeSections locale={locale} t={t} />;
}
