import { describe, expect, it } from "vitest";
import fixture from "./__fixtures__/open-meteo.json";
import type { DailyWeather } from "./watering";
import { buildWeatherContext, parseOpenMeteo, summarizeWeather, type WeatherMetrics } from "./weather";

describe("parseOpenMeteo", () => {
  it("maps daily arrays to DailyWeather", () => {
    const { timezone, days } = parseOpenMeteo(fixture);
    expect(timezone).toBe("Europe/Paris");
    expect(days).toHaveLength(10);
    expect(days[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(days[1].et0Mm).toBeNull();
  });
  it("rejects malformed payloads", () => expect(() => parseOpenMeteo({ daily: {} })).toThrow());
});

describe("summarizeWeather", () => {
  const dates = ["10-01", "10-02", "10-03", "10-04", "10-05", "10-06", "10-07", "10-08", "10-09", "10-10"];
  const build = (over: Partial<DailyWeather>[] = []): DailyWeather[] =>
    dates.map((d, i) => ({
      date: `2026-${d}`,
      tempMaxC: 20,
      tempMinC: 10,
      precipitationMm: 0,
      et0Mm: 3,
      ...over[i],
    }));
  const today = "2026-10-08";

  it("averages past 7 days et0 ignoring nulls", () => {
    const et0 = [2, null, 4, null, 3, 3, 3];
    expect(summarizeWeather(build(et0.map((e) => ({ et0Mm: e }))), today).et0Avg7d).toBe(3);
  });
  it("summarizeWeather ignores nulls", () => {
    const allNull = Array.from({ length: 7 }, () => ({ et0Mm: null }));
    expect(summarizeWeather(build(allNull), today).et0Avg7d).toBeNull();
  });
  it("rain48h = today + tomorrow, null as 0", () => {
    const over: Partial<DailyWeather>[] = [];
    over[7] = { precipitationMm: 4 };
    over[8] = { precipitationMm: null };
    over[9] = { precipitationMm: 50 };
    expect(summarizeWeather(build(over), today).rain48hMm).toBe(4);
  });
  it("min/max and heat days over today..today+2", () => {
    const over: Partial<DailyWeather>[] = [];
    over[6] = { tempMaxC: 40, tempMinC: -5 }; // yesterday: ignored
    over[7] = { tempMaxC: 31, tempMinC: 12 };
    over[8] = { tempMaxC: 33, tempMinC: 8 };
    over[9] = { tempMaxC: 25, tempMinC: 9 };
    const m = summarizeWeather(build(over), today);
    expect(m).toMatchObject({ today, tempMaxC: 33, tempMinC: 8, heatDays: 2 });
  });
});

describe("buildWeatherContext", () => {
  const m: WeatherMetrics = { today: "2026-10-08", tempMaxC: 20, tempMinC: 10, rain48hMm: 0, et0Avg7d: 3, heatDays: 0 };
  it("heatwave needs 2 hot days", () => {
    expect(buildWeatherContext({ ...m, heatDays: 2 }, "summer").heatwave).toBe(true);
    expect(buildWeatherContext({ ...m, heatDays: 1 }, "summer").heatwave).toBe(false);
  });
  it("frost below 2°C", () => {
    expect(buildWeatherContext({ ...m, tempMinC: 1 }, "winter").frostRisk).toBe(true);
    expect(buildWeatherContext({ ...m, tempMinC: null }, "winter").frostRisk).toBe(false);
  });
  it("copies metrics and has a short summary", () => {
    const c = buildWeatherContext(m, "autumn");
    expect(c).toMatchObject({ season: "autumn", et0AvgMm: 3, rain48hMm: 0, tempMaxC: 20, tempMinC: 10 });
    expect(c.summary.length).toBeGreaterThan(0);
    expect(c.summary.length).toBeLessThanOrEqual(200);
  });
});
