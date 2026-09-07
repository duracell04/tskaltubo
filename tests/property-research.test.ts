import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { properties, propertyNarratives } from "../src/data/properties";
import { sources, evidence } from "../src/data/evidence";
import { propertyNews } from "../src/data/property-news";
import { auditIdentityMapping } from "../src/data/property-identities";
import { date, known } from "../src/data/research-helpers";
import { effectiveAvailability, emptyFilters, evidenceAge, filterProperties, formatPropertyNumber, hasMatchedCoordinates, latestPropertyDate, validatePropertyResearch, validResearchDate } from "../src/lib/property-research";
import seed from "../src/data/research.json";
import type { Property } from "../src/types/property";

const property = (id: string) => properties.find(p => p.id === id)!;
const validate = (p: Property) => validatePropertyResearch(properties.map(old => old.id === p.id ? p : old), evidence, sources, propertyNews);

describe("maintained property research", () => {
  it("formats Georgian amounts consistently even without Georgian browser ICU data", () => {
    expect(formatPropertyNumber(2802300, "ka")).toBe("2\u00a0802\u00a0300");
    expect(formatPropertyNumber(1234.5, "ka")).toBe("1\u00a0234,5");
    expect(formatPropertyNumber(2802300, "en")).toBe("2,802,300");
    expect(formatPropertyNumber(2802300, "de")).toBe("2.802.300");
  });
  it("has complete identities, translations, evidence and dated portfolio scopes", () => {
    expect(validatePropertyResearch(properties, evidence, sources, propertyNews)).toEqual([]);
    expect(properties).toHaveLength(22);
    expect(properties.filter(p => p.memberships.some(m => m.portfolioId === "audit-shortlist"))).toHaveLength(11);
    expect(properties.filter(p => p.memberships.some(m => m.portfolioId === "state-offers-2025"))).toHaveLength(11);
    expect(Object.keys(auditIdentityMapping).sort()).toEqual(seed.assets.map(p => p.id).sort());
    seed.assets.forEach(a => expect(property(a.id).slug).toBe(a.id));
    expect(new Set([property("legends").id, property("intouristi").id, property("tskaltubo-rustaveli-48").id]).size).toBe(3);
    expect(propertyNarratives).toHaveLength(66);
    expect(propertyNarratives.filter(n => n.locale !== "en").every(n => n.translationStatus === "draft")).toBe(true);
  });
  it("retains conflicting prices, currencies and successive obligations", () => {
    expect(property("rkinigzeli").historicalPrices.map(p => p.price.value?.amount).sort()).toEqual([5131000, 5135000]);
    expect(property("tskaltubo-rustaveli-48").historicalPrices.map(p => p.price.value?.amount)).toEqual([2600000, 11262000]);
    expect(property("savane").obligations.map(o => o.minimumInvestment?.amount)).toEqual([7000000, 6370200]);
    expect(property("meshakhte").historicalPrices[0]?.price.value).toEqual({ amount: 2500000, currency: "USD" });
    expect(property("medea").roles[0]?.role).toBe("historical_buyer");
    expect(property("medea").ownership.value?.kind).toBe("state");
    expect(property("medea").events.map(e => e.at?.value)).toContain("2024-01");
  });
  it("keeps historical auctions historical and rejects unsupported active labels", () => {
    const p = property("imereti");
    expect(effectiveAvailability(p)).toBe("historical_offer");
    const fake: Property = { ...p, availability: { ...p.availability, kind: "live_auction" } };
    expect(effectiveAvailability(fake)).toBe("unknown");
    expect(validate(fake).join(" ")).toContain("active offer lacks current confirmation");
    expect(validate({ ...p, ownershipVerification: "registry_verified" }).join(" ")).toContain("fresh extract");
    const expired: Property = { ...fake, availability: { ...fake.availability, confirmedAt: date("2024-06-11"), validUntil: date("2024-07-11"), authorizedParty: "NASP" } };
    expect(effectiveAvailability(expired)).toBe("unknown");
  });
  it("rejects missing evidence and a forecast promoted to completion", () => {
    const p = property("tbilisi");
    expect(p.development.value).toBe("construction");
    expect(p.events.some(e => e.kind === "forecast")).toBe(true);
    const fabricated: Property = { ...p, development: known("completed", "tbilisi-works"), events: p.events.filter(e => e.kind !== "development") };
    expect(validate(fabricated).join(" ")).toContain("completion cannot derive from forecast");
    expect(validate({ ...p, ownership: known({ kind: "private", ownerName: "Fake" }, "missing") }).join(" ")).toContain("missing evidence");
    expect(properties.every(p => !hasMatchedCoordinates(p))).toBe(true);
    expect(validate({ ...p, coordinates: known({ lat: 42.3, lng: 42.6 }, "imereti-auction") }).join(" ")).toContain("unmatched");
  });
  it("combines filters, searches aliases/cadastral codes and handles empty results", () => {
    expect(filterProperties(properties, { ...emptyFilters, query: "PHILIALI" }).map(p => p.id)).toEqual(["philiali"]);
    expect(filterProperties(properties, { ...emptyFilters, query: "29.08.35.065" }).map(p => p.id)).toEqual(["intouristi"]);
    expect(filterProperties(properties, { ...emptyFilters, query: "მეშახტე" }).map(p => p.id)).toEqual(["meshakhte"]);
    expect(filterProperties(properties, { ...emptyFilters, ownership: "state", development: "requires_rehabilitation", portfolio: "audit-shortlist" }).map(p => p.id)).toEqual(["medea", "meshakhte"]);
    expect(filterProperties(properties, { ...emptyFilters, query: "no such property" })).toEqual([]);
  });
  it("uses underlying dates, preserves precision and rejects impossible dates", () => {
    expect(latestPropertyDate(property("rioni"))?.value).toBe("2020-11");
    expect(latestPropertyDate(property("legends"))).toBeNull();
    expect(evidenceAge(null)).toBe("undated");
    expect(evidenceAge(date("2025-09-07"))).toBe("recent");
    expect(evidenceAge(date("2025-09-06"))).toBe("older");
    expect(evidenceAge(date("2025-09"))).toBe("older");
    expect(validResearchDate(date("2026-02-30"))).toBe(false);
    expect(validResearchDate(date("2024-02-29"))).toBe(true);
  });
  it("allows audit import without changing maintained research", () => {
    const fixture = mkdtempSync(path.join(tmpdir(), "tskaltubo-import-"));
    const maintained = ["src/data/properties.ts", "src/data/evidence.ts", "src/data/property-identities.ts", "src/data/property-news.ts"];
    try {
      for (const f of [...maintained, "scripts/import-report.mjs", "research/sources/2026-09-06-integrated-audit.md", "docs/strategy/concept-operating-model-matrix.md"]) {
        mkdirSync(path.dirname(path.join(fixture, f)), { recursive: true });
        copyFileSync(f, path.join(fixture, f));
      }
      const before = maintained.map(f => readFileSync(path.join(fixture, f)));
      execFileSync(process.execPath, ["scripts/import-report.mjs"], { cwd: fixture });
      maintained.forEach((f, i) => expect(readFileSync(path.join(fixture, f))).toEqual(before[i]));
      const imported = JSON.parse(readFileSync(path.join(fixture, "src/data/research.json"), "utf8"));
      expect(imported.assets).toHaveLength(11);
      expect(imported.concepts).toEqual(seed.concepts);
      expect(readFileSync(path.join(fixture, "public/data/research.json"))).toEqual(readFileSync(path.join(fixture, "src/data/research.json")));
    } finally {
      if (path.dirname(path.resolve(fixture)) !== path.resolve(tmpdir()) || !path.basename(fixture).startsWith("tskaltubo-import-")) throw new Error("Unsafe fixture cleanup path");
      rmSync(fixture, { recursive: true, force: true });
    }
  });
});
