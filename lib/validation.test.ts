import { describe, expect, it } from "vitest";
import { homeInputSchema, isBot, plantInputSchema, plantSettingsSchema, wateringInputSchema } from "./validation";

const plantId = "0b9f3a51-8c2e-4a7f-9d61-2f4e8a1c5b3d";
const DAY = 86_400_000;

describe("wateringInputSchema", () => {
  it("rejects wateredAt in the future", () =>
    expect(wateringInputSchema.safeParse({ plantId, wateredAt: new Date(Date.now() + DAY).toISOString() }).success).toBe(false));
  it("accepts missing or empty wateredAt", () => {
    expect(wateringInputSchema.safeParse({ plantId }).success).toBe(true);
    expect(wateringInputSchema.parse({ plantId, wateredAt: "" }).wateredAt).toBeUndefined();
  });
  it("accepts yesterday", () =>
    expect(wateringInputSchema.safeParse({ plantId, wateredAt: new Date(Date.now() - DAY).toISOString() }).success).toBe(true));
  it("rejects a non-uuid plant id", () => expect(wateringInputSchema.safeParse({ plantId: "1" }).success).toBe(false));
});

describe("plantInputSchema", () => {
  const common = { nickname: "  Ficus  ", location: "indoor" };
  it("catalog plant: trims nickname", () =>
    expect(plantInputSchema.parse({ ...common, source: "catalog", slug: "monstera" })).toEqual({
      source: "catalog", slug: "monstera", nickname: "Ficus", location: "indoor",
    }));
  it("rejects an unknown catalog slug", () =>
    expect(plantInputSchema.safeParse({ ...common, source: "catalog", slug: "licorne" }).success).toBe(false));
  it("perenual plant needs a fallback profile", () => {
    const ok = { ...common, source: "perenual", perenualId: "5257", speciesName: "Monstera", waterDays: "7", light: "partial" };
    expect(plantInputSchema.parse(ok)).toMatchObject({ perenualId: 5257, waterDays: 7 });
    expect(plantInputSchema.safeParse({ ...ok, waterDays: "5" }).success).toBe(false);
  });
  it("manual plant needs a name and a profile", () => {
    expect(plantInputSchema.parse({ ...common, source: "manual", speciesName: " Mon cactus ", waterDays: "21", light: "sun" }))
      .toMatchObject({ speciesName: "Mon cactus", waterDays: 21, light: "sun" });
    expect(plantInputSchema.safeParse({ ...common, source: "manual", speciesName: "X", waterDays: "7", light: "sun" }).success).toBe(false);
  });
  it("rejects empty nickname and unknown source", () => {
    expect(plantInputSchema.safeParse({ nickname: " ", location: "indoor", source: "catalog", slug: "monstera" }).success).toBe(false);
    expect(plantInputSchema.safeParse({ ...common, source: "ai", speciesName: "Ficus" }).success).toBe(false);
  });
});

describe("homeInputSchema", () => {
  const ok = { latitude: "48.85", longitude: "2.35", timezone: "Europe/Paris" };
  it("rejects latitude 91", () => expect(homeInputSchema.safeParse({ ...ok, latitude: "91" }).success).toBe(false));
  it("checkbox on → true, absent → false", () => {
    expect(homeInputSchema.parse({ ...ok, emailAlerts: "on" }).emailAlerts).toBe(true);
    expect(homeInputSchema.parse(ok).emailAlerts).toBe(false);
  });
  it("rejects an unknown timezone", () =>
    expect(homeInputSchema.safeParse({ ...ok, timezone: "Mars/Olympus" }).success).toBe(false));
});

describe("plantSettingsSchema", () => {
  it("saving settings never changes the archive state", () =>
    expect(plantSettingsSchema.parse({ plantId, intervalOverrideDays: "" })).toEqual({ plantId, intervalOverrideDays: undefined, archive: undefined }));
  it("archive and restore are explicit", () => {
    expect(plantSettingsSchema.parse({ plantId, archive: "archive" }).archive).toBe("archive");
    expect(plantSettingsSchema.parse({ plantId, archive: "restore" }).archive).toBe("restore");
    expect(plantSettingsSchema.safeParse({ plantId, archive: "on" }).success).toBe(false);
  });
  it("rejects zero or negative override", () =>
    expect(plantSettingsSchema.safeParse({ plantId, intervalOverrideDays: "0" }).success).toBe(false));
});

describe("isBot", () => {
  const form = (entries: Record<string, string>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(entries)) f.set(k, v);
    return f;
  };
  it("flags a filled honeypot", () => expect(isBot(form({ website: "http://spam.example" }))).toBe(true));
  it("accepts an empty or absent honeypot", () => {
    expect(isBot(form({ website: "" }))).toBe(false);
    expect(isBot(form({ nickname: "Ficus" }))).toBe(false);
  });
});
