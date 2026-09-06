import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { it, expect } from "vitest";
import seed from "../src/data/research.json";
it("retains all report sections, scenarios, assets and gates", () => {
  expect(seed.sections).toHaveLength(20);
  expect(seed.assets).toHaveLength(11);
  expect(seed.concepts.map((c) => c.id)).toEqual([
    "TSK-S1",
    "TSK-S2",
    "TSK-S3",
    "TSK-S4",
    "TSK-S5",
    "TSK-S6",
    "TSK-S7",
  ]);
  expect(seed.gates).toHaveLength(6);
  expect(seed.tasks).toHaveLength(10);
  expect(seed.risks).toHaveLength(24);
  expect(seed.claims.length).toBeGreaterThan(10);
});
it("retains exact source bytes without promoting source assertions to verification", () => {
  expect(
    createHash("sha256")
      .update(readFileSync("research/sources/2026-09-06-integrated-audit.md"))
      .digest("hex"),
  ).toBe(seed.reportSha256);
  expect(
    seed.assets.every(
      (a) =>
        a.titleStatus === "unknown" &&
        a.coordinates === null &&
        a.verification === "unverified",
    ),
  ).toBe(true);
  expect(seed.sources.every((s) => s.verification === "unverified")).toBe(true);
});
