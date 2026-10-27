import { NextResponse, type NextRequest } from "next/server";
import { hasLocale, LOCALE_COOKIE, matchLocale } from "@/lib/i18n/config";

const ONE_YEAR = 60 * 60 * 24 * 365;
/** Design-preview segments from the demo phase; old shared links keep working. */
const LEGACY_DESIGNS = new Set(["hybrid", "coastal", "luxe", "editorial"]);

/**
 * Redirects locale-less URLs to the visitor's preferred language
 * (cookie → Accept-Language → default) and remembers the current locale.
 */
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const segments = url.pathname.split("/").filter(Boolean);
  const [maybeLocale, second] = segments;

  if (!hasLocale(maybeLocale)) {
    const preferred = request.cookies.get(LOCALE_COOKIE)?.value;
    const locale = hasLocale(preferred) ? preferred : matchLocale(request.headers.get("accept-language"));
    url.pathname = `/${locale}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.redirect(url);
  }

  if (LEGACY_DESIGNS.has(second) || url.searchParams.has("design")) {
    url.searchParams.delete("design");
    url.pathname = "/" + segments.filter((segment, i) => !(i === 1 && LEGACY_DESIGNS.has(segment))).join("/");
    return NextResponse.redirect(url, 308);
  }

  const response = NextResponse.next();
  if (request.cookies.get(LOCALE_COOKIE)?.value !== maybeLocale) {
    response.cookies.set(LOCALE_COOKIE, maybeLocale, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|media|.*\\..*).*)"],
};
