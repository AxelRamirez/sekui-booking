import type { Localized } from "@/lib/i18n/config";
import type { PhotoKey } from "./images";
import type { LocationSlug } from "./locations";

export type TourSlug =
  | "agua-verde-essentials"
  | "kayak-islands"
  | "sea-lions-snorkel"
  | "blue-whale-safari"
  | "mobula-season"
  | "local-fishing"
  | "desert-sea-trek"
  | "stargazing-escape"
  | "yoga-retreat"
  | "family-adventure"
  | "grand-expedition"
  | "couples-escape";

export type TourCategory = "sea" | "wildlife" | "land" | "wellness" | "family";
export type TourDifficulty = "easy" | "moderate" | "active";

export interface ItineraryDay {
  title: Localized;
  description: Localized;
}

export interface Tour {
  slug: TourSlug;
  /** Where the tour runs and which Sekui cabins host it. */
  location: LocationSlug;
  name: Localized;
  summary: Localized;
  description: Localized<string[]>;
  category: TourCategory;
  difficulty: TourDifficulty;
  days: number;
  nights: number;
  /** All-inclusive price per person in MXN (regular season). */
  basePrice: number;
  /** Maximum travelers per departure. */
  maxGuests: number;
  /** Months (1-12) with departures. */
  seasonMonths: number[];
  /** Weekdays (0 = Sunday) on which departures start. */
  departureWeekdays: number[];
  minAge: number;
  highlights: Localized<string[]>;
  /** Activity days between arrival and departure (length = days - 2). */
  activityDays: ItineraryDay[];
  image: PhotoKey;
  gallery: PhotoKey[];
}

const ALL_SEASON = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
const MAX_GUESTS = 10;

/** First and last days are the same for every package. */
export const arrivalDay: ItineraryDay = {
  title: { en: "Arrival & welcome to Agua Verde", es: "Llegada y bienvenida a Agua Verde", fr: "Arrivée et accueil à Agua Verde" },
  description: {
    en: "Private transfer from Loreto airport along the coastal road to Agua Verde. Check-in at your Sekui eco-cabin and welcome dinner by the sea.",
    es: "Traslado privado desde el aeropuerto de Loreto por la carretera costera hasta Agua Verde. Check-in en tu ecocabaña Sekui y cena de bienvenida frente al mar.",
    fr: "Transfert privé depuis l'aéroport de Loreto par la route côtière jusqu'à Agua Verde. Installation dans votre écocabane Sekui et dîner de bienvenue face à la mer.",
  },
};

export const departureDay: ItineraryDay = {
  title: { en: "Last sunrise & return", es: "Último amanecer y regreso", fr: "Dernier lever de soleil et retour" },
  description: {
    en: "Sunrise swim or walk on the beach, breakfast and transfer back to Loreto airport (arrival around 1 pm).",
    es: "Nado o caminata al amanecer, desayuno y traslado de regreso al aeropuerto de Loreto (llegada alrededor de la 1 pm).",
    fr: "Baignade ou balade au lever du soleil, petit-déjeuner et transfert retour vers l'aéroport de Loreto (arrivée vers 13 h).",
  },
};

const day = (enTitle: string, esTitle: string, frTitle: string, en: string, es: string, fr: string): ItineraryDay => ({
  title: { en: enTitle, es: esTitle, fr: frTitle },
  description: { en, es, fr },
});

export const tours: Tour[] = [
  {
    slug: "agua-verde-essentials",
    location: "agua-verde",
    name: { en: "Agua Verde Essentials", es: "Esencial Agua Verde", fr: "L'essentiel d'Agua Verde" },
    summary: {
      en: "The best of Agua Verde in four days: turquoise bays, kayak, snorkel and long dinners by the sea.",
      es: "Lo mejor de Agua Verde en cuatro días: bahías turquesa, kayak, snorkel y cenas largas frente al mar.",
      fr: "Le meilleur d'Agua Verde en quatre jours : baies turquoise, kayak, snorkeling et longs dîners face à la mer.",
    },
    description: {
      en: [
        "Our signature package and the perfect first visit. Agua Verde is a tiny fishing village between desert mountains and the Sea of Cortez — no crowds, no traffic, just water so clear you can see the bottom from the boat.",
        "You'll paddle hidden coves, snorkel over reefs full of color and share meals made with what local fishermen bring in that morning.",
      ],
      es: [
        "Nuestro paquete insignia y la primera visita perfecta. Agua Verde es un pequeño pueblo pesquero entre montañas desérticas y el Mar de Cortés: sin multitudes ni tráfico, solo agua tan clara que ves el fondo desde la lancha.",
        "Remarás por calas escondidas, harás snorkel sobre arrecifes llenos de color y compartirás comidas preparadas con lo que los pescadores traen esa mañana.",
      ],
      fr: [
        "Notre forfait phare et la première visite idéale. Agua Verde est un petit village de pêcheurs entre montagnes désertiques et mer de Cortés : pas de foule, pas de circulation, juste une eau si claire qu'on voit le fond depuis le bateau.",
        "Vous pagaierez dans des criques cachées, ferez du snorkeling au-dessus de récifs pleins de couleurs et partagerez des repas préparés avec ce que les pêcheurs rapportent le matin même.",
      ],
    },
    category: "sea",
    difficulty: "easy",
    days: 4,
    nights: 3,
    basePrice: 18900,
    maxGuests: MAX_GUESTS,
    seasonMonths: ALL_SEASON,
    departureWeekdays: [4],
    minAge: 8,
    highlights: {
      en: ["Kayak through hidden coves", "Reef snorkeling", "Boat trip to San Cosme island", "Fresh seafood dinners"],
      es: ["Kayak por calas escondidas", "Snorkel en arrecife", "Paseo en lancha a isla San Cosme", "Cenas con mariscos frescos"],
      fr: ["Kayak dans des criques cachées", "Snorkeling sur récif", "Sortie en bateau à l'île San Cosme", "Dîners de fruits de mer frais"],
    },
    activityDays: [
      day("Kayak & coves", "Kayak y calas", "Kayak et criques", "Morning kayak along the coast, picnic on a hidden beach and afternoon snorkel.", "Kayak por la mañana a lo largo de la costa, picnic en una playa escondida y snorkel por la tarde.", "Kayak le matin le long de la côte, pique-nique sur une plage cachée et snorkeling l'après-midi."),
      day("Island day", "Día de isla", "Journée sur l'île", "Boat trip to San Cosme island, snorkeling and sunset back at camp.", "Paseo en lancha a la isla San Cosme, snorkel y atardecer de regreso en el campamento.", "Sortie en bateau vers l'île San Cosme, snorkeling et coucher de soleil de retour au camp."),
    ],
    image: "turquoiseIsland",
    gallery: ["paddleboard", "fishSchool", "sunsetCabin", "campMeal"],
  },
  {
    slug: "kayak-islands",
    location: "agua-verde",
    name: { en: "Kayak & Islands Expedition", es: "Expedición Kayak e Islas", fr: "Expédition kayak et îles" },
    summary: {
      en: "Paddle between desert islands, sleep in eco-cabins and explore coves only reachable by sea.",
      es: "Rema entre islas desérticas, duerme en ecocabañas y explora calas a las que solo se llega por mar.",
      fr: "Pagayez entre des îles désertiques, dormez en écocabane et explorez des criques accessibles uniquement par la mer.",
    },
    description: {
      en: [
        "A five-day sea-kayak journey for active travelers. Each day we paddle between islands and empty beaches with a support boat carrying lunch and gear.",
        "Evenings are back at Sekui: hot showers, a real bed and dinner under the stars.",
      ],
      es: [
        "Un recorrido de cinco días en kayak de mar para viajeros activos. Cada día remamos entre islas y playas vacías con una lancha de apoyo que lleva la comida y el equipo.",
        "Por las noches regresamos a Sekui: regadera caliente, una cama de verdad y cena bajo las estrellas.",
      ],
      fr: [
        "Un voyage de cinq jours en kayak de mer pour voyageurs actifs. Chaque jour, nous pagayons entre îles et plages désertes, avec un bateau d'assistance qui transporte le déjeuner et le matériel.",
        "Le soir, retour chez Sekui : douche chaude, vrai lit et dîner sous les étoiles.",
      ],
    },
    category: "sea",
    difficulty: "active",
    days: 5,
    nights: 4,
    basePrice: 26900,
    maxGuests: MAX_GUESTS,
    seasonMonths: [10, 11, 12, 1, 2, 3, 4, 5],
    departureWeekdays: [1],
    minAge: 14,
    highlights: {
      en: ["3 days of sea kayaking", "Support boat & guide", "Island lunches", "Sunset paddles"],
      es: ["3 días de kayak de mar", "Lancha de apoyo y guía", "Comidas en islas", "Remadas al atardecer"],
      fr: ["3 jours de kayak de mer", "Bateau d'assistance et guide", "Déjeuners sur les îles", "Pagayages au coucher du soleil"],
    },
    activityDays: [
      day("North coast paddle", "Remada costa norte", "Pagaie sur la côte nord", "Paddle north along cliffs and sea caves, lunch on a pebble beach.", "Remada hacia el norte entre acantilados y cuevas marinas, comida en una playa de piedras.", "Pagaie vers le nord le long de falaises et de grottes marines, déjeuner sur une plage de galets."),
      day("Crossing to the island", "Cruce a la isla", "Traversée vers l'île", "Crossing to San Cosme with the support boat, snorkel and island picnic.", "Cruce a San Cosme con lancha de apoyo, snorkel y picnic en la isla.", "Traversée vers San Cosme avec le bateau d'assistance, snorkeling et pique-nique sur l'île."),
      day("Southern bays", "Bahías del sur", "Baies du sud", "Explore the southern bays and finish with a sunset paddle.", "Explora las bahías del sur y termina con una remada al atardecer.", "Exploration des baies du sud et pagaie au coucher du soleil pour finir."),
    ],
    image: "rockyCove",
    gallery: ["paddleboard", "coastAerial", "islandRock", "groupCampfire"],
  },
  {
    slug: "sea-lions-snorkel",
    location: "agua-verde",
    name: { en: "Snorkel with Sea Lions", es: "Snorkel con Lobos Marinos", fr: "Snorkeling avec les otaries" },
    summary: {
      en: "Swim alongside playful sea lions in their island colony — the most joyful encounter in the Sea of Cortez.",
      es: "Nada junto a lobos marinos juguetones en su colonia: el encuentro más alegre del Mar de Cortés.",
      fr: "Nagez aux côtés d'otaries joueuses dans leur colonie : la rencontre la plus joyeuse de la mer de Cortés.",
    },
    description: {
      en: [
        "Young sea lions are curious and love to play with snorkelers. With our licensed captains we visit the colony on calm mornings and respect the animals' space.",
        "Between swims there's time for kayak, beach walks and the slow rhythm of Agua Verde.",
      ],
      es: [
        "Los lobos marinos jóvenes son curiosos y les encanta jugar con quienes hacen snorkel. Con nuestros capitanes certificados visitamos la colonia en mañanas tranquilas, respetando el espacio de los animales.",
        "Entre nados hay tiempo para kayak, caminatas en la playa y el ritmo tranquilo de Agua Verde.",
      ],
      fr: [
        "Les jeunes otaries sont curieuses et adorent jouer avec les nageurs. Avec nos capitaines agréés, nous visitons la colonie par mer calme le matin, en respectant l'espace des animaux.",
        "Entre deux baignades, il reste du temps pour le kayak, les balades sur la plage et le rythme tranquille d'Agua Verde.",
      ],
    },
    category: "wildlife",
    difficulty: "easy",
    days: 4,
    nights: 3,
    basePrice: 21900,
    maxGuests: MAX_GUESTS,
    seasonMonths: [10, 11, 12, 3, 4, 5, 6],
    departureWeekdays: [6],
    minAge: 8,
    highlights: {
      en: ["Snorkel at the sea lion colony", "Dolphin sightings", "Wetsuit & gear included", "Small groups"],
      es: ["Snorkel en la colonia de lobos marinos", "Avistamiento de delfines", "Traje y equipo incluidos", "Grupos pequeños"],
      fr: ["Snorkeling dans la colonie d'otaries", "Observation des dauphins", "Combinaison et équipement inclus", "Petits groupes"],
    },
    activityDays: [
      day("Sea lion colony", "Colonia de lobos marinos", "Colonie d'otaries", "Boat to the colony, snorkel with sea lions and lunch on the boat.", "Lancha a la colonia, snorkel con lobos marinos y comida a bordo.", "Bateau jusqu'à la colonie, snorkeling avec les otaries et déjeuner à bord."),
      day("Reefs & dolphins", "Arrecifes y delfines", "Récifs et dauphins", "Reef snorkel in the morning; dolphin search on the way back.", "Snorkel en arrecife por la mañana; búsqueda de delfines de regreso.", "Snorkeling sur le récif le matin ; recherche de dauphins sur le chemin du retour."),
    ],
    image: "fishSchool",
    gallery: ["diver", "underwaterLight", "oceanAerial", "hammockCabin"],
  },
  {
    slug: "blue-whale-safari",
    location: "agua-verde",
    name: { en: "Blue Whale Safari", es: "Safari Ballena Azul", fr: "Safari baleine bleue" },
    summary: {
      en: "Meet the largest animal on Earth in Loreto Bay National Park during its winter visit.",
      es: "Conoce al animal más grande del planeta en el Parque Nacional Bahía de Loreto durante su visita invernal.",
      fr: "Rencontrez le plus grand animal de la planète dans le parc national de la baie de Loreto, lors de sa visite hivernale.",
    },
    description: {
      en: [
        "From January to March, blue whales feed in the waters of Loreto Bay. We head out with marine biologists to observe them responsibly — along with fin whales, humpbacks and huge pods of dolphins.",
        "Back in Agua Verde, evenings are for fire pits, stars and talks about the whales you met.",
      ],
      es: [
        "De enero a marzo, la ballena azul se alimenta en las aguas de la Bahía de Loreto. Salimos con biólogos marinos para observarla de forma responsable, junto con rorcuales, jorobadas y enormes grupos de delfines.",
        "De vuelta en Agua Verde, las noches son de fogata, estrellas y pláticas sobre las ballenas que conociste.",
      ],
      fr: [
        "De janvier à mars, la baleine bleue se nourrit dans les eaux de la baie de Loreto. Nous partons avec des biologistes marins pour l'observer de manière responsable, avec rorquals, baleines à bosse et immenses groupes de dauphins.",
        "De retour à Agua Verde, les soirées sont faites de feux de camp, d'étoiles et de récits sur les baleines rencontrées.",
      ],
    },
    category: "wildlife",
    difficulty: "easy",
    days: 5,
    nights: 4,
    basePrice: 32900,
    maxGuests: MAX_GUESTS,
    seasonMonths: [1, 2, 3],
    departureWeekdays: [3],
    minAge: 8,
    highlights: {
      en: ["Two whale-watching days", "Marine biologist on board", "Loreto Bay National Park", "Fire-pit nights"],
      es: ["Dos días de avistamiento", "Biólogo marino a bordo", "Parque Nacional Bahía de Loreto", "Noches de fogata"],
      fr: ["Deux jours d'observation", "Biologiste marin à bord", "Parc national de la baie de Loreto", "Soirées autour du feu"],
    },
    activityDays: [
      day("Blue whale day", "Día de ballena azul", "Journée baleine bleue", "Full day in Loreto Bay looking for blue and fin whales.", "Día completo en la Bahía de Loreto buscando ballena azul y rorcual.", "Journée complète dans la baie de Loreto à la recherche de baleines bleues et de rorquals."),
      day("Second whale day", "Segundo día de ballenas", "Deuxième journée baleines", "Second outing with a different route; photo-ID workshop.", "Segunda salida con otra ruta; taller de foto-identificación.", "Deuxième sortie sur un autre parcours ; atelier de photo-identification."),
      day("Agua Verde at your pace", "Agua Verde a tu ritmo", "Agua Verde à votre rythme", "Free morning, kayak or snorkel, and farewell dinner.", "Mañana libre, kayak o snorkel y cena de despedida.", "Matinée libre, kayak ou snorkeling, et dîner d'adieu."),
    ],
    image: "whaleSurface",
    gallery: ["humpbackBreach", "calmSea", "groupCampfire", "bedroomWarm"],
  },
  {
    slug: "mobula-season",
    location: "agua-verde",
    name: { en: "Mobula Ray Season", es: "Temporada de Mantarrayas", fr: "Saison des raies mobula" },
    summary: {
      en: "Thousands of leaping mobula rays fill the Sea of Cortez each spring. Snorkel among them.",
      es: "Miles de mantarrayas mobula saltan en el Mar de Cortés cada primavera. Haz snorkel entre ellas.",
      fr: "Des milliers de raies mobula bondissent dans la mer de Cortés chaque printemps. Faites du snorkeling parmi elles.",
    },
    description: {
      en: [
        "In May and June mobula rays gather by the thousands and leap out of the water in one of nature's most surprising displays.",
        "We go out early, when the sea is calm, to find the schools and slip into the water with them.",
      ],
      es: [
        "En mayo y junio las mantarrayas mobula se reúnen por miles y saltan fuera del agua en uno de los espectáculos más sorprendentes de la naturaleza.",
        "Salimos temprano, cuando el mar está en calma, para encontrar los cardúmenes y entrar al agua con ellas.",
      ],
      fr: [
        "En mai et juin, les raies mobula se rassemblent par milliers et bondissent hors de l'eau dans l'un des spectacles les plus surprenants de la nature.",
        "Nous partons tôt, quand la mer est calme, pour trouver les bancs et nous glisser dans l'eau avec elles.",
      ],
    },
    category: "wildlife",
    difficulty: "moderate",
    days: 4,
    nights: 3,
    basePrice: 24900,
    maxGuests: MAX_GUESTS,
    seasonMonths: [5, 6],
    departureWeekdays: [4],
    minAge: 10,
    highlights: {
      en: ["Snorkel with mobula rays", "Early-morning sea safaris", "Underwater photo tips", "Seafood feast"],
      es: ["Snorkel con mantarrayas", "Safaris marinos al amanecer", "Tips de foto submarina", "Festín de mariscos"],
      fr: ["Snorkeling avec les raies mobula", "Safaris marins à l'aube", "Conseils de photo sous-marine", "Festin de fruits de mer"],
    },
    activityDays: [
      day("Mobula safari", "Safari de mantarrayas", "Safari mobula", "Dawn departure to find mobula schools; snorkel sessions.", "Salida al amanecer para encontrar cardúmenes; sesiones de snorkel.", "Départ à l'aube pour trouver les bancs de mobulas ; séances de snorkeling."),
      day("Second safari & reef", "Segundo safari y arrecife", "Deuxième safari et récif", "Another mobula search and an afternoon on the reef.", "Otra búsqueda de mantarrayas y una tarde en el arrecife.", "Nouvelle recherche de mobulas et après-midi sur le récif."),
    ],
    image: "underwaterLight",
    gallery: ["diver", "seaTurtle", "turquoiseIsland", "campMeal"],
  },
  {
    slug: "local-fishing",
    location: "agua-verde",
    name: { en: "Fishing with Local Captains", es: "Pesca con Capitanes Locales", fr: "Pêche avec les capitaines locaux" },
    summary: {
      en: "Go out with the families who have fished Agua Verde for generations — and cook your catch at night.",
      es: "Sal con las familias que han pescado en Agua Verde por generaciones, y cocina tu pesca por la noche.",
      fr: "Partez avec les familles qui pêchent à Agua Verde depuis des générations, et cuisinez votre prise le soir.",
    },
    description: {
      en: [
        "Sport and traditional fishing with local captains: dorado, yellowtail and snapper depending on the season, always catch-and-release for protected species.",
        "In the evening our cook prepares your catch — ceviche, grilled fish and stories from the sea.",
      ],
      es: [
        "Pesca deportiva y tradicional con capitanes locales: dorado, jurel y huachinango según la temporada, siempre con captura y liberación para especies protegidas.",
        "Por la noche nuestra cocinera prepara tu pesca: ceviche, pescado a la leña e historias del mar.",
      ],
      fr: [
        "Pêche sportive et traditionnelle avec des capitaines locaux : dorade coryphène, sériole et vivaneau selon la saison, toujours en remise à l'eau pour les espèces protégées.",
        "Le soir, notre cuisinière prépare votre pêche : ceviche, poisson grillé au feu de bois et histoires de mer.",
      ],
    },
    category: "sea",
    difficulty: "easy",
    days: 4,
    nights: 3,
    basePrice: 22900,
    maxGuests: MAX_GUESTS,
    seasonMonths: [4, 5, 6, 7, 10],
    departureWeekdays: [5],
    minAge: 10,
    highlights: {
      en: ["Two fishing days", "Licensed local captains", "Cook your catch", "Gear included"],
      es: ["Dos días de pesca", "Capitanes locales certificados", "Cocina tu pesca", "Equipo incluido"],
      fr: ["Deux jours de pêche", "Capitaines locaux agréés", "Cuisinez votre pêche", "Équipement inclus"],
    },
    activityDays: [
      day("Offshore fishing", "Pesca mar adentro", "Pêche au large", "Full day of sport fishing with a local captain; catch dinner.", "Día completo de pesca deportiva con capitán local; cena con tu pesca.", "Journée complète de pêche sportive avec un capitaine local ; dîner avec votre prise."),
      day("Traditional fishing", "Pesca tradicional", "Pêche traditionnelle", "Hand-line fishing near the coast and an afternoon at the beach.", "Pesca con cordel cerca de la costa y tarde de playa.", "Pêche à la ligne près de la côte et après-midi à la plage."),
    ],
    image: "fishing",
    gallery: ["calmSea", "seaSunset", "campMeal", "sunsetCabin"],
  },
  {
    slug: "desert-sea-trek",
    location: "agua-verde",
    name: { en: "Desert & Sea Trek", es: "Travesía Desierto y Mar", fr: "Trek désert et mer" },
    summary: {
      en: "Hike desert ridges with views over the Sea of Cortez, then cool off in turquoise water.",
      es: "Camina por crestas desérticas con vista al Mar de Cortés y refréscate en agua turquesa.",
      fr: "Marchez sur des crêtes désertiques avec vue sur la mer de Cortés, puis rafraîchissez-vous dans une eau turquoise.",
    },
    description: {
      en: [
        "Agua Verde sits between the Sierra de la Giganta and the sea. This trek follows old ranch trails to viewpoints, oases and hidden beaches.",
        "Each hike ends by the water, and each night at your eco-cabin.",
      ],
      es: [
        "Agua Verde está entre la Sierra de la Giganta y el mar. Esta travesía sigue antiguos caminos de rancho hacia miradores, oasis y playas escondidas.",
        "Cada caminata termina junto al agua, y cada noche en tu ecocabaña.",
      ],
      fr: [
        "Agua Verde se niche entre la Sierra de la Giganta et la mer. Ce trek suit d'anciens chemins de ranch vers des belvédères, des oasis et des plages cachées.",
        "Chaque randonnée se termine au bord de l'eau, et chaque nuit dans votre écocabane.",
      ],
    },
    category: "land",
    difficulty: "active",
    days: 4,
    nights: 3,
    basePrice: 19900,
    maxGuests: MAX_GUESTS,
    seasonMonths: [11, 12, 1, 2, 3],
    departureWeekdays: [6],
    minAge: 12,
    highlights: {
      en: ["Sierra de la Giganta viewpoints", "Ranch trails & oasis", "Beach finishes", "Local ranch lunch"],
      es: ["Miradores de la Sierra de la Giganta", "Caminos de rancho y oasis", "Finales en la playa", "Comida en rancho local"],
      fr: ["Belvédères de la Sierra de la Giganta", "Chemins de ranch et oasis", "Arrivées sur la plage", "Déjeuner dans un ranch local"],
    },
    activityDays: [
      day("Ridge trail", "Sendero de la cresta", "Sentier de la crête", "Sunrise hike to the ridge viewpoint (4 h) and afternoon swim.", "Caminata al amanecer al mirador (4 h) y nado por la tarde.", "Randonnée au lever du soleil jusqu'au belvédère (4 h) et baignade l'après-midi."),
      day("Oasis & ranch", "Oasis y rancho", "Oasis et ranch", "Trail to a palm oasis and lunch at a family ranch.", "Sendero a un oasis de palmas y comida en un rancho familiar.", "Sentier vers une oasis de palmiers et déjeuner dans un ranch familial."),
    ],
    image: "ridgeHiker",
    gallery: ["dunes", "coastAerial", "groupCampfire", "aFrame"],
  },
  {
    slug: "stargazing-escape",
    location: "agua-verde",
    name: { en: "Stargazing Escape", es: "Escape de Estrellas", fr: "Escapade sous les étoiles" },
    summary: {
      en: "Three nights under one of the darkest skies in Mexico, with telescope sessions and night boat rides.",
      es: "Tres días bajo uno de los cielos más oscuros de México, con sesiones de telescopio y paseos nocturnos en lancha.",
      fr: "Trois jours sous l'un des ciels les plus sombres du Mexique, avec séances de télescope et sorties en bateau de nuit.",
    },
    description: {
      en: [
        "With no city lights for miles, Agua Verde's night sky is spectacular. An astronomy guide leads telescope sessions and teaches you to read the sky.",
        "Days are slow: hammocks, swims and a sunset boat ride.",
      ],
      es: [
        "Sin luces de ciudad en kilómetros, el cielo nocturno de Agua Verde es espectacular. Un guía de astronomía dirige sesiones de telescopio y te enseña a leer el cielo.",
        "Los días son lentos: hamacas, nados y un paseo en lancha al atardecer.",
      ],
      fr: [
        "Sans lumières de ville à des kilomètres à la ronde, le ciel nocturne d'Agua Verde est spectaculaire. Un guide en astronomie anime des séances de télescope et vous apprend à lire le ciel.",
        "Les journées sont tranquilles : hamacs, baignades et sortie en bateau au coucher du soleil.",
      ],
    },
    category: "wellness",
    difficulty: "easy",
    days: 3,
    nights: 2,
    basePrice: 14900,
    maxGuests: MAX_GUESTS,
    seasonMonths: ALL_SEASON,
    departureWeekdays: [5],
    minAge: 6,
    highlights: {
      en: ["Telescope sessions", "Night boat ride", "Astrophotography basics", "Sunset on the water"],
      es: ["Sesiones de telescopio", "Paseo nocturno en lancha", "Bases de astrofotografía", "Atardecer en el agua"],
      fr: ["Séances de télescope", "Sortie en bateau de nuit", "Bases de l'astrophotographie", "Coucher de soleil sur l'eau"],
    },
    activityDays: [
      day("Sky & sea", "Cielo y mar", "Ciel et mer", "Sunset boat ride, dinner and a two-hour telescope session.", "Paseo en lancha al atardecer, cena y sesión de telescopio de dos horas.", "Sortie en bateau au coucher du soleil, dîner et séance de télescope de deux heures."),
    ],
    image: "milkyWay",
    gallery: ["nightBoat", "starryForest", "hammockCabin", "seaSunset"],
  },
  {
    slug: "yoga-retreat",
    location: "agua-verde",
    name: { en: "Yoga & Wellness Retreat", es: "Retiro de Yoga y Bienestar", fr: "Retraite yoga et bien-être" },
    summary: {
      en: "Sunrise yoga, healthy food and the silence of the desert by the sea.",
      es: "Yoga al amanecer, comida saludable y el silencio del desierto junto al mar.",
      fr: "Yoga au lever du soleil, cuisine saine et le silence du désert au bord de la mer.",
    },
    description: {
      en: [
        "A five-day retreat with two daily yoga sessions on our deck over the bay, guided meditation and plenty of time to do nothing at all.",
        "All levels are welcome. Meals are plant-forward and made with local ingredients.",
      ],
      es: [
        "Un retiro de cinco días con dos sesiones diarias de yoga en nuestra terraza sobre la bahía, meditación guiada y mucho tiempo para no hacer nada.",
        "Todos los niveles son bienvenidos. Las comidas son principalmente vegetales y con ingredientes locales.",
      ],
      fr: [
        "Une retraite de cinq jours avec deux séances de yoga par jour sur notre terrasse dominant la baie, de la méditation guidée et beaucoup de temps pour ne rien faire.",
        "Tous niveaux bienvenus. Les repas sont principalement végétaux et préparés avec des produits locaux.",
      ],
    },
    category: "wellness",
    difficulty: "easy",
    days: 5,
    nights: 4,
    basePrice: 27900,
    maxGuests: MAX_GUESTS,
    seasonMonths: [10, 11, 1, 2, 3, 4, 5],
    departureWeekdays: [0],
    minAge: 16,
    highlights: {
      en: ["Two yoga sessions a day", "Guided meditation", "Plant-forward menu", "Paddleboard at sunrise"],
      es: ["Dos sesiones de yoga al día", "Meditación guiada", "Menú principalmente vegetal", "Paddleboard al amanecer"],
      fr: ["Deux séances de yoga par jour", "Méditation guidée", "Menu principalement végétal", "Paddle au lever du soleil"],
    },
    activityDays: [
      day("Arrive in your body", "Llegar al cuerpo", "Revenir à soi", "Sunrise yoga, brunch and an afternoon of rest and swimming.", "Yoga al amanecer, brunch y una tarde de descanso y nado.", "Yoga au lever du soleil, brunch et après-midi de repos et de baignade."),
      day("Sea & stillness", "Mar y quietud", "Mer et sérénité", "Sunrise paddleboard, yoga and guided meditation at sunset.", "Paddleboard al amanecer, yoga y meditación guiada al atardecer.", "Paddle au lever du soleil, yoga et méditation guidée au coucher du soleil."),
      day("Open day", "Día abierto", "Journée libre", "Yoga, optional massage and farewell circle.", "Yoga, masaje opcional y círculo de despedida.", "Yoga, massage optionnel et cercle d'adieu."),
    ],
    image: "yogaSunset",
    gallery: ["meditation", "paddleboard", "bedroomTufted", "beachSunrise"],
  },
  {
    slug: "family-adventure",
    location: "agua-verde",
    name: { en: "Family Adventure", es: "Aventura en Familia", fr: "Aventure en famille" },
    summary: {
      en: "Kayak, snorkel, sea turtles and campfires — designed for kids and the adults who travel with them.",
      es: "Kayak, snorkel, tortugas y fogatas: diseñado para niños y los adultos que viajan con ellos.",
      fr: "Kayak, snorkeling, tortues et feux de camp : conçu pour les enfants et les adultes qui voyagent avec eux.",
    },
    description: {
      en: [
        "A gentle-paced itinerary for families with kids from 5 years old. Shallow-water snorkeling, beach games, a visit to a turtle conservation project and plenty of downtime.",
        "Family eco-cabins have room for everyone, and our guides are trained to work with children.",
      ],
      es: [
        "Un itinerario a ritmo tranquilo para familias con niños desde 5 años. Snorkel en aguas bajas, juegos en la playa, visita a un proyecto de conservación de tortugas y mucho tiempo libre.",
        "Las ecocabañas familiares tienen espacio para todos y nuestros guías están capacitados para trabajar con niños.",
      ],
      fr: [
        "Un itinéraire au rythme doux pour les familles avec enfants dès 5 ans. Snorkeling en eaux peu profondes, jeux de plage, visite d'un projet de conservation des tortues et beaucoup de temps libre.",
        "Les écocabanes familiales ont de la place pour tous, et nos guides sont formés pour accompagner les enfants.",
      ],
    },
    category: "family",
    difficulty: "easy",
    days: 4,
    nights: 3,
    basePrice: 17900,
    maxGuests: MAX_GUESTS,
    seasonMonths: [12, 4, 7],
    departureWeekdays: [1],
    minAge: 5,
    highlights: {
      en: ["Kid-friendly snorkeling", "Sea turtle project", "Family eco-cabins", "S'mores by the fire"],
      es: ["Snorkel para niños", "Proyecto de tortugas", "Ecocabañas familiares", "Bombones en la fogata"],
      fr: ["Snorkeling adapté aux enfants", "Projet de conservation des tortues", "Écocabanes familiales", "Guimauves au feu de camp"],
    },
    activityDays: [
      day("Beach & snorkel", "Playa y snorkel", "Plage et snorkeling", "Shallow snorkel, kayak in pairs and beach games.", "Snorkel en aguas bajas, kayak en parejas y juegos en la playa.", "Snorkeling en eaux peu profondes, kayak à deux et jeux de plage."),
      day("Turtles & fire", "Tortugas y fogata", "Tortues et feu de camp", "Visit a turtle conservation project and campfire night.", "Visita a un proyecto de conservación de tortugas y noche de fogata.", "Visite d'un projet de conservation des tortues et soirée autour du feu."),
    ],
    image: "familyBeach",
    gallery: ["seaTurtle", "campfire", "aFrame", "turquoiseIsland"],
  },
  {
    slug: "grand-expedition",
    location: "agua-verde",
    name: { en: "Sea of Cortez Grand Expedition", es: "Gran Expedición Mar de Cortés", fr: "Grande expédition mer de Cortés" },
    summary: {
      en: "A week of kayak, snorkel, hiking and wildlife — the complete Agua Verde experience.",
      es: "Una semana de kayak, snorkel, senderismo y fauna: la experiencia completa de Agua Verde.",
      fr: "Une semaine de kayak, snorkeling, randonnée et faune : l'expérience complète d'Agua Verde.",
    },
    description: {
      en: [
        "Seven days that bring together everything we love about Agua Verde: islands by kayak, reefs and sea lions, desert ridges and nights under the Milky Way.",
        "Ideal for travelers who want to go deep, with a small group and expert local guides.",
      ],
      es: [
        "Siete días que reúnen todo lo que amamos de Agua Verde: islas en kayak, arrecifes y lobos marinos, crestas desérticas y noches bajo la Vía Láctea.",
        "Ideal para viajeros que quieren vivirlo a fondo, en grupo pequeño y con guías locales expertos.",
      ],
      fr: [
        "Sept jours qui réunissent tout ce que nous aimons à Agua Verde : les îles en kayak, les récifs et les otaries, les crêtes désertiques et les nuits sous la Voie lactée.",
        "Idéal pour les voyageurs qui veulent aller au fond des choses, en petit groupe et avec des guides locaux experts.",
      ],
    },
    category: "sea",
    difficulty: "active",
    days: 7,
    nights: 6,
    basePrice: 42900,
    maxGuests: MAX_GUESTS,
    seasonMonths: [10, 11, 3, 4, 5],
    departureWeekdays: [6],
    minAge: 14,
    highlights: {
      en: ["Kayak, snorkel & hiking", "Sea lion colony", "Island picnics", "Stargazing night"],
      es: ["Kayak, snorkel y senderismo", "Colonia de lobos marinos", "Picnics en islas", "Noche de estrellas"],
      fr: ["Kayak, snorkeling et randonnée", "Colonie d'otaries", "Pique-niques sur les îles", "Soirée sous les étoiles"],
    },
    activityDays: [
      day("Coastal kayak", "Kayak costero", "Kayak côtier", "Paddle north to sea caves and empty beaches.", "Remada hacia el norte a cuevas marinas y playas vacías.", "Pagaie vers le nord jusqu'aux grottes marines et aux plages désertes."),
      day("Sea lions", "Lobos marinos", "Otaries", "Snorkel with the sea lion colony and reef afternoon.", "Snorkel con la colonia de lobos marinos y tarde de arrecife.", "Snorkeling avec la colonie d'otaries et après-midi sur le récif."),
      day("Desert ridge", "Cresta desértica", "Crête désertique", "Sunrise hike with views of the sea and the sierra.", "Caminata al amanecer con vista al mar y la sierra.", "Randonnée au lever du soleil avec vue sur la mer et la sierra."),
      day("Island crossing", "Cruce a la isla", "Traversée vers l'île", "Boat and kayak day around San Cosme island.", "Día de lancha y kayak alrededor de la isla San Cosme.", "Journée en bateau et en kayak autour de l'île San Cosme."),
      day("Stars & farewell", "Estrellas y despedida", "Étoiles et adieux", "Free day, farewell dinner and telescope session.", "Día libre, cena de despedida y sesión de telescopio.", "Journée libre, dîner d'adieu et séance de télescope."),
    ],
    image: "coastAerial",
    gallery: ["rockyCove", "fishSchool", "ridgeHiker", "milkyWay"],
  },
  {
    slug: "couples-escape",
    location: "agua-verde",
    name: { en: "Couples Escape", es: "Escapada en Pareja", fr: "Escapade en amoureux" },
    summary: {
      en: "Private sunsets, a romantic dinner on the beach and slow mornings in your eco-cabin.",
      es: "Atardeceres privados, una cena romántica en la playa y mañanas lentas en tu ecocabaña.",
      fr: "Couchers de soleil privés, dîner romantique sur la plage et matinées paisibles dans votre écocabane.",
    },
    description: {
      en: [
        "A short escape for two: a private boat ride at sunset, a candlelit dinner on the sand and couples massage.",
        "Perfect for anniversaries, honeymoons or simply remembering why you travel together.",
      ],
      es: [
        "Una escapada corta para dos: paseo privado en lancha al atardecer, cena a la luz de las velas en la arena y masaje en pareja.",
        "Perfecto para aniversarios, lunas de miel o simplemente recordar por qué viajan juntos.",
      ],
      fr: [
        "Une courte escapade à deux : sortie privée en bateau au coucher du soleil, dîner aux chandelles sur le sable et massage en duo.",
        "Parfait pour un anniversaire, une lune de miel ou simplement se rappeler pourquoi vous voyagez ensemble.",
      ],
    },
    category: "wellness",
    difficulty: "easy",
    days: 3,
    nights: 2,
    basePrice: 16900,
    maxGuests: MAX_GUESTS,
    seasonMonths: ALL_SEASON,
    departureWeekdays: [4],
    minAge: 18,
    highlights: {
      en: ["Private sunset boat", "Beach dinner", "Couples massage", "Breakfast in the cabin"],
      es: ["Lancha privada al atardecer", "Cena en la playa", "Masaje en pareja", "Desayuno en la cabaña"],
      fr: ["Bateau privé au coucher du soleil", "Dîner sur la plage", "Massage en duo", "Petit-déjeuner dans la cabane"],
    },
    activityDays: [
      day("Just the two of you", "Solo ustedes dos", "Rien que vous deux", "Massage, kayak for two and a candlelit dinner on the beach.", "Masaje, kayak para dos y cena a la luz de las velas en la playa.", "Massage, kayak à deux et dîner aux chandelles sur la plage."),
    ],
    image: "sunsetReflection",
    gallery: ["beachDusk", "bedroomWarm", "seaSunset", "sunsetCabin"],
  },
];

export function getTour(slug: string): Tour | undefined {
  return tours.find((t) => t.slug === slug);
}

export function toursAt(location: LocationSlug): Tour[] {
  return tours.filter((t) => t.location === location);
}

export function itineraryFor(tour: Tour): ItineraryDay[] {
  return [arrivalDay, ...tour.activityDays, departureDay];
}
