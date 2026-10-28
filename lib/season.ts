export type Season = "spring" | "summer" | "autumn" | "winter";

export const SEASON_LABEL_FR: Record<Season, string> = {
  spring: "Printemps",
  summer: "Été",
  autumn: "Automne",
  winter: "Hiver",
};

// Meteorological seasons, indexed by month (0 = January), northern hemisphere.
const NORTH: Season[] = [
  "winter", "winter", "spring", "spring", "spring", "summer",
  "summer", "summer", "autumn", "autumn", "autumn", "winter",
];

// Known limit: UTC month, so a season can flip up to a day early/late near month edges; irrelevant for watering.
export function getSeason(date: Date, latitude: number): Season {
  const month = date.getUTCMonth();
  return NORTH[latitude < 0 ? (month + 6) % 12 : month];
}
