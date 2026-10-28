import { eq, max } from "drizzle-orm";
import { db } from "@/db";
import { homes, plants, species, wateringLogs } from "@/db/schema";
import { computeNextWatering } from "./watering";

// Kept free of server-only/Clerk imports so workflow steps can use it too.
export async function recomputePlant(plantId: string, now = new Date()): Promise<void> {
  const [row] = await db
    .select({ plant: plants, species, home: homes, lastWateredAt: max(wateringLogs.wateredAt) })
    .from(plants)
    .innerJoin(homes, eq(plants.homeId, homes.id))
    .innerJoin(species, eq(plants.speciesId, species.id))
    .leftJoin(wateringLogs, eq(wateringLogs.plantId, plants.id))
    .where(eq(plants.id, plantId))
    .groupBy(plants.id, species.id, homes.id);
  if (!row) return;

  const result = computeNextWatering({
    lastWateredAt: row.lastWateredAt ?? row.plant.createdAt,
    baseIntervalDays: row.plant.intervalOverrideDays ?? row.species.baseIntervalDays,
    location: row.plant.location,
    latitude: row.home.latitude,
    now,
    et0Avg7d: row.home.weatherContext?.et0AvgMm ?? null,
  });
  await db
    .update(plants)
    .set({ nextWateringAt: result.nextAt, nextWateringReason: result.reason })
    .where(eq(plants.id, plantId));
}
