import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  check,
  doublePrecision,
  index,
  integer,
  primaryKey,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { WeatherContext } from "@/lib/weather";

const tz = (name: string) => timestamp(name, { withTimezone: true });

export const homes = pgTable("homes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(), // Clerk user id
  name: text("name").notNull().default("Maison"),
  city: text("city"),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  timezone: text("timezone").notNull(),
  emailAlerts: boolean("email_alerts").notNull().default(true),
  weatherContext: jsonb("weather_context").$type<WeatherContext>(),
  weatherUpdatedAt: tz("weather_updated_at"),
});

export const species = pgTable(
  "species",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").unique(), // catalog entry (lib/catalog.ts) — gives the illustration
    perenualId: integer("perenual_id").unique(),
    commonName: text("common_name").notNull(),
    scientificName: text("scientific_name"),
    baseIntervalDays: real("base_interval_days").notNull(),
    light: text("sunlight", { enum: ["sun", "partial", "shade"] }).notNull().default("partial"),
    careNotes: text("care_notes"),
    source: text("source", { enum: ["catalog", "perenual", "manual"] }).notNull(),
    createdAt: tz("created_at").notNull().defaultNow(),
  },
  (t) => [
    check("species_interval_positive", sql`${t.baseIntervalDays} > 0`),
    check("species_source_valid", sql`${t.source} in ('catalog', 'perenual', 'manual')`),
    check("species_light_valid", sql`${t.light} in ('sun', 'partial', 'shade')`),
  ],
);

export const plants = pgTable(
  "plants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    homeId: uuid("home_id").notNull().references(() => homes.id, { onDelete: "cascade" }),
    speciesId: uuid("species_id").notNull().references(() => species.id),
    nickname: text("nickname").notNull(),
    location: text("location", { enum: ["indoor", "outdoor"] }).notNull(),
    intervalOverrideDays: real("interval_override_days"),
    nextWateringAt: tz("next_watering_at"),
    nextWateringReason: text("next_watering_reason"),
    createdAt: tz("created_at").notNull().defaultNow(),
    archivedAt: tz("archived_at"),
  },
  (t) => [
    index("plants_home_next_idx").on(t.homeId, t.nextWateringAt),
    check("plants_location_valid", sql`${t.location} in ('indoor', 'outdoor')`),
    check("plants_override_positive", sql`${t.intervalOverrideDays} > 0`),
  ],
);

export const wateringLogs = pgTable(
  "watering_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    plantId: uuid("plant_id").notNull().references(() => plants.id, { onDelete: "cascade" }),
    wateredAt: tz("watered_at").notNull().defaultNow(),
    source: text("source", { enum: ["manual", "rain"] }).notNull().default("manual"),
    note: text("note"),
  },
  (t) => [
    index("watering_logs_plant_idx").on(t.plantId, t.wateredAt.desc()),
    check("watering_logs_source_valid", sql`${t.source} in ('manual', 'rain')`),
  ],
);

// Daily per-user (and global, user_id = "*") counters protecting free API quotas from abuse.
export const usageCounters = pgTable(
  "usage_counters",
  {
    userId: text("user_id").notNull(),
    day: date("day").notNull(),
    kind: text("kind", { enum: ["photo", "perenual", "pushTest"] }).notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day, t.kind] })],
);

// One row per browser/device that accepted push notifications (Web Push, sent by the site).
export const pushSubscriptions = pgTable("push_subscriptions", {
  endpoint: text("endpoint").primaryKey(),
  homeId: uuid("home_id").notNull().references(() => homes.id, { onDelete: "cascade" }),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: tz("created_at").notNull().defaultNow(),
});

export type Home = typeof homes.$inferSelect;
export type Species = typeof species.$inferSelect;
export type Plant = typeof plants.$inferSelect;
export type WateringLog = typeof wateringLogs.$inferSelect;
