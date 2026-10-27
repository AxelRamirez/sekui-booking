import type { Localized } from "@/lib/i18n/config";
import type { PhotoKey } from "./images";
import type { TourSlug } from "./tours";

export interface Review {
  name: string;
  from: Localized;
  tour: TourSlug;
  rating: number;
  quote: Localized;
  photo: PhotoKey;
}

export const reviews: Review[] = [
  {
    name: "Valeria Ortiz",
    from: { en: "Mexico City", es: "Ciudad de México", fr: "Mexico" },
    tour: "sea-lions-snorkel",
    rating: 5,
    quote: {
      en: "An unforgettable trip from beginning to end. Swimming with the sea lions was pure joy, and the eco-cabin by the water was a dream.",
      es: "Un viaje inolvidable de principio a fin. Nadar con los lobos marinos fue pura alegría y la ecocabaña junto al agua, un sueño.",
      fr: "Un voyage inoubliable du début à la fin. Nager avec les otaries était un pur bonheur, et l'écocabane au bord de l'eau, un rêve.",
    },
    photo: "guestValeria",
  },
  {
    name: "Marco Díaz",
    from: { en: "Guadalajara", es: "Guadalajara", fr: "Guadalajara" },
    tour: "family-adventure",
    rating: 5,
    quote: {
      en: "Everything was taken care of, from the airport to the last dinner. Our kids still talk about the turtles.",
      es: "Todo estuvo resuelto, del aeropuerto a la última cena. Nuestros hijos todavía hablan de las tortugas.",
      fr: "Tout était organisé, de l'aéroport au dernier dîner. Nos enfants parlent encore des tortues.",
    },
    photo: "guestMarco",
  },
  {
    name: "Emma Collins",
    from: { en: "Austin, TX", es: "Austin, TX", fr: "Austin, Texas" },
    tour: "kayak-islands",
    rating: 5,
    quote: {
      en: "Paddling between those islands felt like discovering a secret. Small group, incredible guides.",
      es: "Remar entre esas islas se sintió como descubrir un secreto. Grupo pequeño, guías increíbles.",
      fr: "Pagayer entre ces îles, c'était comme découvrir un secret. Petit groupe, guides incroyables.",
    },
    photo: "guestEmma",
  },
  {
    name: "Robert Hale",
    from: { en: "Monterrey", es: "Monterrey", fr: "Monterrey" },
    tour: "blue-whale-safari",
    rating: 4.8,
    quote: {
      en: "Seeing a blue whale surface next to the boat is something I'll never forget. Worth every peso.",
      es: "Ver una ballena azul salir junto a la lancha es algo que nunca olvidaré. Valió cada peso.",
      fr: "Voir une baleine bleue faire surface à côté du bateau, je ne l'oublierai jamais. Ça valait chaque peso.",
    },
    photo: "guestRobert",
  },
];
