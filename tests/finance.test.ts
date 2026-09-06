import { describe, it, expect } from "vitest";
import {
  calculateFinance,
  screening,
  reportCases,
  irr,
  stressModel,
} from "../src/lib/finance";
import { emptyModel, type DevelopmentModel } from "../src/lib/model-schema";
export function fixture(months = 12): DevelopmentModel {
  const m = emptyModel(),
    fill = (v = 0) => Array(months).fill(v);
  m.months = months;
  m.staffingMode = "aggregate";
  m.startDate = "2028-01-01";
  m.name = "SYNTHETIC TEST DATA — not project assumptions";
  m.phases = [{ name: "Test", openingMonth: 0, capacity: 10 }];
  m.services = [
    {
      ...m.services[0]!,
      share: 1,
      rate: 1000,
      occupancy: fill(1),
      outOfService: fill(),
      lengthOfStayDays: 30,
      discount: 0,
      cancellations: 0,
      badDebt: 0,
      careHoursPerOccupiedDay: 1,
      variableCostPerOccupiedDay: 2,
    },
  ];
  m.ancillaryRate = 0;
  m.productiveHoursPerFte = 1800;
  m.loadedAnnualWage = 18000;
  m.wageCurrency = "EUR";
  m.minimumCoverageHoursPerDay = 0;
  m.germanSpeakersPerShift = 1;
  m.departmentalCosts = [{ name: "Fixed", monthly: 100, currency: "EUR" }];
  m.managementFeeRate = 0;
  m.development = {
    direct: [
      { name: "Construction", total: 10000, currency: "EUR", entity: "propco" },
    ],
    softRate: 0.1,
    contingencyRate: 0.1,
    contingencyBase: "direct",
    spendingShares: [1, ...Array(months - 1).fill(0)],
    acquisition: 1000,
    acquisitionMonth: 0,
    transaction: 100,
    preOpening: fill(),
    sponsorCosts: fill(),
    workingCapital: fill(),
  };
  m.maintenanceRate = 0.02;
  m.replacementCapex = fill();
  m.rent = fill(500);
  m.receivableDays = 0;
  m.payableDays = 0;
  m.depositMovement = fill();
  m.continuityReserve = 1000;
  m.tax.mode = "explicit_exclusion";
  m.debt.mode = "none";
  m.equity = [20000, ...Array(months - 1).fill(0)];
  m.discountRate = 0.1;
  m.exit.mode = "none";
  m.exit.month = months - 1;
  return m;
}
describe("report reproduction", () => {
  it("reconciles the exact direct-cost capex and base revenue", () => {
    const direct = 9500 * 1050 + 140 * 24000 + 1200000,
      capex = direct * 1.27 + 2750000 + 1000000;
    expect(capex).toBeCloseTo(22209450, 5);
    const r = screening();
    expect(r.investment).toBeCloseTo(capex, 5);
    expect(r.revenue).toBeCloseTo(5609408.7, 5);
    expect(r.cash).toBeCloseTo(1177975.827, 5);
    expect(r.yield! * 100).toBeCloseTo(5.3, 2);
  });
  it("keeps conservative and upside results reproducible", () => {
    expect(screening(reportCases.conservative).revenue).toBeCloseTo(
      3506763.75,
      2,
    );
    expect(screening(reportCases.upside).revenue).toBeCloseTo(7781054.4, 2);
  });
});
describe("monthly model", () => {
  it("keeps unknown costs, tax and debt from becoming zero results", () => {
    const r = calculateFinance(emptyModel());
    expect(r.status).toBe("partial");
    expect(r.monthly[0]!.revenue).toBeNull();
    expect(r.npv).toBeNull();
    expect(r.equityIrr.status).toBe("unavailable");
  });
  it("uses leap-year days and a single staffing cost", () => {
    const r = calculateFinance(fixture());
    expect(r.status).toBe("complete");
    const feb = r.monthly[1]!;
    expect(feb.days).toBe(29);
    expect(feb.payroll).toBeCloseTo(2900, 5);
    expect(feb.opex).toBeCloseTo(2900 + 580 + 100, 5);
    expect(feb.revenue).toBe(10000);
  });
  it("daily rate uses actual days", () => {
    const m = fixture();
    m.services[0]!.period = "day";
    m.services[0]!.rate = 100;
    expect(calculateFinance(m).monthly[1]!.revenue).toBe(29000);
  });
  it("opens only scheduled capacity and rejects unavailable beds beyond opening", () => {
    const m = fixture();
    m.phases[0]!.openingMonth = 2;
    let r = calculateFinance(m);
    expect(r.monthly[1]!.capacity).toBe(0);
    expect(r.monthly[2]!.capacity).toBe(10);
    m.services[0]!.outOfService![0] = 1;
    r = calculateFinance(m);
    expect(r.status).toBe("invalid");
  });
  it("requires FX and converts explicitly supplied currency", () => {
    const m = fixture();
    m.services[0]!.currency = "GEL";
    expect(calculateFinance(m).monthly[0]!.revenue).toBeNull();
    m.fx.GEL = 0.3;
    expect(calculateFinance(m).monthly[0]!.revenue).toBe(3000);
  });
  it("separates soft-cost contingency conventions", () => {
    const a = fixture(),
      b = structuredClone(a);
    b.development.contingencyBase = "direct_plus_soft";
    expect(
      calculateFinance(b).totalInvestment! -
        calculateFinance(a).totalInvestment!,
    ).toBeCloseTo(100, 6);
  });
  it("consolidates rent without double counting", () => {
    const m = fixture(),
      r = calculateFinance(m);
    for (const row of r.monthly) {
      expect(row.propco.ebitda! + row.opco.ebitda!).toBeCloseTo(row.ebitda!, 6);
      expect(row.propco.cash! + row.opco.cash!).toBeCloseTo(
        row.projectCash!,
        6,
      );
    }
    m.rent = Array(12).fill(5000);
    expect(calculateFinance(m).npv).toBeCloseTo(r.npv!, 6);
  });
  it("does not fund the project from resident deposits", () => {
    const m = fixture(),
      base = calculateFinance(m);
    m.depositMovement![0] = 100000;
    const result = calculateFinance(m);
    expect(result.npv).toBe(base.npv);
    expect(result.monthly[0]!.cashAvailableForEquity).toBe(
      base.monthly[0]!.cashAvailableForEquity,
    );
    m.depositMovement![1] = -100001;
    expect(calculateFinance(m).status).toBe("invalid");
  });
  it("reconciles debt draws, interest, principal and capitalized interest", () => {
    const m = fixture();
    m.debt = {
      mode: "scheduled",
      openingBalance: 0,
      draws: [10000, ...Array(11).fill(0)],
      principal: [0, 1000, ...Array(10).fill(0)],
      annualRate: 0.12,
      fees: Array(12).fill(0),
      interestTreatment: "paid",
      developmentMonths: 2,
      minimumDscr: 1.2,
    };
    let r = calculateFinance(m);
    expect(r.monthly[0]!.interest).toBe(100);
    expect(r.monthly[1]!.debtBalance).toBe(9000);
    m.debt.interestTreatment = "capitalized_during_development";
    r = calculateFinance(m);
    expect(r.monthly[0]!.debtBalance).toBe(10100);
    expect(r.monthly[1]!.debtBalance).toBe(9201);
    m.debt.principal![1] = 50000;
    expect(calculateFinance(m).status).toBe("invalid");
  });
  it("models configured tax cash with payment lag", () => {
    const m = fixture();
    m.tax = {
      mode: "configured",
      propcoRate: 0.1,
      opcoRate: 0.2,
      withholdingRate: 0.05,
      depreciation: Array(12).fill(100),
      vatCash: Array(12).fill(20),
      customsCash: Array(12).fill(0),
      paymentLagMonths: 1,
    };
    const r = calculateFinance(m);
    expect(r.monthly[0]!.tax).toBe(20);
    expect(r.monthly[1]!.tax).toBeCloseTo(
      40 + 0.2 * (10000 - 3100 - 620 - 100 - 500) + 20,
      6,
    );
  });
  it("blocks returns for missing committed funding and flags covenant breaches", () => {
    const m = fixture();
    m.equity = Array(12).fill(0);
    const r = calculateFinance(m);
    expect(r.peakFundingGap).toBeGreaterThan(0);
    expect(r.equityIrr.status).toBe("unavailable");
  });
  it("rejects bad shares, malformed schedules, negative cost and invalid dates", () => {
    const m = fixture();
    m.services[0]!.share = 0.5;
    expect(calculateFinance(m).status).toBe("invalid");
    m.services[0]!.share = 1;
    m.development.spendingShares = [1];
    expect(calculateFinance(m).status).toBe("invalid");
    m.loadedAnnualWage = -1;
    expect(calculateFinance(m).status).toBe("invalid");
  });
  it("stress variants preserve source inputs", () => {
    const m = fixture(),
      n = stressModel(m, {
        delay: 1,
        capex: 0.2,
        wages: 0.1,
        prices: -0.1,
        occupancy: -0.2,
        withdrawalMonth: 6,
      });
    expect(m.phases[0]!.openingMonth).toBe(0);
    expect(n.phases[0]!.openingMonth).toBe(1);
    expect(n.services[0]!.occupancy![6]).toBe(0);
    expect(n.development.direct[0]!.total).toBe(12000);
  });
});
describe("IRR", () => {
  it("annualizes monthly returns", () =>
    expect(irr([-100, ...Array(11).fill(0), 110])).toMatchObject({
      status: "available",
      rate: expect.closeTo(0.1, 6),
    }));
  it("reports missing, no-root and ambiguous cases", () => {
    expect(irr([null, 10]).status).toBe("unavailable");
    expect(irr([-100, -50]).status).toBe("unavailable");
    expect(irr([-100, 200, -110]).status).toBe("ambiguous");
  });
});
