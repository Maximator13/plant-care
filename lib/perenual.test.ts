import { describe, expect, it } from "vitest";
import details from "./__fixtures__/perenual-details.json";
import list from "./__fixtures__/perenual-list.json";
import { lightFromSunlight, mapDetails, mapSearch, parseBenchmark } from "./perenual";

describe("parseBenchmark", () => {
  it.each([
    ['"7-10"', "days", 8.5],
    ["7-10", "days", 8.5],
    ["7", "days", 7],
    ["2", "week", 14],
    ["1-2", "weeks", 10.5],
    [null, "days", null],
    ["abc", "days", null],
    ["0", "days", null],
  ] as const)("parseBenchmark(%s, %s) = %s", (v, u, e) => expect(parseBenchmark(v, u)).toBe(e));
});

describe("mapDetails", () => {
  it("uses benchmark", () => expect(mapDetails(details).baseIntervalDays).toBe(8.5));
  it("falls back on watering label", () => {
    const noBench = { ...details, watering_general_benchmark: null };
    expect(mapDetails({ ...noBench, watering: "Frequent" }).baseIntervalDays).toBe(3);
    expect(mapDetails({ ...noBench, watering: "Minimum" }).baseIntervalDays).toBe(14);
    expect(mapDetails({ ...noBench, watering: null }).baseIntervalDays).toBe(7);
  });
  it("tolerates free-tier upgrade placeholders", () => {
    const upgrade = "Upgrade Plans To Premium/Supreme - https://perenual.com/subscription-api-pricing";
    const s = mapDetails({
      ...details,
      watering: upgrade,
      watering_general_benchmark: { value: upgrade, unit: upgrade },
      sunlight: upgrade,
    });
    expect(s).toMatchObject({ baseIntervalDays: 7, light: "partial" });
  });
  it("source, names and light", () =>
    expect(mapDetails(details)).toEqual({
      slug: null,
      perenualId: 1,
      commonName: "European Silver Fir",
      scientificName: "Abies alba",
      baseIntervalDays: 8.5,
      light: "partial",
      careNotes: null, // Perenual descriptions are English: not shown in a French UI
      source: "perenual",
    }));
});

describe("mapSearch", () => {
  it("maps hits", () => {
    const hits = mapSearch(list);
    expect(hits).toHaveLength(2);
    expect(hits[0]).toEqual({ perenualId: 1, commonName: "European Silver Fir", scientificName: "Abies alba" });
  });
});

describe("lightFromSunlight", () => {
  it.each([
    [["full sun"], "sun"],
    [["Full sun", "part shade"], "partial"],
    [["part sun/part shade"], "partial"],
    [["full shade"], "shade"],
    [["deep shade", "filtered shade"], "shade"],
    [[], "partial"],
  ] as const)("%j → %s", (s, e) => expect(lightFromSunlight([...s])).toBe(e));
});
