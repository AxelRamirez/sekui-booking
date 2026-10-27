/**
 * Placeholder photography (Unsplash). Swap these IDs for the client's own assets.
 */
const photos = {
  // Sea & coast
  turquoiseIsland: "1535262412227-85541e910204",
  islandRock: "1559128010-7c1ad6e1b6a5",
  rockyCove: "1510414842594-a61c69b5ae57",
  coastAerial: "1547036967-23d11aacaee0",
  oceanAerial: "1505118380757-91f5f5632de0",
  seaSunset: "1414609245224-afa02bfb3fda",
  beachDusk: "1473116763249-2faaef81ccda",
  beachSunrise: "1471922694854-ff1b63b20054",
  calmSea: "1468581264429-2548ef9eb732",
  sunsetReflection: "1490730141103-6cac27aaab94",
  wave: "1559827260-dc66d52bef19",
  // Wildlife & underwater
  fishSchool: "1544551763-46a013bb70d5",
  diver: "1517627043994-b991abb62fc8",
  underwaterLight: "1530053969600-caed2596d242",
  seaTurtle: "1437622368342-7a3d73a34c8f",
  humpbackBreach: "1568430462989-44163eb1752f",
  whaleSurface: "1518877593221-1f28583780b4",
  // Activities
  paddleboard: "1517176118179-65244903d13c",
  fishing: "1545450660-3378a7f3a364",
  yogaSunset: "1544367567-0f2fcb009e0b",
  meditation: "1506126613408-eca07ce68773",
  ridgeHiker: "1682687220742-aba13b6e50ba",
  dunes: "1473580044384-7ba9967e16a0",
  familyBeach: "1511895426328-dc8714191300",
  groupCampfire: "1478131143081-80f7f84ca84d",
  campMeal: "1504674900247-0877df9cc836",
  milkyWay: "1419242902214-272b3f66ee7a",
  nightBoat: "1534447677768-be436bb09401",
  starryForest: "1504851149312-7a075b496cc7",
  // Eco-cabins
  sunsetCabin: "1542718610-a1d656d1884c",
  aFrame: "1595521624992-48a59aef95e3",
  hammockCabin: "1499696010180-025ef6e1a8f9",
  bedroomWarm: "1618773928121-c32242e63f39",
  bedroomTufted: "1505693416388-ac5ce068fe85",
  livingSunny: "1600210492486-724fe5c67fb0",
  campfire: "1510672981848-a1c4f1cb5ccf",
  modernCabin: "1600585154340-be6161a56a0c",
  woodlandCabin: "1587061949409-02df41d5e562",
  // Valle de Guadalupe
  vineyardView: "1506377247377-2a5b3b417ebb",
  vineyardSunrise: "1504279577054-acfeccf8fc52",
  vineyardSunset: "1543418219-44e30b057fea",
  vineyardRows: "1560493676-04071c5f467b",
  wineToast: "1510812431401-41d2bd2722f3",
  winePour: "1470158499416-75be9aa0c4db",
  wineCellar: "1562601579-599dec564e06",
  // Guests (testimonials)
  guestMarco: "1507003211169-0a1dd7228f2d",
  guestValeria: "1494790108377-be9c29b29330",
  guestRobert: "1472099645785-5658abf4ff4e",
  guestEmma: "1438761681033-6461ffad8d80",
} as const;

export type PhotoKey = keyof typeof photos;

export function photo(key: PhotoKey, width = 1600): string {
  return `https://images.unsplash.com/photo-${photos[key]}?auto=format&fit=crop&w=${width}&q=80`;
}

/** Looping hero video (placeholder clip from Mixkit), served from /public. */
export const heroVideo = {
  desktop: "/media/hero-720.mp4",
  mobile: "/media/hero-360.mp4",
  poster: "/media/hero-poster.jpg",
};
