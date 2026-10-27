"use client";

import { localeLabels, locales, type Locale } from "@/lib/i18n/config";

/** Swaps the locale prefix of the current URL, keeping the path and query. */
export function LanguageSwitcher({
  current,
  label,
  className = "",
}: {
  current: Locale;
  label: string;
  className?: string;
}) {
  function switchTo(locale: Locale) {
    if (locale === current) return;
    const url = new URL(window.location.href);
    const rest = url.pathname.split("/").slice(2).join("/");
    url.pathname = `/${locale}${rest ? `/${rest}` : ""}`;
    // Full load: the locale is a root segment with its own root layout.
    window.location.assign(url.toString());
  }

  return (
    <div role="group" aria-label={label} className={`flex items-center gap-1 text-xs font-semibold ${className}`}>
      {locales.map((locale, index) => (
        <span key={locale} className="flex items-center gap-1">
          {index > 0 && <span className="opacity-40">/</span>}
          <button
            type="button"
            lang={locale}
            onClick={() => switchTo(locale)}
            aria-pressed={locale === current}
            title={localeLabels[locale].name}
            className={locale === current ? "underline underline-offset-4" : "opacity-60 hover:opacity-100"}
          >
            {localeLabels[locale].short}
          </button>
        </span>
      ))}
    </div>
  );
}
