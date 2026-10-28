import type { Home, Plant, Species } from "@/db/schema";
import { adviseFor, type Advice } from "./advice";
import { getSeason } from "./season";
import { wateringStatus } from "./watering";

/** Advice for a stored plant, computed at render time so it always reflects today's weather. */
export function adviceForPlant(plant: Plant, species: Species, home: Home, now = new Date()): Advice {
  return adviseFor({
    nickname: plant.nickname,
    location: plant.location,
    light: species.light,
    baseIntervalDays: plant.intervalOverrideDays ?? species.baseIntervalDays,
    speciesTip: species.careNotes,
    season: getSeason(now, home.latitude),
    weather: home.weatherContext,
    status: wateringStatus(plant.nextWateringAt ?? now, now, home.timezone),
  });
}
