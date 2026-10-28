import { z } from "zod";
import { findByScientific } from "./catalog";

// Pl@ntNet (Cirad, Inria, INRAE, IRD): image-based plant identification. The photo is forwarded
// once for identification and never stored. Key stays server-side (PLANTNET_API_KEY).
const API = "https://my-api.plantnet.org/v2/identify/all";

export interface Identification {
  scientificName: string;
  commonName: string | null;
  confidence: number; // 0-100
  catalogSlug: string | null;
}

export class PlantNetError extends Error {
  status: number;
  constructor(status: number) {
    super(`plantnet ${status}`);
    this.status = status;
  }
}

const responseSchema = z.object({
  results: z.array(
    z.object({
      score: z.number(),
      species: z.object({
        scientificNameWithoutAuthor: z.string(),
        commonNames: z.array(z.string()).optional(),
      }),
    }),
  ),
});

export function parsePlantnet(json: unknown): Identification[] {
  return responseSchema
    .parse(json)
    .results.slice(0, 3)
    .map((r) => ({
      scientificName: r.species.scientificNameWithoutAuthor,
      commonName: r.species.commonNames?.[0] ?? null,
      confidence: Math.round(r.score * 100),
      catalogSlug: findByScientific(r.species.scientificNameWithoutAuthor)?.slug ?? null,
    }));
}

export async function identifyPhoto(image: Blob): Promise<Identification[]> {
  const key = process.env.PLANTNET_API_KEY;
  if (!key) throw new PlantNetError(503);
  const body = new FormData();
  body.append("images", image, "plante.jpg");
  body.append("organs", "auto");
  const url = `${API}?${new URLSearchParams({ "api-key": key, lang: "fr", "nb-results": "3" })}`;
  const res = await fetch(url, { method: "POST", body, signal: AbortSignal.timeout(20_000) });
  if (res.status === 404) return []; // Pl@ntNet answers 404 when no species matches
  if (!res.ok) throw new PlantNetError(res.status);
  return parsePlantnet(await res.json());
}
