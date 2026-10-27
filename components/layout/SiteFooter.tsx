import Link from "next/link";
import { site } from "@/lib/content/site";
import { localePath, routes } from "@/lib/i18n/paths";
import { getI18n } from "@/lib/i18n/server";
import { Logo } from "./Logo";
import { NewsletterForm } from "./NewsletterForm";

export async function SiteFooter() {
  const { locale, t } = await getI18n();
  const to = (path: string) => localePath(locale, path);

  const columns = [
    {
      title: t.footer.explore,
      links: [
        { href: to(routes.tours), label: t.nav.tours },
        { href: to(routes.calendar), label: t.nav.calendar },
        { href: to(routes.ecoCabins), label: t.nav.ecoCabins },
      ],
    },
    {
      title: t.footer.company,
      links: [
        { href: to(routes.about), label: t.nav.about },
        { href: to(routes.contact), label: t.nav.contact },
        { href: site.instagram, label: "Instagram" },
      ],
    },
    {
      title: t.footer.support,
      links: [
        { href: to(routes.myTrip), label: t.nav.myTrip },
        { href: to(routes.faq), label: t.nav.faq },
        { href: to(routes.policies), label: t.footer.terms },
      ],
    },
  ];

  return (
    <footer className="overflow-hidden bg-fg pt-16 pb-6 text-bg">
      <div className="container-page">
        <div className="grid gap-12 grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr_1fr_1.6fr]">
          <div className="flex flex-col gap-4">
            <Logo href={to("")} />
            <p className="max-w-[14rem] text-sm opacity-70">{t.footer.tagline}</p>
            <div className="flex gap-2">
              {[
                { href: site.instagram, label: "IG" },
                { href: site.facebook, label: "FB" },
                { href: site.tiktok, label: "TT" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex size-9 items-center justify-center rounded-full border border-current/25 text-[11px] hover:bg-bg hover:text-fg"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <p className="mb-4 font-display text-xl font-semibold">{column.title}</p>
              <ul className="flex flex-col gap-2.5 text-sm">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    {link.href.startsWith("http") ? (
                      <a href={link.href} target="_blank" rel="noreferrer" className="opacity-75 hover:opacity-100">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="opacity-75 hover:opacity-100">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="mb-4 font-display text-xl font-semibold">{t.footer.newsletter.title}</p>
            <p className="mb-4 text-sm opacity-70">{t.footer.newsletter.body}</p>
            <NewsletterForm locale={locale} placeholder={t.footer.newsletter.placeholder} submitLabel={t.footer.newsletter.submit} />
          </div>
        </div>
      </div>
      <p
        aria-hidden
        className="mt-12 text-center font-display leading-[0.8] font-semibold tracking-tight lowercase select-none"
        style={{ fontSize: "clamp(6rem, 30vw, 26rem)" }}
      >
        {site.name}
      </p>
      <div className="container-page mt-6 flex flex-col gap-2 text-xs opacity-60 sm:flex-row sm:justify-between">
        <span>
          © {site.name}. {t.footer.rights} {t.footer.demo}
        </span>
        <span className="flex gap-6">
          <Link href={to(routes.policies)}>{t.footer.privacy}</Link>
          <Link href={to(routes.policies)}>{t.footer.terms}</Link>
        </span>
      </div>
    </footer>
  );
}
