import { expect, it } from "vitest";
import { getSeason } from "./season";

const d = (s: string) => new Date(s + "T12:00:00Z");

it("north summer", () => expect(getSeason(d("2026-07-15"), 48.85)).toBe("summer"));
it("south is shifted", () => expect(getSeason(d("2026-07-15"), -33.9)).toBe("winter"));
it("march 1 is spring", () => expect(getSeason(d("2026-03-01"), 48.85)).toBe("spring"));
it("feb 28 is winter", () => expect(getSeason(d("2026-02-28"), 48.85)).toBe("winter"));
it("december north/south", () => {
  expect(getSeason(d("2026-12-01"), 48.85)).toBe("winter");
  expect(getSeason(d("2026-12-01"), -33.9)).toBe("summer");
});
it("equator uses north rules", () => expect(getSeason(d("2026-07-15"), 0)).toBe("summer"));
