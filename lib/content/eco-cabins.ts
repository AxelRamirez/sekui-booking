import type { Localized } from "@/lib/i18n/config";
import type { PhotoKey } from "./images";
import type { LocationSlug } from "./locations";

/** Sekui cabins. Agua Verde cabins host every tour package. */
export interface EcoCabin {
  id: string;
  location: LocationSlug;
  name: Localized;
  description: Localized;
  sleeps: number;
  features: Localized<string[]>;
  image: PhotoKey;
}

export const ecoCabins: EcoCabin[] = [
  {
    id: "beach",
    location: "agua-verde",
    name: { en: "Beach Eco-Cabin", es: "Ecocabaña de Playa", fr: "Écocabane de plage" },
    description: {
      en: "Steps from the water, with a queen bed facing the bay and a private terrace with hammock.",
      es: "A pasos del agua, con cama queen frente a la bahía y terraza privada con hamaca.",
      fr: "À quelques pas de l'eau, avec un lit queen face à la baie et une terrasse privée avec hamac.",
    },
    sleeps: 2,
    features: {
      en: ["Sea view", "Private bathroom", "Solar power", "Hammock terrace"],
      es: ["Vista al mar", "Baño privado", "Energía solar", "Terraza con hamaca"],
      fr: ["Vue sur la mer", "Salle de bain privée", "Énergie solaire", "Terrasse avec hamac"],
    },
    image: "sunsetCabin",
  },
  {
    id: "desert",
    location: "agua-verde",
    name: { en: "Desert Eco-Cabin", es: "Ecocabaña del Desierto", fr: "Écocabane du désert" },
    description: {
      en: "Built with local adobe and wood among cardón cacti, with two beds and a stargazing deck.",
      es: "Construida con adobe y madera local entre cardones, con dos camas y terraza para ver estrellas.",
      fr: "Construite en adobe et bois local parmi les cactus cardón, avec deux lits et une terrasse pour observer les étoiles.",
    },
    sleeps: 2,
    features: {
      en: ["Twin or queen", "Stargazing deck", "Solar power", "Outdoor shower"],
      es: ["Dos individuales o queen", "Terraza para estrellas", "Energía solar", "Regadera exterior"],
      fr: ["Lits jumeaux ou queen", "Terrasse étoilée", "Énergie solaire", "Douche extérieure"],
    },
    image: "hammockCabin",
  },
  {
    id: "family",
    location: "agua-verde",
    name: { en: "Family Eco-Cabin", es: "Ecocabaña Familiar", fr: "Écocabane familiale" },
    description: {
      en: "Two rooms and a sleeping loft for families and friends, with a shared deck over the bay.",
      es: "Dos habitaciones y un tapanco para familias y amigos, con terraza compartida sobre la bahía.",
      fr: "Deux chambres et une mezzanine pour familles et amis, avec une terrasse partagée surplombant la baie.",
    },
    sleeps: 5,
    features: {
      en: ["2 rooms + loft", "Bay-view deck", "Solar power", "Kids welcome"],
      es: ["2 habitaciones + tapanco", "Terraza con vista a la bahía", "Energía solar", "Niños bienvenidos"],
      fr: ["2 chambres + mezzanine", "Terrasse vue sur la baie", "Énergie solaire", "Enfants bienvenus"],
    },
    image: "aFrame",
  },
  {
    id: "vineyard",
    location: "valle-de-guadalupe",
    name: { en: "Vineyard Cabin", es: "Cabaña del Viñedo", fr: "Cabane des vignes" },
    description: {
      en: "A cabin for two surrounded by vines, with a king bed, wood stove and a terrace facing the sunset.",
      es: "Una cabaña para dos rodeada de viñedos, con cama king, estufa de leña y terraza frente al atardecer.",
      fr: "Une cabane pour deux entourée de vignes, avec lit king, poêle à bois et terrasse face au coucher du soleil.",
    },
    sleeps: 2,
    features: {
      en: ["Vineyard view", "Wood stove", "Sunset terrace", "Solar power"],
      es: ["Vista al viñedo", "Estufa de leña", "Terraza al atardecer", "Energía solar"],
      fr: ["Vue sur les vignes", "Poêle à bois", "Terrasse au coucher du soleil", "Énergie solaire"],
    },
    image: "modernCabin",
  },
  {
    id: "hillside",
    location: "valle-de-guadalupe",
    name: { en: "Hillside Loft", es: "Loft en la Colina", fr: "Loft sur la colline" },
    description: {
      en: "Two levels on the hillside with panoramic views of the valley, a kitchenette and a fire pit.",
      es: "Dos niveles en la colina con vista panorámica al valle, cocineta y fogatero.",
      fr: "Deux niveaux à flanc de colline avec vue panoramique sur la vallée, kitchenette et foyer extérieur.",
    },
    sleeps: 4,
    features: {
      en: ["Panoramic view", "Kitchenette", "Fire pit", "Sleeps four"],
      es: ["Vista panorámica", "Cocineta", "Fogatero", "Para cuatro"],
      fr: ["Vue panoramique", "Kitchenette", "Foyer extérieur", "Pour quatre"],
    },
    image: "woodlandCabin",
  },
];

export function cabinsAt(location: LocationSlug): EcoCabin[] {
  return ecoCabins.filter((cabin) => cabin.location === location);
}
