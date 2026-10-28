import { describe, expect, it } from "vitest";
import {
  computeNextWatering,
  daysUntil,
  detectRainWatering,
  wateringStatus,
  type DailyWeather,
  type WateringResult,
} from "./watering";

const last = new Date("2026-04-10T08:00:00Z"); // printemps nord
const base = {
  lastWateredAt: last,
  baseIntervalDays: 7,
  location: "indoor" as const,
  latitude: 48.85,
  now: last,
  et0Avg7d: null,
};
const days = (r: WateringResult) => (r.nextAt.getTime() - last.getTime()) / 86_400_000;

it("standard interval", () => {
  const r = computeNextWatering(base);
  expect(days(r)).toBeCloseTo(7);
  expect(r.factors).toEqual({ season: 1, weather: 1 });
  expect(r.reason).toBe("Intervalle standard");
});
it("outdoor summer heat", () => {
  const r = computeNextWatering({ ...base, location: "outdoor", now: new Date("2026-07-10T08:00:00Z"), et0Avg7d: 6 });
  expect(r.factors).toEqual({ season: 0.8, weather: 0.6 });
  expect(days(r)).toBeCloseTo(3.36);
  expect(r.reason).toBe("Été ×0.8 · Météo ×0.6");
});
it("outdoor low et0 clamps to 1.4", () =>
  expect(computeNextWatering({ ...base, location: "outdoor", et0Avg7d: 1 }).factors.weather).toBe(1.4));
it("indoor ignores et0", () => expect(computeNextWatering({ ...base, et0Avg7d: 6 }).factors.weather).toBe(1));
it("outdoor with null et0", () => expect(computeNextWatering({ ...base, location: "outdoor" }).factors.weather).toBe(1));
it("winter factors", () => {
  const now = new Date("2026-01-10T08:00:00Z");
  expect(computeNextWatering({ ...base, now, location: "outdoor" }).factors.season).toBe(1.5);
  expect(computeNextWatering({ ...base, now }).factors.season).toBe(1.3);
});

describe("wateringStatus", () => {
  const now = new Date("2026-10-06T21:30:00Z"); // 23:30 à Paris
  it("uses home timezone", () =>
    expect(wateringStatus(new Date("2026-10-06T22:30:00Z"), now, "Europe/Paris")).toBe("upcoming"));
  it("earlier today is today", () =>
    expect(wateringStatus(new Date("2026-10-06T06:00:00Z"), now, "Europe/Paris")).toBe("today"));
  it("yesterday is overdue", () =>
    expect(wateringStatus(new Date("2026-10-05T10:00:00Z"), now, "Europe/Paris")).toBe("overdue"));
});

describe("detectRainWatering", () => {
  const tz = "Europe/Paris";
  const lastW = new Date("2026-10-01T08:00:00Z");
  const now = new Date("2026-10-04T08:00:00Z");
  const day = (date: string, p: number | null): DailyWeather => ({
    date, precipitationMm: p, tempMaxC: 15, tempMinC: 8, et0Mm: 1,
  });
  it("ignores rain on watering day, returns crossing day at 12:00Z", () =>
    expect(
      detectRainWatering([day("2026-10-01", 20), day("2026-10-02", 4), day("2026-10-03", 7)], lastW, tz, now),
    ).toEqual(new Date("2026-10-03T12:00:00Z")));
  it("below threshold → null", () =>
    expect(detectRainWatering([day("2026-10-02", 4), day("2026-10-03", 5)], lastW, tz, now)).toBeNull());
  it("null precipitation counts as 0", () =>
    expect(detectRainWatering([day("2026-10-02", null), day("2026-10-03", 9)], lastW, tz, now)).toBeNull());
  it("ignores forecast days after today", () =>
    expect(detectRainWatering([day("2026-10-05", 30)], lastW, tz, now)).toBeNull());
});

describe("daysUntil", () => {
  const now = new Date("2026-10-06T21:30:00Z"); // 23:30 à Paris
  it("counts calendar days in the home timezone", () => {
    expect(daysUntil(new Date("2026-10-06T22:30:00Z"), now, "Europe/Paris")).toBe(1);
    expect(daysUntil(new Date("2026-10-09T08:00:00Z"), now, "Europe/Paris")).toBe(3);
    expect(daysUntil(new Date("2026-10-04T08:00:00Z"), now, "Europe/Paris")).toBe(-2);
  });
});
