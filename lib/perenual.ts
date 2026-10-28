import { z } from "zod";
import type { Light } from "./catalog";

const API = "https://perenual.com/api/v2";

export interface SpeciesHit {
  perenualId: number;
  commonName: string;
  scientificName: string | null;
}

/** A species row to insert, whatever its source (catalog, Perenual or typed by the user). */
export interface SpeciesInput {
  slug: string | null;
  perenualId: number | null;
  commonName: string;
  scientificName: string | null;
  baseIntervalDays: number;
  light: Light;
  careNotes: string | null;
  source: "catalog" | "perenual" | "manual";
}

export class PerenualError extends Error {
  status: number;
  constructor(status: number) {
    super(`perenual ${status}`);
    this.status = status;
  }
}

const WATERING_DAYS: Record<string, number> = { Frequent: 3, Average: 7, Minimum: 14, None: 30 };
const DEFAULT_DAYS = 7;

// Free-tier responses replace some fields with "Upgrade Plans To Premium…" strings, so every
// optional field is read leniently and anything unexpected becomes null.
const hitSchema = z.object({
  id: z.number(),
  common_name: z.string(),
  scientific_name: z.unknown(),
});
const detailsSchema = hitSchema.extend({
  watering: z.unknown(),
  watering_general_benchmark: z.unknown(),
  sunlight: z.unknown(),
});

const firstString = (x: unknown) => (Array.isArray(x) && typeof x[0] === "string" ? x[0] : null);

export function parseBenchmark(value: string | null | undefined, unit?: string | null): number | null {
  const match = value?.replaceAll('"', "").trim().match(/^(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?$/);
  if (!match) return null;
  const low = Number(match[1]);
  const days = ((low + Number(match[2] ?? low)) / 2) * (/week/i.test(unit ?? "") ? 7 : 1);
  return days > 0 ? days : null;
}

/** Perenual sunlight labels ("full sun", "part shade"…) → our three light levels. */
export function lightFromSunlight(sunlight: string[]): Light {
  const s = sunlight.join(" ").toLowerCase();
  const sun = s.includes("sun");
  const shade = s.includes("shade");
  if (sun && !shade && s.includes("full sun")) return "sun";
  if (shade && !sun) return "shade";
  return "partial";
}

export function mapSearch(json: unknown): SpeciesHit[] {
  return z
    .object({ data: z.array(hitSchema) })
    .parse(json)
    .data.map((h) => ({
      perenualId: h.id,
      commonName: h.common_name,
      scientificName: firstString(h.scientific_name),
    }));
}

export function mapDetails(json: unknown): SpeciesInput {
  const d = detailsSchema.parse(json);
  const bench = d.watering_general_benchmark as { value?: unknown; unit?: unknown } | null;
  const benchDays =
    typeof bench?.value === "string"
      ? parseBenchmark(bench.value, typeof bench.unit === "string" ? bench.unit : null)
      : null;
  const labelDays = typeof d.watering === "string" ? WATERING_DAYS[d.watering] : undefined;
  const sunlight = Array.isArray(d.sunlight) ? d.sunlight.filter((s): s is string => typeof s === "string") : [];
  return {
    slug: null,
    perenualId: d.id,
    commonName: d.common_name,
    scientificName: firstString(d.scientific_name),
    baseIntervalDays: benchDays ?? labelDays ?? DEFAULT_DAYS,
    light: lightFromSunlight(sunlight),
    careNotes: null, // Perenual descriptions are English: not shown in a French UI
    source: "perenual",
  };
}

async function get(path: string, params: Record<string, string> = {}, init?: RequestInit): Promise<unknown> {
  const url = new URL(API + path);
  url.search = new URLSearchParams({ key: process.env.PERENUAL_API_KEY ?? "", ...params }).toString();
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000), ...init });
  if (!res.ok) throw new PerenualError(res.status);
  return res.json();
}

export async function searchSpecies(q: string): Promise<SpeciesHit[]> {
  // Free tier = 100 requests/day: identical searches are served from the Next data cache for 24 h.
  return mapSearch(await get("/species-list", { q: q.toLowerCase() }, { cache: "force-cache", next: { revalidate: 86_400 } }));
}

export async function getSpeciesDetails(id: number): Promise<SpeciesInput> {
  return mapDetails(await get(`/species/details/${id}`));
}
