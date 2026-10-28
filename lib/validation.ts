import { z } from "zod";
import { getCatalogPlant } from "./catalog";

// FormData sends "" for empty inputs; treat that as "not provided".
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), schema.optional());

const FUTURE_TOLERANCE_MS = 5 * 60_000;

const isTimeZone = (tz: string) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

export const wateringInputSchema = z.object({
  plantId: z.uuid(),
  wateredAt: optional(
    z.coerce.date().refine((d) => d.getTime() <= Date.now() + FUTURE_TOLERANCE_MS, "La date ne peut pas être dans le futur"),
  ),
  note: optional(z.string().trim().max(200)),
});

const plantCommon = {
  nickname: z.string().trim().min(1, "Donne un nom à ta plante").max(60),
  location: z.enum(["indoor", "outdoor"]),
};
// Watering profile chosen by the user when no catalog sheet exists: Souvent / Normal / Peu / Très peu.
export const WATER_PROFILES = [3, 7, 14, 21] as const;
const profile = {
  waterDays: z.enum(WATER_PROFILES.map(String) as ["3", "7", "14", "21"], "Choisis un besoin en eau").transform(Number),
  light: z.enum(["sun", "partial", "shade"], "Choisis une exposition"),
};
const speciesName = z.string().trim().min(2, "Indique le nom de la plante").max(160);

export const plantInputSchema = z.discriminatedUnion("source", [
  z.object({
    source: z.literal("catalog"),
    slug: z.string().refine((s) => getCatalogPlant(s) !== undefined, "Plante inconnue du catalogue"),
    ...plantCommon,
  }),
  z.object({ source: z.literal("perenual"), perenualId: z.coerce.number().int().positive(), speciesName, ...profile, ...plantCommon }),
  z.object({ source: z.literal("manual"), speciesName, ...profile, ...plantCommon }),
]);
export type PlantInput = z.infer<typeof plantInputSchema>;

export const homeInputSchema = z.object({
  city: optional(z.string().trim().max(120)),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  timezone: z.string().min(1).refine(isTimeZone, "Fuseau horaire inconnu"),
  emailAlerts: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()),
});


export const plantSettingsSchema = z.object({
  plantId: z.uuid(),
  intervalOverrideDays: optional(z.coerce.number().positive().max(365)),
  archive: optional(z.enum(["archive", "restore"])), // absent = keep the current state
});

/** Honeypot: humans never see or fill the hidden "website" field (see components/honeypot.tsx). */
export const isBot = (formData: FormData) => Boolean(formData.get("website"));
