"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { homes, plants, pushSubscriptions, wateringLogs } from "@/db/schema";
import { PerenualError, searchSpecies, type SpeciesHit } from "@/lib/perenual";
import {
  ensureSpecies,
  getHomeForUser,
  getOwnedPlant,
  requireUserId,
} from "@/lib/plants";
import { pushSubscriptionSchema, sendPush } from "@/lib/push";
import { consumeQuota } from "@/lib/quota";
import { recomputePlant } from "@/lib/recompute";
import { homeInputSchema, isBot, plantInputSchema, plantSettingsSchema, wateringInputSchema } from "@/lib/validation";
import { geocodeCity } from "@/lib/weather";
import { identifyPhoto, PlantNetError, type Identification } from "@/lib/plantnet";

export type ActionState = { error?: string } | undefined;

const firstError = (issues: { message: string }[]) => issues[0]?.message ?? "Formulaire invalide";
const refreshAll = () => revalidatePath("/", "layout");
const BOT_REJECTED = { error: "Envoi refusé." };

export async function saveHome(_: ActionState, formData: FormData): Promise<ActionState> {
  if (isBot(formData)) return BOT_REJECTED;
  const userId = await requireUserId();
  const parsed = homeInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error.issues) };
  const { city, ...values } = parsed.data;
  await db
    .insert(homes)
    .values({ userId, city: city ?? null, ...values })
    .onConflictDoUpdate({ target: homes.userId, set: { city: city ?? null, ...values } });
  refreshAll();
  redirect("/");
}

export async function findCity(query: string) {
  await requireUserId();
  if (query.trim().length < 2) return [];
  try {
    return await geocodeCity(query.trim());
  } catch {
    return [];
  }
}

/** Extended search on Perenual (names only on the free tier). The built-in catalog is searched client-side. */
export async function findPerenualSpecies(query: string): Promise<{ hits: SpeciesHit[]; error: boolean }> {
  const userId = await requireUserId();
  const q = query.trim();
  if (q.length < 3 || q.length > 80) return { hits: [], error: false };
  if (!(await consumeQuota(userId, "perenual"))) return { hits: [], error: true };
  try {
    return { hits: (await searchSpecies(q)).slice(0, 8), error: false };
  } catch (error) {
    if (!(error instanceof PerenualError)) console.error("perenual search", error);
    return { hits: [], error: true };
  }
}

const MAX_PHOTO_BYTES = 900_000; // the browser resizes to ~1024 px JPEG; Server Actions accept 1 MB

export async function identifyFromPhoto(
  formData: FormData,
): Promise<{ results: Identification[]; error?: string }> {
  if (isBot(formData)) return { results: [], error: "Envoi refusé." };
  const userId = await requireUserId();
  const photo = formData.get("photo");
  if (!(photo instanceof Blob) || !["image/jpeg", "image/png"].includes(photo.type) || photo.size > MAX_PHOTO_BYTES) {
    return { results: [], error: "Photo invalide : utilise une image JPEG ou PNG de moins d'1 Mo." };
  }
  if (!(await consumeQuota(userId, "photo"))) {
    return { results: [], error: "Limite de reconnaissances atteinte pour aujourd'hui : cherche ta plante par son nom ou réessaie demain." };
  }
  try {
    const results = await identifyPhoto(photo);
    return results.length ? { results } : { results, error: "Aucune plante reconnue. Essaie une photo plus nette d'une feuille ou d'une fleur." };
  } catch (error) {
    if (!(error instanceof PlantNetError)) console.error("plantnet", error);
    return { results: [], error: "La reconnaissance est indisponible pour le moment, cherche ta plante par son nom." };
  }
}

export async function addPlant(_: ActionState, formData: FormData): Promise<ActionState> {
  if (isBot(formData)) return BOT_REJECTED;
  const home = await getHomeForUser(await requireUserId());
  if (!home) redirect("/settings");
  const parsed = plantInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error.issues) };
  const { nickname, location } = parsed.data;

  const sp = await ensureSpecies(parsed.data);
  const [plant] = await db
    .insert(plants)
    .values({ homeId: home.id, speciesId: sp.id, nickname, location })
    .returning({ id: plants.id });
  await recomputePlant(plant.id);
  refreshAll();
  redirect(`/plants/${plant.id}`);
}

export async function logWatering(_: ActionState, formData: FormData): Promise<ActionState> {
  if (isBot(formData)) return BOT_REJECTED;
  const userId = await requireUserId();
  const parsed = wateringInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error.issues) };
  const { plantId, wateredAt, note } = parsed.data;
  if (!(await getOwnedPlant(userId, plantId))) return { error: "Plante introuvable" };

  await db.insert(wateringLogs).values({ plantId, wateredAt: wateredAt ?? new Date(), note: note ?? null });
  await recomputePlant(plantId);
  refreshAll();
  return {};
}

export async function deleteWateringLog(logId: string): Promise<void> {
  const userId = await requireUserId();
  const [log] = await db
    .select({ plantId: wateringLogs.plantId })
    .from(wateringLogs)
    .innerJoin(plants, eq(wateringLogs.plantId, plants.id))
    .innerJoin(homes, eq(plants.homeId, homes.id))
    .where(and(eq(wateringLogs.id, logId), eq(homes.userId, userId)));
  if (!log) return;
  await db.delete(wateringLogs).where(eq(wateringLogs.id, logId));
  await recomputePlant(log.plantId);
  refreshAll();
}

export async function updatePlant(_: ActionState, formData: FormData): Promise<ActionState> {
  if (isBot(formData)) return BOT_REJECTED;
  const userId = await requireUserId();
  const parsed = plantSettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error.issues) };
  const { plantId, intervalOverrideDays, archive } = parsed.data;
  if (!(await getOwnedPlant(userId, plantId))) return { error: "Plante introuvable" };

  await db
    .update(plants)
    .set({
      intervalOverrideDays: intervalOverrideDays ?? null,
      ...(archive && { archivedAt: archive === "archive" ? new Date() : null }),
    })
    .where(eq(plants.id, plantId));
  await recomputePlant(plantId);
  refreshAll();
  if (archive === "archive") redirect("/plants?loc=archived");
  return {};
}

/** Permanently deletes a plant and its watering history (cascade). */
export async function deletePlant(plantId: string): Promise<void> {
  const userId = await requireUserId();
  if (!z.uuid().safeParse(plantId).success || !(await getOwnedPlant(userId, plantId))) return;
  await db.delete(plants).where(eq(plants.id, plantId));
  refreshAll();
  redirect("/plants");
}

/** Registers this browser/device for push notifications sent by the site. */
export async function subscribePush(subscription: unknown): Promise<ActionState> {
  const home = await getHomeForUser(await requireUserId());
  if (!home) return { error: "Indique d'abord la localisation de ta maison." };
  const parsed = pushSubscriptionSchema.safeParse(subscription);
  if (!parsed.success) return { error: "Abonnement aux notifications invalide." };
  const { endpoint, keys } = parsed.data;
  await db
    .insert(pushSubscriptions)
    .values({ endpoint, homeId: home.id, ...keys })
    .onConflictDoUpdate({ target: pushSubscriptions.endpoint, set: { homeId: home.id, ...keys } });
  return {};
}

export async function unsubscribePush(endpoint: string): Promise<void> {
  const home = await getHomeForUser(await requireUserId());
  if (!home || typeof endpoint !== "string") return;
  await db.delete(pushSubscriptions).where(and(eq(pushSubscriptions.endpoint, endpoint), eq(pushSubscriptions.homeId, home.id)));
}

/** Sends a test notification to the user's own devices (rate-limited). */
export async function testPush(): Promise<ActionState> {
  const userId = await requireUserId();
  const home = await getHomeForUser(userId);
  if (!home) return { error: "Indique d'abord la localisation de ta maison." };
  if (!(await consumeQuota(userId, "pushTest"))) return { error: "Trop de tests aujourd'hui, réessaie demain." };
  const subs = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.homeId, home.id));
  if (subs.length === 0) return { error: "Aucun appareil abonné." };
  await sendPush(subs, { title: "Plant Care", body: "Les notifications fonctionnent 🌿", url: "/" });
  return {};
}
