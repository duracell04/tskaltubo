import type {
  AnnualInput,
  AnnualResult,
  Value,
  ReturnResult,
} from "@/types/annual-finance";
const sum = (xs: Value[]): Value =>
  xs.some((x) => x === null)
    ? null
    : (xs as number[]).reduce((a, b) => a + b, 0);
const mul = (...xs: Value[]): Value =>
  xs.some((x) => x === null)
    ? null
    : (xs as number[]).reduce((a, b) => a * b, 1);
const minus = (a: Value, b: Value): Value =>
  a === null || b === null ? null : a - b;
const ratio = (a: Value, b: Value): Value =>
  a === null || b === null || b === 0 ? null : a / b;
export const reportCases = {
  conservative: {
    longRate: 2600,
    longOccupancy: 0.75,
    rehabRate: 145,
    rehabOccupancy: 0.5,
    ancillary: 0.03,
    margin: 0.14,
  },
  base: {
    longRate: 3400,
    longOccupancy: 0.85,
    rehabRate: 190,
    rehabOccupancy: 0.65,
    ancillary: 0.06,
    margin: 0.23,
  },
  upside: {
    longRate: 4200,
    longOccupancy: 0.9,
    rehabRate: 240,
    rehabOccupancy: 0.75,
    ancillary: 0.08,
    margin: 0.28,
  },
};
export type ReportCase = keyof typeof reportCases;
export function emptyAnnual(conceptId = "TSK-S7"): AnnualInput {
  const names: Record<string, string[]> = {
    "TSK-S1": ["Independent residence"],
    "TSK-S2": ["Assisted living"],
    "TSK-S3": ["Independent living", "Assisted living", "Nursing"],
    "TSK-S4": ["Rehabilitation / post-acute"],
    "TSK-S5": ["Senior residence", "Wellness stays"],
    "TSK-S6": ["Residential / assisted living", "Rehabilitation"],
    "TSK-S7": ["Long-term nursing care"],
  };
  return {
    version: 1,
    conceptId,
    propertyId: null,
    acquisition: null,
    currency: "EUR",
    fx: null,
    fxDate: "",
    transaction: null,
    acquisitionBundled: false,
    area: null,
    renovation: null,
    capacity: null,
    ffe: null,
    medical: null,
    equipmentBundled: false,
    hydro: null,
    soft: null,
    contingency: null,
    contingencyBase: "direct",
    preOpening: null,
    workingCapital: null,
    preOpeningBundled: false,
    phases: [{ year: 1, capacity: null }],
    spending: [1, ...Array(10).fill(0)],
    services: (names[conceptId] ?? ["Residential service"]).map((name) => ({
      name,
      share: null,
      rate: null,
      period: /rehab|acute|stays/i.test(name) ? "day" : "month",
      occupancy: Array(10).fill(null),
      personnel: null,
      variable: null,
    })),
    ancillary: null,
    costMode: "derived",
    margin: null,
    fixed: null,
    maintenance: null,
    provenance:
      "User worksheet. No validated financial assumptions for this concept.",
  };
}
export function reportExample(which: ReportCase = "base"): AnnualInput {
  const c = reportCases[which],
    m = emptyAnnual();
  return {
    ...m,
    acquisition: 2750000,
    acquisitionBundled: true,
    area: 9500,
    renovation: 1050,
    capacity: 140,
    ffe: 24000,
    equipmentBundled: true,
    hydro: 1200000,
    soft: 0.12,
    contingency: 0.15,
    preOpening: 1000000,
    preOpeningBundled: true,
    phases: [{ year: 1, capacity: 140 }],
    services: [
      {
        name: "Long-term care",
        share: 0.7,
        rate: c.longRate,
        period: "month",
        occupancy: Array(10).fill(c.longOccupancy),
        personnel: null,
        variable: null,
      },
      {
        name: "Rehabilitation / short stays",
        share: 0.3,
        rate: c.rehabRate,
        period: "day",
        occupancy: Array(10).fill(c.rehabOccupancy),
        personnel: null,
        variable: null,
      },
    ],
    ancillary: c.ancillary,
    costMode: "margin",
    margin: c.margin,
    maintenance: 0.02,
    provenance:
      "Audit 6 September 2026, §§11.5–11.10. Report assumptions, not validated quotes. Acquisition includes transaction; FF&E includes medical/therapy/IT; pre-opening includes working capital. Their individual splits are unknown. Ten-year timing and flat rates are worksheet conventions, not a report forecast.",
  };
}
export function annualIrr(cash: Value[]): ReturnResult {
  if (cash.some((x) => x === null))
    return { status: "unavailable", reason: "Incomplete cash flows" };
  const xs = cash as number[],
    nz = xs.filter((x) => Math.abs(x) > 1e-9);
  let changes = 0;
  for (let i = 1; i < nz.length; i++)
    if (Math.sign(nz[i]!) !== Math.sign(nz[i - 1]!)) changes++;
  if (!changes)
    return {
      status: "unavailable",
      reason: "Cash flows require both investment and proceeds",
    };
  if (changes > 1)
    return {
      status: "ambiguous",
      reason: "Multiple sign changes; a unique IRR is not established",
    };
  const npv = (r: number) => xs.reduce((s, x, i) => s + x / (1 + r) ** i, 0);
  let lo = -0.9999,
    hi = 1;
  while (Math.sign(npv(lo)) === Math.sign(npv(hi)) && hi < 1e6) hi *= 2;
  if (Math.sign(npv(lo)) === Math.sign(npv(hi)))
    return { status: "unavailable", reason: "No root in supported range" };
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (Math.sign(npv(mid)) === Math.sign(npv(lo))) lo = mid;
    else hi = mid;
  }
  return { status: "available", rate: (lo + hi) / 2 };
}
export function calculateAnnual(m: AnnualInput): AnnualResult {
  const issues: string[] = [],
    missing: string[] = [];
  const need = (n: Value, label: string) => {
    if (n === null) missing.push(label);
    else if (!Number.isFinite(n) || n < 0)
      issues.push(`${label}: enter a finite nonnegative value`);
  };
  for (const k of [
    "acquisition",
    "area",
    "renovation",
    "capacity",
    "ffe",
    "hydro",
    "soft",
    "contingency",
    "preOpening",
    "ancillary",
    "maintenance",
  ] as const)
    need(m[k], k);
  if (!m.acquisitionBundled) need(m.transaction, "Transaction costs");
  if (!m.equipmentBundled) need(m.medical, "Medical equipment");
  if (!m.preOpeningBundled) need(m.workingCapital, "Working capital");
  if (m.currency !== "EUR") {
    need(m.fx, "EUR per foreign currency unit");
    if (m.fx !== null && m.fx <= 0) issues.push("FX must be positive");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(m.fxDate))
      missing.push("Dated FX assumption");
  }
  if (m.phases.length < 1 || m.phases.length > 3)
    issues.push("Use one to three opening phases");
  m.phases.forEach((p) => {
    need(p.capacity, "Phase capacity");
    if (!Number.isInteger(p.year) || p.year < 1 || p.year > 10)
      issues.push("Opening year must be 1–10");
  });
  const phaseTotal = sum(m.phases.map((p) => p.capacity));
  if (
    phaseTotal !== null &&
    m.capacity !== null &&
    Math.abs(phaseTotal - m.capacity) > 1e-6
  )
    issues.push("Phase capacities must equal total capacity");
  if (
    m.spending.length !== 11 ||
    m.spending.some((x) => !Number.isFinite(x) || x < 0 || x > 1) ||
    Math.abs(m.spending.reduce((a, b) => a + b, 0) - 1) > 1e-6
  )
    issues.push("Year 0–10 investment spending shares must total 100%");
  if (!m.services.length) issues.push("At least one service is required");
  m.services.forEach((s) => {
    need(s.share, `${s.name}: capacity share`);
    need(s.rate, `${s.name}: rate`);
    if (s.occupancy.length !== 10)
      issues.push("Each occupancy ramp needs ten years");
    s.occupancy.forEach((x, i) => {
      need(x, `${s.name}: year ${i + 1} occupancy`);
      if (x !== null && x > 1) issues.push("Occupancy cannot exceed 100%");
    });
    if (m.costMode === "derived") {
      need(s.personnel, `${s.name}: annual personnel cost per occupied unit`);
      need(s.variable, `${s.name}: annual other cost per occupied unit`);
    }
  });
  const shares = sum(m.services.map((s) => s.share));
  if (shares !== null && Math.abs(shares - 1) > 1e-6)
    issues.push("Service capacity shares must total 100%");
  if (m.costMode === "margin") need(m.margin, "EBITDA margin");
  else need(m.fixed, "Fixed annual operating costs");
  for (const x of [
    m.soft,
    m.contingency,
    m.ancillary,
    m.maintenance,
    ...m.services.map((s) => s.share),
    ...(m.costMode === "margin" ? [m.margin] : []),
  ])
    if (x !== null && x > 1)
      issues.push("Percentage assumptions must be 0–100%");
  const converted =
    m.currency === "EUR"
      ? m.acquisition
      : m.fxDate && m.fx !== null && m.fx > 0
        ? mul(m.acquisition, m.fx)
        : null;
  const acquisition = m.acquisitionBundled
    ? converted
    : sum([converted, m.transaction]);
  const renovation = mul(m.area, m.renovation),
    equipment = sum([
      mul(m.capacity, m.ffe),
      m.equipmentBundled ? 0 : m.medical,
    ]);
  const direct = sum([renovation, equipment, m.hydro]),
    soft = mul(direct, m.soft),
    contingency = mul(
      m.contingencyBase === "direct" ? direct : sum([direct, soft]),
      m.contingency,
    );
  const development = sum([direct, soft, contingency]);
  const remaining = sum([
    development,
    m.preOpening,
    m.preOpeningBundled ? 0 : m.workingCapital,
  ]);
  const investment = sum([acquisition, remaining]);
  const annual: AnnualResult["annual"] = [];
  let cumulative: Value = 0;
  for (let year = 0; year <= 10; year++) {
    const capacity =
      year === 0
        ? 0
        : sum(m.phases.filter((p) => p.year <= year).map((p) => p.capacity));
    const occupied = m.services.map((s) =>
      capacity === 0
        ? 0
        : mul(capacity, s.share, s.occupancy[year - 1] ?? null),
    );
    const core =
      year === 0 || capacity === 0
        ? 0
        : sum(
            m.services.map((s, i) =>
              occupied[i] === 0
                ? 0
                : mul(
                    occupied[i] ?? null,
                    s.rate,
                    s.period === "month" ? 12 : 365,
                  ),
            ),
          );
    const revenue =
      core === 0 ? 0 : mul(core, m.ancillary === null ? null : 1 + m.ancillary);
    const opex =
      year === 0 || capacity === 0
        ? 0
        : m.costMode === "margin"
          ? mul(revenue, m.margin === null ? null : 1 - m.margin)
          : sum([
              m.fixed,
              ...m.services.map((s, i) =>
                occupied[i] === 0
                  ? 0
                  : mul(occupied[i] ?? null, sum([s.personnel, s.variable])),
              ),
            ]);
    const ebitda = minus(revenue, opex),
      maintenance = revenue === 0 ? 0 : mul(revenue, m.maintenance),
      operatingCash = minus(ebitda, maintenance);
    const expenditure = sum([
      year === 0 ? acquisition : 0,
      m.spending[year] === 0 ? 0 : mul(remaining, m.spending[year] ?? null),
    ]);
    const projectCash = minus(operatingCash, expenditure);
    cumulative = sum([cumulative, projectCash]);
    annual.push({
      year,
      capacity,
      revenue,
      opex,
      ebitda,
      margin: ratio(ebitda, revenue),
      maintenance,
      operatingCash,
      expenditure,
      projectCash,
      cumulative,
      cashYield: ratio(operatingCash, investment),
    });
  }
  const payback =
    annual.find(
      (r, i) =>
        i > 0 &&
        r.cumulative !== null &&
        r.cumulative >= 0 &&
        annual
          .slice(i)
          .every((x) => x.cumulative !== null && x.cumulative >= 0),
    )?.year ?? null;
  return {
    issues: [...new Set(issues)],
    missing: [...new Set(missing)],
    investment,
    acquisition,
    renovation,
    equipment,
    direct,
    soft,
    contingency,
    development,
    investmentPerBed: ratio(investment, m.capacity),
    annual,
    roi: ratio(annual[10]!.cumulative, investment),
    payback,
    irr: issues.length
      ? { status: "unavailable", reason: "Correct invalid assumptions" }
      : annualIrr(annual.map((r) => r.projectCash)),
  };
}
