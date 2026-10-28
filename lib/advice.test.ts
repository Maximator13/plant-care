import { describe, expect, it } from "vitest";
import { adviseFor, type AdviceInput } from "./advice";
import type { WeatherContext } from "./weather";

const calm: WeatherContext = {
  season: "spring", heatwave: false, frostRisk: false, rain48hMm: 0, et0AvgMm: 3, tempMaxC: 18, tempMinC: 8, summary: "",
};
const base: AdviceInput = {
  nickname: "Tomtom",
  location: "outdoor",
  light: "sun",
  baseIntervalDays: 7,
  speciesTip: "Arrose au pied.",
  season: "spring",
  weather: calm,
  status: "upcoming",
};

describe("alerts (outdoor)", () => {
  it("frost names the plant and the minimum", () => {
    const { alerts } = adviseFor({ ...base, weather: { ...calm, frostRisk: true, tempMinC: -1.6 } });
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toContain("Tomtom");
    expect(alerts[0]).toContain("-2 °C");
  });
  it("heatwave", () => expect(adviseFor({ ...base, weather: { ...calm, heatwave: true } }).alerts[0]).toMatch(/chaleur/i));
  it("rain ≥ 10 mm makes watering unnecessary", () =>
    expect(adviseFor({ ...base, weather: { ...calm, rain48hMm: 12.4 } }).alerts[0]).toContain("12 mm"));
  it("no alert below 10 mm of rain", () => expect(adviseFor({ ...base, weather: { ...calm, rain48hMm: 9 } }).alerts).toEqual([]));
  it("indoor plants never get weather alerts", () =>
    expect(adviseFor({ ...base, location: "indoor", weather: { ...calm, frostRisk: true, heatwave: true, rain48hMm: 30 } }).alerts).toEqual([]));
  it("no weather → no alerts", () => expect(adviseFor({ ...base, weather: null }).alerts).toEqual([]));
});

describe("tips", () => {
  it("at most 3, overdue first, then the species tip", () => {
    const { tips } = adviseFor({ ...base, status: "overdue" });
    expect(tips.length).toBeLessThanOrEqual(3);
    expect(tips[0]).toMatch(/retard/i);
    expect(tips[1]).toBe("Arrose au pied.");
  });
  it("season tip depends on place", () => {
    expect(adviseFor({ ...base, speciesTip: null, season: "winter", location: "indoor" }).tips[0]).toMatch(/chauffage/);
    expect(adviseFor({ ...base, speciesTip: null, season: "winter" }).tips[0]).toMatch(/gel/);
  });
  it("drought-tolerant plants", () =>
    expect(adviseFor({ ...base, speciesTip: null, season: "autumn", baseIntervalDays: 21 }).tips.join(" ")).toMatch(/économe/));
  it("thirsty plants", () =>
    expect(adviseFor({ ...base, speciesTip: null, season: "autumn", baseIntervalDays: 2 }).tips.join(" ")).toMatch(/toujours légèrement humide/));
  it("indoor sun plant in a heatwave: move away from the window", () =>
    expect(adviseFor({ ...base, location: "indoor", weather: { ...calm, heatwave: true } }).tips[0]).toMatch(/vitre/));
  it("light tip when there is room", () =>
    expect(adviseFor({ ...base, speciesTip: null, light: "shade", location: "indoor" }).tips.join(" ")).toMatch(/faible luminosité/));
});
