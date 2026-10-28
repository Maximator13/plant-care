import { describe, expect, it } from "vitest";
import fixture from "./__fixtures__/plantnet.json";
import { parsePlantnet } from "./plantnet";

describe("parsePlantnet", () => {
  const ids = parsePlantnet(fixture);
  it("keeps the 3 best candidates, best first, as percentages", () => {
    expect(ids).toHaveLength(3);
    expect(ids[0]).toMatchObject({ scientificName: "Monstera deliciosa", commonName: "Faux philodendron", confidence: 81 });
  });
  it("links candidates to the catalog when possible", () => {
    expect(ids[0].catalogSlug).toBe("monstera");
    expect(ids[1].catalogSlug).toBeNull();
    expect(ids[2].catalogSlug).toBe("pothos");
  });
  it("tolerates missing common names", () => expect(ids[1].commonName).toBeNull());
  it("empty or malformed results → []", () => {
    expect(parsePlantnet({ results: [] })).toEqual([]);
    expect(() => parsePlantnet({ nope: true })).toThrow();
  });
});
