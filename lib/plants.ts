import "server-only";
import { auth } from "@clerk/nextjs/server";
import { and, asc, desc, eq, isNotNull, isNull, type SQL } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { homes, plants, species, wateringLogs, type Home, type Plant, type Species } from "@/db/schema";
import { getCatalogPlant } from "./catalog";
import { getSpeciesDetails, PerenualError, type SpeciesInput } from "./perenual";
import type { PlantInput } from "./validation";
import { wateringStatus, type WateringStatus } from "./watering";

export type PlantWithStatus = Plant & { species: Species; status: WateringStatus };

/** Signed-in user id; redirects to sign-in otherwise. Every page and action goes through this. */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
}

export async function getHomeForUser(userId: string): Promise<Home | null> {
  const [home] = await db.select().from(homes).where(eq(homes.userId, userId));
  return home ?? null;
}

/** The signed-in user's home; redirects to /settings while no home is configured. */
export async function requireHome(): Promise<Home> {
  const home = await getHomeForUser(await requireUserId());
  if (!home) redirect("/settings");
  return home;
}

/** Plant owned by the given user, or null (never leaks another user's plant). */
export async function getOwnedPlant(userId: string, plantId: string) {
  const [row] = await db
    .select({ plant: plants, species, home: homes })
    .from(plants)
    .innerJoin(homes, eq(plants.homeId, homes.id))
    .innerJoin(species, eq(plants.speciesId, species.id))
    .where(and(eq(plants.id, plantId), eq(homes.userId, userId)));
  return row ?? null;
}

export async function listPlantsWithStatus(home: Home, now = new Date(), archived = false): Promise<PlantWithStatus[]> {
  const rows = await db
    .select({ plant: plants, species })
    .from(plants)
    .innerJoin(species, eq(plants.speciesId, species.id))
    .where(and(eq(plants.homeId, home.id), archived ? isNotNull(plants.archivedAt) : isNull(plants.archivedAt)))
    .orderBy(archived ? asc(plants.nickname) : asc(plants.nextWateringAt));
  return rows.map(({ plant, species }) => ({
    ...plant,
    species,
    status: wateringStatus(plant.nextWateringAt ?? now, now, home.timezone),
  }));
}

export async function listWateringLogs(plantId: string) {
  return db
    .select()
    .from(wateringLogs)
    .where(eq(wateringLogs.plantId, plantId))
    .orderBy(desc(wateringLogs.wateredAt))
    .limit(50);
}

async function insertOrGet(values: SpeciesInput, target: typeof species.slug | typeof species.perenualId, existing: SQL): Promise<Species> {
  const [row] = await db.insert(species).values(values).onConflictDoNothing({ target }).returning();
  if (row) return row;
  const [found] = await db.select().from(species).where(existing); // already cached (or lost a race)
  return found;
}

/** Finds or creates the species row for a validated plant input. */
export async function ensureSpecies(input: PlantInput): Promise<Species> {
  if (input.source === "catalog") {
    const c = getCatalogPlant(input.slug)!; // slug validated by plantInputSchema
    return insertOrGet(
      { slug: c.slug, perenualId: null, commonName: c.name, scientificName: c.scientific, baseIntervalDays: c.days, light: c.light, careNotes: c.tip, source: "catalog" },
      species.slug,
      eq(species.slug, c.slug),
    );
  }
  const fromProfile: SpeciesInput = {
    slug: null, perenualId: null, commonName: input.speciesName, scientificName: null,
    baseIntervalDays: input.waterDays, light: input.light, careNotes: null, source: "manual",
  };
  if (input.source === "manual") {
    const [row] = await db.insert(species).values(fromProfile).returning();
    return row;
  }
  const [cached] = await db.select().from(species).where(eq(species.perenualId, input.perenualId));
  if (cached) return cached;
  let sheet: SpeciesInput;
  try {
    sheet = await getSpeciesDetails(input.perenualId);
  } catch (error) {
    if (!(error instanceof PerenualError)) throw error;
    // Free tier refuses details for most species: keep the Perenual name, use the user's profile.
    sheet = { ...fromProfile, perenualId: input.perenualId, source: "perenual" };
  }
  return insertOrGet(sheet, species.perenualId, eq(species.perenualId, input.perenualId));
}
