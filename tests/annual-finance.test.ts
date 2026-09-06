import { it, expect } from "vitest";
import {
  calculateAnnual,
  reportExample,
  emptyAnnual,
  annualIrr,
} from "../src/lib/annual-finance";
it("reconciles the attributed report without fabricating cost splits", () => {
  const m = reportExample(),
    r = calculateAnnual(m);
  expect(r.issues).toEqual([]);
  expect(r.missing).toEqual([]);
  expect(m.transaction).toBeNull();
  expect(m.medical).toBeNull();
  expect(m.workingCapital).toBeNull();
  expect(r.investment).toBe(22209450);
  expect(r.annual[1]!.revenue).toBeCloseTo(5609408.7, 5);
  expect(r.annual[1]!.operatingCash).toBeCloseTo(1177975.83, 2);
  expect(r.annual[1]!.cashYield).toBeCloseTo(0.053, 4);
});
it("keeps all three report cases distinct", () => {
  expect(
    calculateAnnual(reportExample("conservative")).annual[1]!.revenue,
  ).toBeCloseTo(3506763.75, 5);
  expect(
    calculateAnnual(reportExample("upside")).annual[1]!.revenue,
  ).toBeCloseTo(7781054.4, 5);
});
it("uses annual rather than monthly IRR", () => {
  expect(annualIrr([-100, 110])).toEqual({
    status: "available",
    rate: expect.closeTo(0.1, 8),
  });
  expect(annualIrr([-100, 50])).toEqual({
    status: "available",
    rate: expect.closeTo(-0.5, 8),
  });
  expect(annualIrr([-100, 230, -132]).status).toBe("ambiguous");
  expect(annualIrr([0, 0]).status).toBe("unavailable");
  expect(annualIrr([-100, null]).status).toBe("unavailable");
});
it("calculates year zero expenditure and no terminal value", () => {
  const r = calculateAnnual(reportExample());
  expect(r.annual).toHaveLength(11);
  expect(r.annual[0]!.projectCash).toBe(-22209450);
  expect(r.annual[10]!.operatingCash).toBe(r.annual[1]!.operatingCash);
  expect(r.roi).toBeCloseTo((1177975.827 * 10 - 22209450) / 22209450, 8);
  expect(r.payback).toBeNull();
});
it("honors opening phases and spending schedules without double counting", () => {
  const m = reportExample();
  m.phases = [
    { year: 2, capacity: 70 },
    { year: 4, capacity: 70 },
  ];
  m.spending = [0.5, 0.5, ...Array(9).fill(0)];
  const r = calculateAnnual(m);
  expect(r.issues).toEqual([]);
  expect(r.annual[1]!.revenue).toBe(0);
  expect(r.annual[2]!.capacity).toBe(70);
  expect(r.annual[4]!.capacity).toBe(140);
  expect(r.annual.reduce((s, y) => s + (y.expenditure ?? 0), 0)).toBe(
    r.investment,
  );
});
it("rejects invalid shares, capacity and investment allocation", () => {
  const m = reportExample();
  m.services[0]!.share = 0.9;
  m.phases[0]!.capacity = 50;
  m.spending[0] = 0.5;
  expect(calculateAnnual(m).issues).toHaveLength(3);
});
it("separates margin and derived operating cost modes", () => {
  const m = reportExample();
  m.fixed = 100000;
  m.services.forEach((s) => {
    s.personnel = 10000;
    s.variable = 2000;
  });
  const margin = calculateAnnual(m);
  m.costMode = "derived";
  const r = calculateAnnual(m);
  expect(r.annual[1]!.opex).toBeCloseTo(
    100000 + (98 * 0.85 + 42 * 0.65) * 12000,
    5,
  );
  expect(r.annual[1]!.opex).not.toBe(margin.annual[1]!.opex);
});
it("does not substitute zeros for unknown assumptions", () => {
  const r = calculateAnnual(emptyAnnual());
  expect(r.investment).toBeNull();
  expect(r.annual[1]!.revenue).toBeNull();
  expect(r.irr.status).toBe("unavailable");
  expect(r.missing.length).toBeGreaterThan(10);
});
it("propagates missing occupancy and costs only to dependent schedules", () => {
  const m = reportExample();
  m.services[0]!.occupancy[4] = null;
  const r = calculateAnnual(m);
  expect(r.investment).toBe(22209450);
  expect(r.annual[4]!.revenue).not.toBeNull();
  expect(r.annual[5]!.revenue).toBeNull();
  expect(r.annual[6]!.cumulative).toBeNull();
});
it("requires positive dated FX for foreign acquisition", () => {
  const m = reportExample();
  m.currency = "GEL";
  expect(calculateAnnual(m).acquisition).toBeNull();
  m.fx = 0.33;
  m.fxDate = "2026-09-06";
  expect(calculateAnnual(m).acquisition).toBe(907500);
  m.fx = 0;
  expect(calculateAnnual(m).issues).toContain("FX must be positive");
});
it("exposes the alternative contingency base", () => {
  const m = reportExample(),
    base = calculateAnnual(m);
  m.contingencyBase = "direct_plus_soft";
  expect(calculateAnnual(m).investment).toBeCloseTo(
    base.investment! + base.soft! * 0.15,
    6,
  );
});
it("handles zero occupancy, zero capacity and undefined ratios", () => {
  const m = reportExample();
  m.capacity = 0;
  m.phases[0]!.capacity = 0;
  const r = calculateAnnual(m);
  expect(r.investmentPerBed).toBeNull();
  expect(r.annual[1]!.revenue).toBe(0);
  expect(r.annual[1]!.margin).toBeNull();
});
it("reports payback only when cumulative cash stays nonnegative", () => {
  const m = reportExample();
  m.services.forEach((s) => (s.rate = 100000));
  const r = calculateAnnual(m);
  expect(r.payback).toBe(1);
});
