import { describe, expect, it } from "vitest";
import { ART_KINDS, CATALOG, findByScientific, searchCatalog } from "./catalog";

describe("catalog data", () => {
  it("has a large set of plants", () => expect(CATALOG.length).toBeGreaterThanOrEqual(120));
  it("has unique slugs", () => expect(new Set(CATALOG.map((p) => p.slug)).size).toBe(CATALOG.length));
  it.each(CATALOG.map((p) => [p.slug, p] as const))("%s is well-formed", (_, p) => {
    expect(p.slug).toMatch(/^[a-z0-9-]+$/);
    expect(p.days).toBeGreaterThanOrEqual(1);
    expect(p.days).toBeLessThanOrEqual(60);
    expect(["sun", "partial", "shade"]).toContain(p.light);
    expect(["indoor", "outdoor", "both"]).toContain(p.place);
    expect(ART_KINDS).toContain(p.art.kind);
    expect(p.art.leaf).toMatch(/^#[0-9a-f]{6}$/);
    if (p.art.accent) expect(p.art.accent).toMatch(/^#[0-9a-f]{6}$/);
    expect(p.tip.length).toBeGreaterThan(10);
    expect(p.tip.length).toBeLessThanOrEqual(160);
  });
});

describe("searchCatalog", () => {
  it("finds by common name, best match first", () => expect(searchCatalog("monstera")[0].slug).toBe("monstera"));
  it("ignores accents and case", () => expect(searchCatalog("GERANIUM").map((p) => p.slug)).toContain("geranium"));
  it("matches aliases", () => expect(searchCatalog("langue de belle mere")[0].slug).toBe("sansevieria"));
  it("matches scientific names", () => expect(searchCatalog("lavandula")[0].slug).toBe("lavande"));
  it("returns nothing for a blank query", () => expect(searchCatalog("  ")).toEqual([]));
  it("respects the limit", () => expect(searchCatalog("a", 5)).toHaveLength(5));
});

describe("findByScientific", () => {
  it("exact species", () => expect(findByScientific("Monstera deliciosa")?.slug).toBe("monstera"));
  it("ignores cultivar and author", () => expect(findByScientific("Epipremnum aureum 'Marble Queen'")?.slug).toBe("pothos"));
  it("falls back to the genus", () => expect(findByScientific("Lavandula stoechas")?.slug).toBe("lavande"));
  it("unknown plant", () => expect(findByScientific("Xyzzia improbabilis")).toBeUndefined());
});
