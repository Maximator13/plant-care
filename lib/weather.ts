import { z } from "zod";
import { SEASON_LABEL_FR, type Season } from "./season";
import type { DailyWeather } from "./watering";

export interface WeatherMetrics {
  today: string;
  tempMaxC: number | null; // max over today..today+2
  tempMinC: number | null; // min over today..today+2
  rain48hMm: number;
  et0Avg7d: number | null;
  heatDays: number;
}

export const weatherContextSchema = z.object({
  season: z.enum(["spring", "summer", "autumn", "winter"]),
  heatwave: z.boolean(),
  frostRisk: z.boolean(),
  rain48hMm: z.number(),
  et0AvgMm: z.number().nullable(),
  tempMaxC: z.number().nullable(),
  tempMinC: z.number().nullable(),
  summary: z.string().max(200),
});
export type WeatherContext = z.infer<typeof weatherContextSchema>;

const HEAT_C = 30;
const FROST_C = 2;

const series = z.array(z.number().nullable());
const openMeteoSchema = z.object({
  timezone: z.string(),
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: series,
    temperature_2m_min: series,
    precipitation_sum: series,
    et0_fao_evapotranspiration: series,
  }),
});

export function parseOpenMeteo(json: unknown): { timezone: string; days: DailyWeather[] } {
  const { timezone, daily } = openMeteoSchema.parse(json);
  return {
    timezone,
    days: daily.time.map((date, i) => ({
      date,
      tempMaxC: daily.temperature_2m_max[i] ?? null,
      tempMinC: daily.temperature_2m_min[i] ?? null,
      precipitationMm: daily.precipitation_sum[i] ?? null,
      et0Mm: daily.et0_fao_evapotranspiration[i] ?? null,
    })),
  };
}

export async function fetchWeather(latitude: number, longitude: number) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration",
    past_days: "7",
    forecast_days: "3",
    timezone: "auto",
  }).toString();
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`open-meteo ${res.status}`);
  return parseOpenMeteo(await res.json());
}

const nums = (xs: (number | null)[]) => xs.filter((x): x is number => x !== null);

export function summarizeWeather(days: DailyWeather[], today: string): WeatherMetrics {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const past = sorted.filter((d) => d.date < today).slice(-7);
  const next = sorted.filter((d) => d.date >= today).slice(0, 3);
  const et0 = nums(past.map((d) => d.et0Mm));
  const maxes = nums(next.map((d) => d.tempMaxC));
  const mins = nums(next.map((d) => d.tempMinC));
  return {
    today,
    tempMaxC: maxes.length ? Math.max(...maxes) : null,
    tempMinC: mins.length ? Math.min(...mins) : null,
    rain48hMm: next.slice(0, 2).reduce((sum, d) => sum + (d.precipitationMm ?? 0), 0),
    et0Avg7d: et0.length ? et0.reduce((a, b) => a + b, 0) / et0.length : null,
    heatDays: maxes.filter((t) => t >= HEAT_C).length,
  };
}

export function buildWeatherContext(m: WeatherMetrics, season: Season): WeatherContext {
  const heatwave = m.heatDays >= 2;
  const frostRisk = m.tempMinC !== null && m.tempMinC < FROST_C;
  const temps = m.tempMinC !== null && m.tempMaxC !== null ? `${Math.round(m.tempMinC)}–${Math.round(m.tempMaxC)} °C, ` : "";
  const notes = [heatwave && "vague de chaleur", frostRisk && "risque de gel"].filter(Boolean).join(", ");
  return {
    season,
    heatwave,
    frostRisk,
    rain48hMm: m.rain48hMm,
    et0AvgMm: m.et0Avg7d,
    tempMaxC: m.tempMaxC,
    tempMinC: m.tempMinC,
    summary: `${SEASON_LABEL_FR[season]} : ${temps}${Math.round(m.rain48hMm)} mm de pluie prévus sur 48 h${notes ? ` (${notes})` : ""}.`,
  };
}

const geocodeSchema = z.object({
  results: z
    .array(
      z.object({
        name: z.string(),
        country: z.string().default(""),
        latitude: z.number(),
        longitude: z.number(),
        timezone: z.string(),
      }),
    )
    .optional(),
});

export async function geocodeCity(query: string) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({ name: query, count: "5", language: "fr" }).toString();
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`open-meteo geocoding ${res.status}`);
  return geocodeSchema.parse(await res.json()).results ?? [];
}
