import { clerkClient } from "@clerk/nextjs/server";
import { and, eq, inArray, isNull, max } from "drizzle-orm";
import { db } from "@/db";
import { homes, plants, pushSubscriptions, wateringLogs } from "@/db/schema";
import { sendDigest } from "@/lib/notify";
import { duePayload, sendPush } from "@/lib/push";
import { recomputePlant } from "@/lib/recompute";
import { getSeason } from "@/lib/season";
import { dayKey, detectRainWatering, wateringStatus, type DailyWeather } from "@/lib/watering";
import { buildWeatherContext, fetchWeather, summarizeWeather } from "@/lib/weather";

// Known limit: one sequential pass per home; spawn a child workflow per home if there are ever many.
export async function dailyCheck() {
  "use workflow";
  const homeIds = await listHomeIds();
  const failed: string[] = [];
  for (const homeId of homeIds) {
    // A home whose steps keep failing after their retries must not block the other homes.
    try {
      const days = await refreshWeather(homeId);
      if (days) await applyRain(homeId, days);
      await recomputeHome(homeId);
      await notifyHome(homeId);
    } catch (error) {
      console.error("daily check failed for home", homeId, error);
      failed.push(homeId);
    }
  }
  return { homes: homeIds.length, failed };
}

async function listHomeIds(): Promise<string[]> {
  "use step";
  return (await db.select({ id: homes.id }).from(homes)).map((h) => h.id);
}

/** New weather (ET0) or rain logs change every plant's next watering date. */
async function recomputeHome(homeId: string): Promise<number> {
  "use step";
  const rows = await db
    .select({ id: plants.id })
    .from(plants)
    .where(and(eq(plants.homeId, homeId), isNull(plants.archivedAt)));
  for (const p of rows) await recomputePlant(p.id);
  return rows.length;
}

/** Fetches weather and stores the derived context (heatwave, frost, rain, ET0). Null when Open-Meteo is down. */
async function refreshWeather(homeId: string): Promise<DailyWeather[] | null> {
  "use step";
  const [home] = await db.select().from(homes).where(eq(homes.id, homeId));
  if (!home) return null;
  let days: DailyWeather[];
  try {
    days = (await fetchWeather(home.latitude, home.longitude)).days;
  } catch (error) {
    console.error("open-meteo unavailable, keeping previous weather context", error);
    return null;
  }
  const now = new Date();
  const metrics = summarizeWeather(days, dayKey(now, home.timezone));
  const weatherContext = buildWeatherContext(metrics, getSeason(now, home.latitude));
  await db.update(homes).set({ weatherContext, weatherUpdatedAt: now }).where(eq(homes.id, homeId));
  return days;
}

/** Logs rain as a watering for outdoor plants once ≥ 10 mm fell since their last watering. */
async function applyRain(homeId: string, days: DailyWeather[]): Promise<number> {
  "use step";
  const [home] = await db.select().from(homes).where(eq(homes.id, homeId));
  if (!home) return 0;
  const rows = await db
    .select({ id: plants.id, createdAt: plants.createdAt, lastWateredAt: max(wateringLogs.wateredAt) })
    .from(plants)
    .leftJoin(wateringLogs, eq(wateringLogs.plantId, plants.id))
    .where(and(eq(plants.homeId, homeId), eq(plants.location, "outdoor"), isNull(plants.archivedAt)))
    .groupBy(plants.id);
  const now = new Date();
  const logs = rows.flatMap((p) => {
    const rainAt = detectRainWatering(days, p.lastWateredAt ?? p.createdAt, home.timezone, now);
    return rainAt ? [{ plantId: p.id, wateredAt: rainAt, source: "rain" as const }] : [];
  });
  if (logs.length) await db.insert(wateringLogs).values(logs);
  return logs.length;
}

/** When a plant is due today or overdue: push to every subscribed device, and email if alerts are on. */
async function notifyHome(homeId: string): Promise<boolean> {
  "use step";
  const [home] = await db.select().from(homes).where(eq(homes.id, homeId));
  if (!home) return false;
  const subs = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.homeId, homeId));
  if (!home.emailAlerts && subs.length === 0) return false;
  const rows = await db
    .select({ nickname: plants.nickname, nextWateringAt: plants.nextWateringAt })
    .from(plants)
    .where(and(eq(plants.homeId, homeId), isNull(plants.archivedAt)));
  const now = new Date();
  const due = rows.flatMap((p) => {
    if (!p.nextWateringAt) return [];
    const status = wateringStatus(p.nextWateringAt, now, home.timezone);
    return status === "upcoming" ? [] : [{ nickname: p.nickname, status }];
  });
  if (due.length === 0) return false;

  if (subs.length) {
    const gone = await sendPush(subs, duePayload(due));
    if (gone.length) await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.endpoint, gone));
  }
  if (home.emailAlerts) {
    const email = await ownerEmail(home.userId);
    if (email) await sendDigest(email, due);
  }
  return true;
}

async function ownerEmail(userId: string): Promise<string | null> {
  const user = await (await clerkClient()).users.getUser(userId);
  return user.primaryEmailAddress?.emailAddress ?? null;
}
