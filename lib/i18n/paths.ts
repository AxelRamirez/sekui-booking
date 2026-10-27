import type { Locale } from "./config";

/** Builds a public, locale-prefixed URL. */
export function localePath(locale: Locale, path = ""): string {
  return `/${locale}${path}`;
}

export const routes = {
  home: "",
  tours: "/tours",
  tour: (slug: string) => `/tours/${slug}`,
  calendar: "/calendar",
  ecoCabins: "/eco-cabins",
  book: (departureId: string) => `/book/${departureId}`,
  myTrip: "/my-trip",
  manageTrip: (code: string, token: string) => `/my-trip/${code}?t=${encodeURIComponent(token)}`,
  about: "/about",
  faq: "/faq",
  contact: "/contact",
  policies: "/policies",
  admin: "/admin",
} as const;
