import type { Localized } from "@/lib/i18n/config";

export type AddonId = "private-cabin" | "photo-package" | "extra-night";

export interface Addon {
  id: AddonId;
  name: Localized;
  description: Localized;
  /** MXN */
  price: number;
  /** "person" charges price × travelers, "booking" charges once. */
  unit: "person" | "booking";
}

export const addons: Addon[] = [
  {
    id: "private-cabin",
    name: { en: "Private eco-cabin", es: "Ecocabaña privada", fr: "Écocabane privée" },
    description: {
      en: "Guaranteed private cabin for your party (packages are based on shared double occupancy).",
      es: "Cabaña privada garantizada para tu grupo (los paquetes se basan en ocupación doble compartida).",
      fr: "Cabane privée garantie pour votre groupe (les forfaits sont basés sur une occupation double partagée).",
    },
    price: 2500,
    unit: "person",
  },
  {
    id: "photo-package",
    name: { en: "Underwater photo package", es: "Paquete de foto submarina", fr: "Forfait photo sous-marine" },
    description: {
      en: "Our guide photographs your trip above and below water — 60+ edited photos.",
      es: "Nuestro guía fotografía tu viaje dentro y fuera del agua: más de 60 fotos editadas.",
      fr: "Notre guide photographie votre voyage dans et hors de l'eau : plus de 60 photos retouchées.",
    },
    price: 2800,
    unit: "booking",
  },
  {
    id: "extra-night",
    name: { en: "Extra night in Loreto", es: "Noche extra en Loreto", fr: "Nuit supplémentaire à Loreto" },
    description: {
      en: "Boutique hotel in Loreto the night before the tour, breakfast included.",
      es: "Hotel boutique en Loreto la noche previa al tour, con desayuno.",
      fr: "Hôtel de charme à Loreto la veille du circuit, petit-déjeuner inclus.",
    },
    price: 1900,
    unit: "person",
  },
];

export function getAddon(id: string): Addon | undefined {
  return addons.find((a) => a.id === id);
}
