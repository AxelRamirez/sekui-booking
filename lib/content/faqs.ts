import type { Localized } from "@/lib/i18n/config";

export interface Faq {
  question: Localized;
  answer: Localized;
}

export const faqs: Faq[] = [
  {
    question: {
      en: "Where are the Sekui cabins?",
      es: "¿Dónde están las cabañas Sekui?",
      fr: "Où se trouvent les cabanes Sekui ?",
    },
    answer: {
      en: "In two places: Agua Verde, Baja California Sur, by the Sea of Cortez, where all our tours are based; and Valle de Guadalupe, Baja California, among the vineyards of Mexico's wine country.",
      es: "En dos lugares: Agua Verde, Baja California Sur, frente al Mar de Cortés, donde se basan todos nuestros tours; y Valle de Guadalupe, Baja California, entre los viñedos de la ruta del vino de México.",
      fr: "À deux endroits : Agua Verde, en Baja California Sur, au bord de la mer de Cortés, où sont basés tous nos circuits ; et Valle de Guadalupe, en Baja California, au milieu des vignes de la route des vins du Mexique.",
    },
  },
  {
    question: {
      en: "What is included in a package?",
      es: "¿Qué incluye un paquete?",
      fr: "Qu'est-ce qui est inclus dans un forfait ?",
    },
    answer: {
      en: "Round-trip transfer from Loreto airport, lodging in Sekui eco-cabins, all meals, the activities in the itinerary with equipment, bilingual certified guides and accident insurance. Flights are not included.",
      es: "Traslado redondo desde el aeropuerto de Loreto, hospedaje en las ecocabañas Sekui, todas las comidas, las actividades del itinerario con equipo, guías bilingües certificados y seguro de accidentes. Los vuelos no están incluidos.",
      fr: "Le transfert aller-retour depuis l'aéroport de Loreto, l'hébergement dans les écocabanes Sekui, tous les repas, les activités de l'itinéraire avec l'équipement, des guides certifiés bilingues et une assurance accident. Les vols ne sont pas inclus.",
    },
  },
  {
    question: {
      en: "How do I choose my dates?",
      es: "¿Cómo elijo mis fechas?",
      fr: "Comment choisir mes dates ?",
    },
    answer: {
      en: "Each tour has fixed departures. Choose the month you'd like to travel, then pick one of the available departures for your tour.",
      es: "Cada tour tiene salidas fijas. Elige el mes en que quieres viajar y después una de las salidas disponibles de tu tour.",
      fr: "Chaque circuit a des départs fixes. Choisissez le mois où vous souhaitez voyager, puis l'un des départs disponibles pour votre circuit.",
    },
  },
  {
    question: {
      en: "What happens if the weather is bad?",
      es: "¿Qué pasa si el clima no es favorable?",
      fr: "Que se passe-t-il en cas de mauvais temps ?",
    },
    answer: {
      en: "All activities depend on weather and sea conditions. Our guides adapt the itinerary for your safety. If a departure has to be cancelled because of weather, you can move to another date for free or get a full refund.",
      es: "Todas las actividades dependen del clima y del estado del mar. Nuestros guías adaptan el itinerario por tu seguridad. Si una salida se cancela por clima, puedes cambiarte a otra fecha sin costo o recibir un reembolso total.",
      fr: "Toutes les activités dépendent de la météo et de l'état de la mer. Nos guides adaptent l'itinéraire pour votre sécurité. Si un départ doit être annulé à cause de la météo, vous pouvez changer de date gratuitement ou être remboursé intégralement.",
    },
  },
  {
    question: {
      en: "How big are the groups?",
      es: "¿De qué tamaño son los grupos?",
      fr: "Quelle est la taille des groupes ?",
    },
    answer: {
      en: "A maximum of 10 travelers per departure, so every trip feels personal.",
      es: "Un máximo de 10 viajeros por salida, para que cada viaje se sienta personal.",
      fr: "Un maximum de 10 voyageurs par départ, pour que chaque voyage reste personnel.",
    },
  },
  {
    question: {
      en: "How does payment work?",
      es: "¿Cómo funciona el pago?",
      fr: "Comment fonctionne le paiement ?",
    },
    answer: {
      en: "Pay in full, or reserve with a 30% deposit when the departure is more than 30 days away. The balance is due 21 days before departure.",
      es: "Paga el total o aparta con un anticipo del 30% si la salida es dentro de más de 30 días. El saldo se liquida 21 días antes de la salida.",
      fr: "Payez la totalité, ou réservez avec un acompte de 30 % si le départ a lieu dans plus de 30 jours. Le solde est dû 21 jours avant le départ.",
    },
  },
  {
    question: {
      en: "Can I change my departure?",
      es: "¿Puedo cambiar mi salida?",
      fr: "Puis-je changer de départ ?",
    },
    answer: {
      en: "Yes, from “My trip”, to another departure of the same tour with space available. Free up to 30 days before departure and with a small fee up to 15 days before.",
      es: "Sí, desde “Mi viaje”, a otra salida del mismo tour con lugares disponibles. Sin costo hasta 30 días antes de la salida y con un cargo menor hasta 15 días antes.",
      fr: "Oui, depuis « Mon voyage », vers un autre départ du même circuit avec des places disponibles. Gratuit jusqu'à 30 jours avant le départ, puis avec de légers frais jusqu'à 15 jours avant.",
    },
  },
];
