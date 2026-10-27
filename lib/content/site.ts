import type { Localized } from "@/lib/i18n/config";

/**
 * Brand-level settings. Contact details and stats are dummy data;
 * change them here to update the whole site.
 */
export const site = {
  name: "Sekui",
  tagline: {
    en: "The Sea of Cortez, all inclusive.",
    es: "El Mar de Cortés, todo incluido.",
    fr: "La mer de Cortés, tout compris.",
  } satisfies Localized,
  location: {
    en: "Agua Verde, Baja California Sur",
    es: "Agua Verde, Baja California Sur",
    fr: "Agua Verde, Baja California Sur",
  } satisfies Localized,
  address: "Agua Verde, Municipio de Loreto, Baja California Sur, México",
  airport: {
    en: "Loreto International Airport (LTO)",
    es: "Aeropuerto Internacional de Loreto (LTO)",
    fr: "Aéroport international de Loreto (LTO)",
  } satisfies Localized,
  email: "hola@example.com",
  whatsapp: "+52 55 0000 0000",
  whatsappUrl: "https://wa.me/525500000000",
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  tiktok: "https://tiktok.com/",
  stats: {
    rating: "4.9",
    travelers: "1,800+",
    tours: "12",
  },
  currency: "MXN",
  /** IANA timezone of the operation (Baja California Sur). */
  timeZone: "America/Mazatlan",
} as const;
