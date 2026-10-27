import type { Localized } from "@/lib/i18n/config";
import type { PhotoKey } from "./images";

export type LocationSlug = "agua-verde" | "valle-de-guadalupe";

/** Places where Sekui has cabins. */
export interface Location {
  slug: LocationSlug;
  name: string;
  region: Localized;
  tagline: Localized;
  description: Localized;
  gettingThere: Localized;
  image: PhotoKey;
}

export const locations: Location[] = [
  {
    slug: "agua-verde",
    name: "Agua Verde",
    region: { en: "Baja California Sur", es: "Baja California Sur", fr: "Baja California Sur" },
    tagline: {
      en: "Where the desert meets the Sea of Cortez.",
      es: "Donde el desierto se encuentra con el Mar de Cortés.",
      fr: "Là où le désert rencontre la mer de Cortés.",
    },
    description: {
      en: "A small fishing village between the Sierra de la Giganta and turquoise bays. Our cabins sit a few steps from the sea and are the base for all our tours.",
      es: "Un pequeño pueblo pesquero entre la Sierra de la Giganta y bahías turquesa. Nuestras cabañas están a unos pasos del mar y son la base de todos nuestros tours.",
      fr: "Un petit village de pêcheurs entre la Sierra de la Giganta et des baies turquoise. Nos cabanes se trouvent à quelques pas de la mer et sont le point de départ de tous nos circuits.",
    },
    gettingThere: {
      en: "Fly into Loreto (LTO). Transfers are included in every package (about 2 h along the coast).",
      es: "Vuela a Loreto (LTO). El traslado está incluido en cada paquete (unas 2 h por la costa).",
      fr: "Arrivée à Loreto (LTO). Le transfert est inclus dans chaque forfait (environ 2 h par la côte).",
    },
    image: "turquoiseIsland",
  },
  {
    slug: "valle-de-guadalupe",
    name: "Valle de Guadalupe",
    region: { en: "Baja California", es: "Baja California", fr: "Baja California" },
    tagline: {
      en: "Cabins among the vineyards of Mexico's wine country.",
      es: "Cabañas entre los viñedos de la ruta del vino de México.",
      fr: "Des cabanes au milieu des vignes de la route des vins du Mexique.",
    },
    description: {
      en: "Rolling hills, family wineries and long sunsets 30 minutes from Ensenada. Our cabins look out over the vines, with a terrace for a glass of local wine at the end of the day.",
      es: "Colinas, vinícolas familiares y atardeceres largos a 30 minutos de Ensenada. Nuestras cabañas miran a los viñedos, con terraza para una copa de vino local al final del día.",
      fr: "Collines, domaines viticoles familiaux et longs couchers de soleil à 30 minutes d'Ensenada. Nos cabanes donnent sur les vignes, avec une terrasse pour un verre de vin local en fin de journée.",
    },
    gettingThere: {
      en: "Fly into Tijuana (TIJ) or San Diego (SAN). About 1 h 30 min by road.",
      es: "Vuela a Tijuana (TIJ) o San Diego (SAN). Alrededor de 1 h 30 min por carretera.",
      fr: "Arrivée à Tijuana (TIJ) ou San Diego (SAN). Environ 1 h 30 de route.",
    },
    image: "vineyardView",
  },
];

export function getLocation(slug: string): Location | undefined {
  return locations.find((l) => l.slug === slug);
}
