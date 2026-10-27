import Link from "next/link";
import { localePath, routes } from "@/lib/i18n/paths";
import { getI18n } from "@/lib/i18n/server";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { MobileMenu, type NavLink } from "./MobileMenu";

export async function SiteHeader() {
  const { locale, t } = await getI18n();
  const to = (path: string) => localePath(locale, path);

  const links: NavLink[] = [
    { href: to(routes.tours), label: t.nav.tours },
    { href: to(routes.calendar), label: t.nav.calendar },
    { href: to(routes.ecoCabins), label: t.nav.ecoCabins },
    { href: to(routes.about), label: t.nav.about },
    { href: to(routes.contact), label: t.nav.contact },
  ];
  const mobileLinks = [...links, { href: to(routes.faq), label: t.nav.faq }, { href: to(routes.myTrip), label: t.nav.myTrip }];

  return (
    <header className="sticky top-0 z-30 bg-bg/90 backdrop-blur-md">
      <div className="container-page flex h-18 items-center justify-between gap-6">
        <Logo href={to("")} />
        <nav className="hidden items-center gap-1 text-[13px] lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full px-4 py-2 text-fg/75 transition hover:bg-surface hover:text-fg">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="mr-2 hidden lg:block">
            <LanguageSwitcher current={locale} label={t.nav.language} />
          </div>
          <Link href={to(routes.myTrip)} className="btn btn-outline btn-sm hidden border-line sm:inline-flex">
            {t.nav.myTrip}
          </Link>
          <Link href={to(routes.calendar)} className="btn btn-primary btn-sm">
            {t.nav.book}
          </Link>
          <MobileMenu
            links={mobileLinks}
            menuLabel={t.nav.menu}
            closeLabel={t.nav.close}
            brand={<Logo href={to("")} />}
            footer={<LanguageSwitcher current={locale} label={t.nav.language} className="text-base" />}
          />
        </div>
      </div>
    </header>
  );
}
