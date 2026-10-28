import { getSeason, SEASON_LABEL_FR, type Season } from "./season";

export type PlantLocation = "indoor" | "outdoor";

export interface DailyWeather {
  date: string; // YYYY-MM-DD in the home's timezone
  tempMaxC: number | null;
  tempMinC: number | null;
  precipitationMm: number | null;
  et0Mm: number | null;
}

export interface WateringInput {
  lastWateredAt: Date;
  baseIntervalDays: number;
  location: PlantLocation;
  latitude: number;
  now: Date;
  et0Avg7d: number | null;
}

export interface WateringResult {
  nextAt: Date;
  factors: { season: number; weather: number };
  reason: string;
}

export type WateringStatus = "overdue" | "today" | "upcoming";

const DAY_MS = 86_400_000;
const REFERENCE_ET0_MM = 3;
const RAIN_THRESHOLD_MM = 10;

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function seasonFactor(season: Season, location: PlantLocation): number {
  if (season === "summer") return 0.8;
  if (season === "winter") return location === "outdoor" ? 1.5 : 1.3;
  return 1;
}

export function computeNextWatering(i: WateringInput): WateringResult {
  const season = getSeason(i.now, i.latitude);
  const factors = {
    season: seasonFactor(season, i.location),
    weather: i.location === "outdoor" && i.et0Avg7d ? clamp(REFERENCE_ET0_MM / i.et0Avg7d, 0.6, 1.4) : 1,
  };
  const intervalDays = i.baseIntervalDays * factors.season * factors.weather;

  const labelled: [string, number][] = [
    [SEASON_LABEL_FR[season], factors.season],
    ["Météo", factors.weather],
  ];
  const reason =
    labelled
      .filter(([, f]) => f !== 1)
      .map(([label, f]) => `${label} ×${Number(f.toFixed(2))}`)
      .join(" · ") || "Intervalle standard";

  return { nextAt: new Date(i.lastWateredAt.getTime() + intervalDays * DAY_MS), factors, reason };
}

export function dayKey(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(date); // en-CA → YYYY-MM-DD
}

export function wateringStatus(nextAt: Date, now: Date, timeZone: string): WateringStatus {
  const next = dayKey(nextAt, timeZone);
  const today = dayKey(now, timeZone);
  return next < today ? "overdue" : next === today ? "today" : "upcoming";
}

// Rain counts as a watering once ≥ 10 mm fell on days strictly after the last watering day.
// Known limit: returned at 12:00 UTC, same calendar day for any timezone within UTC±11.
export function detectRainWatering(
  days: DailyWeather[],
  lastWateredAt: Date,
  timeZone: string,
  now: Date,
): Date | null {
  const from = dayKey(lastWateredAt, timeZone);
  const today = dayKey(now, timeZone);
  let total = 0;
  for (const d of [...days].sort((a, b) => a.date.localeCompare(b.date))) {
    if (d.date <= from || d.date > today) continue;
    total += d.precipitationMm ?? 0;
    if (total >= RAIN_THRESHOLD_MM) return new Date(`${d.date}T12:00:00Z`);
  }
  return null;
}

/** Whole calendar days from today to nextAt in the home timezone (negative when overdue). */
export function daysUntil(nextAt: Date, now: Date, timeZone: string): number {
  const toUtcMidnight = (d: Date) => Date.parse(`${dayKey(d, timeZone)}T00:00:00Z`);
  return Math.round((toUtcMidnight(nextAt) - toUtcMidnight(now)) / DAY_MS);
}
