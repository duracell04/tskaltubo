import { modelSchema, type DevelopmentModel } from "./model-schema";
type N = number | null;
const sum = (xs: N[]): N =>
  xs.some((x) => x === null)
    ? null
    : (xs as number[]).reduce((a, b) => a + b, 0);
const mul = (...xs: N[]): N =>
  xs.some((x) => x === null)
    ? null
    : (xs as number[]).reduce((a, b) => a * b, 1);
const sub = (a: N, b: N): N => (a === null || b === null ? null : a - b);
const at = (xs: number[] | null, i: number): N => xs?.[i] ?? null;
export interface MonthResult {
  month: string;
  days: number;
  capacity: N;
  occupied: N;
  admissions: N;
  revenue: N;
  fte: N;
  payroll: N;
  opex: N;
  ebitda: N;
  maintenance: N;
  capex: N;
  workingCapital: N;
  deposits: N;
  receivables: N;
  payables: N;
  tax: N;
  projectCash: N;
  debtDraw: N;
  interest: N;
  principal: N;
  debtBalance: N;
  cashAvailableForEquity: N;
  equity: N;
  distribution: N;
  cashBalance: N;
  fundingGap: N;
  dscr: N;
  rentCover: N;
  propco: { revenue: N; ebitda: N; cash: N };
  opco: { revenue: N; ebitda: N; cash: N };
}
export type ReturnResult =
  | { status: "available"; rate: number }
  | { status: "unavailable" | "ambiguous"; reason: string };
export function irr(cash: N[]): ReturnResult {
  if (cash.some((x) => x === null))
    return { status: "unavailable", reason: "Incomplete cash flows" };
  const xs = cash as number[],
    nz = xs.filter((x) => Math.abs(x) > 1e-9);
  let changes = 0;
  for (let i = 1; i < nz.length; i++)
    if (Math.sign(nz[i]!) !== Math.sign(nz[i - 1]!)) changes++;
  if (changes === 0)
    return {
      status: "unavailable",
      reason: "Cash flows need both investment and proceeds",
    };
  if (changes > 1)
    return {
      status: "ambiguous",
      reason:
        "Multiple cash-flow sign changes; a unique IRR is not established",
    };
  const npv = (r: number) =>
    xs.reduce((s, c, i) => s + c / Math.pow(1 + r, i), 0);
  let lo = -0.95,
    hi = 1;
  for (let i = 0; i < 15 && Math.sign(npv(lo)) === Math.sign(npv(hi)); i++)
    hi *= 2;
  if (Math.sign(npv(lo)) === Math.sign(npv(hi)))
    return { status: "unavailable", reason: "No root in supported range" };
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (Math.sign(npv(mid)) === Math.sign(npv(lo))) lo = mid;
    else hi = mid;
  }
  const rate = Math.pow(1 + (lo + hi) / 2, 12) - 1;
  return Number.isFinite(rate)
    ? { status: "available", rate }
    : { status: "unavailable", reason: "Non-finite return" };
}
export interface ModelResult {
  status: "invalid" | "partial" | "complete";
  issues: string[];
  missing: string[];
  monthly: MonthResult[];
  totalInvestment: N;
  npv: N;
  projectIrr: ReturnResult;
  equityIrr: ReturnResult;
  peakFundingGap: N;
  warnings: string[];
}
export function calculateFinance(raw: unknown): ModelResult {
  const base: ModelResult = {
    status: "invalid",
    issues: [],
    missing: [],
    monthly: [],
    totalInvestment: null,
    npv: null,
    projectIrr: { status: "unavailable", reason: "Invalid inputs" },
    equityIrr: { status: "unavailable", reason: "Invalid inputs" },
    peakFundingGap: null,
    warnings: [],
  };
  const parsed = modelSchema.safeParse(raw);
  if (!parsed.success)
    return {
      ...base,
      issues: parsed.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`,
      ),
    };
  const m = parsed.data,
    issues: string[] = [];
  const walk = (v: unknown, path = "") => {
    if (Array.isArray(v)) {
      if (v.length && typeof v[0] === "number") {
        if (v.length !== m.months)
          issues.push(`${path}: expected ${m.months} monthly values`);
      } else v.forEach((x, i) => walk(x, `${path}.${i}`));
    } else if (v && typeof v === "object")
      Object.entries(v).forEach(([k, x]) => {
        if (k !== "assumptions") walk(x, path ? `${path}.${k}` : k);
      });
  };
  walk(m);
  const shares = m.services
    .filter((s) => s.period !== "session")
    .map((s) => s.share);
  if (
    shares.length &&
    shares.every((x) => x !== null) &&
    Math.abs((sum(shares) ?? 0) - 1) > 1e-6
  )
    issues.push("Residential/day service capacity shares must sum to 1");
  m.services.forEach((s) => {
    if (s.occupancy?.some((x) => x > 1))
      issues.push(`${s.name}: occupancy exceeds 100%`);
    if (s.period !== "session" && s.lengthOfStayDays === 0)
      issues.push(`${s.name}: length of stay must be positive`);
  });
  if (
    m.productiveHoursPerFte === 0 ||
    m.staffingRoles.some((r) => r.productiveHoursPerFte === 0)
  )
    issues.push("Productive hours per FTE must be positive");
  if (
    m.staffingMode === "roster" &&
    (!m.staffingRoles.length ||
      (m.staffingRoles.every((r) => r.careShare !== null) &&
        Math.abs((sum(m.staffingRoles.map((r) => r.careShare)) ?? 0) - 1) >
          1e-6))
  )
    issues.push("Roster care shares must sum to 1");
  for (const role of m.staffingRoles)
    for (const shift of role.shifts)
      if (
        shift.germanSpeakers !== null &&
        shift.staff !== null &&
        shift.germanSpeakers > shift.staff
      )
        issues.push(
          `${role.name}: German-language coverage exceeds staff on shift`,
        );
  if (
    m.development.spendingShares &&
    (m.development.spendingShares.length !== m.months ||
      Math.abs(m.development.spendingShares.reduce((a, b) => a + b, 0) - 1) >
        1e-6)
  )
    issues.push(
      "Development spending shares must span the horizon and sum to 1",
    );
  if (
    m.phases.some((p) => p.openingMonth >= m.months) ||
    m.development.acquisitionMonth >= m.months
  )
    issues.push("Opening/acquisition month lies outside model horizon");
  if (m.exit.mode === "configured" && m.exit.month !== m.months - 1)
    issues.push("Exit must occur in the final model month");
  if (issues.length) return { ...base, issues };
  const fx = (v: N, c: string): N =>
    c === "EUR" ? v : mul(v, m.fx[c as keyof typeof m.fx]);
  const directProp = sum(
      m.development.direct
        .filter((c) => c.entity === "propco")
        .map((c) => fx(c.total, c.currency)),
    ),
    directOp = sum(
      m.development.direct
        .filter((c) => c.entity === "opco")
        .map((c) => fx(c.total, c.currency)),
    );
  const direct = sum([directProp, directOp]),
    soft = mul(direct, m.development.softRate),
    contingency = mul(
      m.development.contingencyBase === "direct" ? direct : sum([direct, soft]),
      m.development.contingencyRate,
    ),
    development = sum([direct, soft, contingency]);
  const totalInvestment = sum([
    development,
    m.development.acquisition,
    m.development.transaction,
    sum(m.development.preOpening ?? [null]),
    sum(m.development.sponsorCosts ?? [null]),
    sum(m.development.workingCapital ?? [null]),
    m.continuityReserve,
  ]);
  let balance: N = m.debt.mode === "none" ? 0 : m.debt.openingBalance,
    cashBalance: N = 0,
    arPrev: N = 0,
    apPrev: N = 0,
    depositBalance: N = 0;
  const monthly: MonthResult[] = [],
    taxBases: { prop: N; op: N; unleveredProp: N; unleveredOp: N }[] = [],
    effectiveMissing = new Set<string>();
  const need = (v: N, key: string) => {
    if (v === null) effectiveMissing.add(key);
    return v;
  };
  for (let i = 0; i < m.months; i++) {
    const date = new Date(`${m.startDate}T00:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() + i);
    const days = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
    ).getUTCDate();
    const capacity = sum(
      m.phases.filter((p) => p.openingMonth <= i).map((p) => p.capacity),
    );
    const perService = m.services.map((s) => {
      const beds = mul(capacity, s.share),
        out = at(s.outOfService, i);
      if (beds !== null && out !== null && out > beds)
        issues.push(
          `${s.name}, month ${i}: unavailable beds exceed opened capacity`,
        );
      const occupied = mul(sub(beds, out), at(s.occupancy, i));
      const units =
        s.period === "session"
          ? at(s.sessions, i)
          : s.period === "day"
            ? mul(occupied, days)
            : occupied;
      const revenue = mul(
        units,
        fx(s.rate, s.currency),
        sub(1, s.discount),
        sub(1, s.cancellations),
        sub(1, s.badDebt),
      );
      return {
        occupied: s.period === "session" ? 0 : occupied,
        revenue,
        admissions:
          s.period === "session"
            ? 0
            : s.lengthOfStayDays && occupied !== null
              ? (occupied * days) / s.lengthOfStayDays
              : null,
        care:
          s.period === "session"
            ? 0
            : mul(occupied, days, s.careHoursPerOccupiedDay),
        variable: mul(
          s.period === "session" ? at(s.sessions, i) : occupied,
          s.period === "session" ? 1 : days,
          s.variableCostPerOccupiedDay,
        ),
      };
    });
    const occupied = sum(perService.map((s) => s.occupied)),
      admissions = need(
        sum(perService.map((s) => s.admissions)),
        "Length of stay / admissions throughput",
      ),
      revenue = need(
        mul(sum(perService.map((s) => s.revenue)), sum([1, m.ancillaryRate])),
        "Revenue assumptions, occupancy, service rates and FX",
      );
    const care = sum(perService.map((s) => s.care)),
      floor = capacity === 0 ? 0 : mul(m.minimumCoverageHoursPerDay, days),
      hours = care === null || floor === null ? null : Math.max(care, floor);
    const roster = m.staffingRoles.map((role) => {
      const acuity = mul(care, role.careShare),
        coverage =
          capacity === 0
            ? 0
            : mul(
                sum(role.shifts.map((shift) => mul(shift.hours, shift.staff))),
                days,
              );
      const h =
        acuity === null || coverage === null
          ? null
          : Math.max(acuity, coverage);
      const f =
        h === null || role.productiveHoursPerFte === null
          ? null
          : h / (role.productiveHoursPerFte / 12);
      return {
        fte: f,
        payroll: mul(f, fx(role.loadedAnnualWage, role.currency), 1 / 12),
      };
    });
    const fte =
        m.staffingMode === "roster"
          ? sum(roster.map((r) => r.fte))
          : hours === null || m.productiveHoursPerFte === null
            ? null
            : hours / (m.productiveHoursPerFte / 12),
      payroll =
        m.staffingMode === "roster"
          ? sum(roster.map((r) => r.payroll))
          : mul(fte, fx(m.loadedAnnualWage, m.wageCurrency), 1 / 12);
    const opex = need(
      sum([
        payroll,
        sum(perService.map((s) => s.variable)),
        sum(m.departmentalCosts.map((c) => fx(c.monthly, c.currency))),
        mul(revenue, m.managementFeeRate),
      ]),
      "Staffing and departmental operating costs",
    );
    const ebitda = sub(revenue, opex),
      rent = at(m.rent, i),
      propEbitda = rent,
      opEbitda = sub(ebitda, rent),
      maintenance = mul(revenue, m.maintenanceRate),
      replacement = at(m.replacementCapex, i);
    const spend = mul(development, at(m.development.spendingShares, i)),
      acquisition =
        i === m.development.acquisitionMonth
          ? sum([m.development.acquisition, m.development.transaction])
          : 0;
    const capex = sum([
      spend,
      acquisition,
      at(m.development.preOpening, i),
      at(m.development.sponsorCosts, i),
      replacement,
    ]);
    const propShare =
        direct === 0
          ? 0
          : direct !== null && directProp !== null
            ? directProp / direct
            : null,
      propCapex = sum([mul(spend, propShare), acquisition, replacement]),
      opCapex = sub(capex, propCapex);
    const ar = mul(revenue, m.receivableDays, 1 / days),
      ap = mul(opex, m.payableDays, 1 / days),
      wc = sum([
        sub(ar, arPrev),
        mul(sub(ap, apPrev), -1),
        at(m.development.workingCapital, i),
      ]);
    arPrev = ar;
    apPrev = ap;
    const deposits = at(m.depositMovement, i);
    depositBalance = sum([depositBalance, deposits]);
    if (depositBalance !== null && depositBalance < -0.01)
      issues.push(`Month ${i}: deposit refunds exceed deposits held`);
    const debtNone = m.debt.mode === "none",
      draw = debtNone ? 0 : at(m.debt.draws, i),
      principal = debtNone ? 0 : at(m.debt.principal, i),
      fees = debtNone ? 0 : at(m.debt.fees, i);
    const interest = debtNone
        ? 0
        : mul(sum([balance, draw]), m.debt.annualRate, 1 / 12),
      capitalized =
        m.debt.interestTreatment === "capitalized_during_development" &&
        i < m.debt.developmentMonths,
      interestPaid = capitalized ? 0 : interest;
    balance = sub(sum([balance, draw, capitalized ? interest : 0]), principal);
    if (balance !== null && balance < -0.01)
      issues.push(`Month ${i}: debt principal exceeds outstanding balance`);
    const noTax = m.tax.mode === "explicit_exclusion",
      dep = at(m.tax.depreciation, i);
    taxBases.push({
      prop: sub(sub(propEbitda, dep), interest),
      op: opEbitda,
      unleveredProp: sub(propEbitda, dep),
      unleveredOp: opEbitda,
    });
    const tb = taxBases[i - m.tax.paymentLagMonths],
      taxable = (n: N, rate: N) =>
        n === null ? null : mul(Math.max(0, n), rate),
      taxAllowed = m.tax.mode === "configured";
    const propTax = noTax
        ? 0
        : !taxAllowed
          ? null
          : tb
            ? taxable(tb.prop, m.tax.propcoRate)
            : 0,
      opTax = noTax
        ? 0
        : !taxAllowed
          ? null
          : tb
            ? taxable(tb.op, m.tax.opcoRate)
            : 0;
    const unleveredTax = noTax
        ? 0
        : !taxAllowed
          ? null
          : tb
            ? sum([
                taxable(tb.unleveredProp, m.tax.propcoRate),
                taxable(tb.unleveredOp, m.tax.opcoRate),
              ])
            : 0,
      extraTax = noTax
        ? 0
        : !taxAllowed
          ? null
          : sum([at(m.tax.vatCash, i), at(m.tax.customsCash, i)]),
      tax = need(
        sum([propTax, opTax, extraTax]),
        "Tax treatment and cash schedules",
      );
    const exitMonth = m.exit.mode === "configured" && i === m.exit.month,
      terminal = exitMonth
        ? sub(mul(m.exit.grossValue, sub(1, m.exit.costRate)), m.exit.taxCash)
        : i === m.months - 1 && m.exit.mode === "unresolved"
          ? null
          : 0,
      reserve = i === 0 ? m.continuityReserve : 0;
    const projectCash = need(
      sum([
        ebitda,
        mul(sum([maintenance, capex, wc, unleveredTax, extraTax, reserve]), -1),
        terminal,
      ]),
      "Development, working capital, maintenance, tax and terminal cash flows",
    );
    const propCash = sum([
        propEbitda,
        mul(sum([propCapex, propTax, extraTax]), -1),
        terminal,
      ]),
      opCash = sub(opEbitda, sum([opCapex, maintenance, wc, opTax, reserve]));
    // Deposits remain restricted resident liabilities, excluded from distributable funding.
    const exitDebt = exitMonth ? balance : 0,
      available = sum([
        propCash,
        opCash,
        draw,
        mul(sum([principal, interestPaid, fees, exitDebt]), -1),
      ]);
    if (exitMonth) balance = 0;
    const equity = at(m.equity, i),
      beforeDistribution = sum([cashBalance, available, equity]),
      distribution =
        beforeDistribution === null ? null : Math.max(0, beforeDistribution);
    cashBalance = sub(beforeDistribution, distribution);
    const gap = cashBalance === null ? null : Math.max(0, -cashBalance),
      service = sum([principal, interestPaid]),
      cfads = sub(ebitda, sum([maintenance, wc, tax])),
      dscr =
        service === null || service <= 0 || cfads === null
          ? null
          : cfads / service;
    monthly.push({
      month: date.toISOString().slice(0, 7),
      days,
      capacity,
      occupied,
      admissions,
      revenue,
      fte,
      payroll,
      opex,
      ebitda,
      maintenance,
      capex,
      workingCapital: wc,
      deposits,
      receivables: ar,
      payables: ap,
      tax,
      projectCash,
      debtDraw: draw,
      interest,
      principal,
      debtBalance: balance,
      cashAvailableForEquity: available,
      equity,
      distribution,
      cashBalance,
      fundingGap: gap,
      dscr,
      rentCover:
        rent === null || rent === 0 || ebitda === null ? null : ebitda / rent,
      propco: { revenue: rent, ebitda: propEbitda, cash: propCash },
      opco: { revenue, ebitda: opEbitda, cash: opCash },
    });
  }
  if (issues.length) return { ...base, issues };
  const projectFlows = monthly.map((r) => r.projectCash),
    equityFlows = monthly.map((r) =>
      sub(
        mul(
          r.distribution,
          m.tax.mode === "explicit_exclusion"
            ? 1
            : sub(1, m.tax.withholdingRate),
        ),
        r.equity,
      ),
    );
  const npv =
      m.discountRate === null || projectFlows.some((x) => x === null)
        ? null
        : (projectFlows as number[]).reduce(
            (s, c, i) => s + c / Math.pow(1 + m.discountRate!, i / 12),
            0,
          ),
    gaps = monthly.map((r) => r.fundingGap);
  const warnings = [
    "Conditional scenarios, not validated investment returns.",
    "Staffing coverage requires clinical approval.",
    "Resident deposits are restricted and excluded from distributable cash.",
    "Tax rates and schedules are user assumptions, not Georgian tax advice.",
    ...m.exclusions.map((x) => `Explicit exclusion: ${x}`),
  ];
  if (m.tax.mode === "explicit_exclusion")
    warnings.push("Tax explicitly excluded: returns are pre-tax.");
  if (m.debt.mode === "none")
    warnings.push("Debt excluded: all-equity funding assumption.");
  if (
    m.staffingMode === "roster" &&
    m.germanSpeakersPerShift !== null &&
    [0, 1, 2].some((i) => {
      const count = sum(
        m.staffingRoles.map((r) => r.shifts[i]?.germanSpeakers ?? null),
      );
      return count === null || count < m.germanSpeakersPerShift!;
    })
  )
    warnings.push(
      "German-language coverage is incomplete or below the assumed per-shift requirement.",
    );
  if (m.exit.mode === "none")
    warnings.push("No disposal; assets and liabilities remain at horizon end.");
  if (
    monthly.some(
      (r) =>
        r.dscr !== null &&
        m.debt.minimumDscr !== null &&
        r.dscr < m.debt.minimumDscr,
    )
  )
    warnings.push("Debt-service covenant breached.");
  const peakFundingGap = gaps.some((x) => x === null)
    ? null
    : Math.max(...(gaps as number[]));
  if (peakFundingGap !== null && peakFundingGap > 0)
    warnings.push("Committed equity does not fund this scenario.");
  const unknowns = [...effectiveMissing];
  if (m.debt.mode === "unresolved") unknowns.push("Debt structure");
  if (m.exit.mode === "unresolved") unknowns.push("Terminal treatment");
  if (m.equity === null) unknowns.push("Committed equity");
  if (m.discountRate === null) unknowns.push("Discount rate");
  return {
    status: unknowns.length ? "partial" : "complete",
    issues: [],
    missing: unknowns,
    monthly,
    totalInvestment,
    npv,
    projectIrr: irr(projectFlows),
    equityIrr:
      peakFundingGap === null || peakFundingGap > 0
        ? {
            status: "unavailable",
            reason: "Funding plan incomplete or underfunded",
          }
        : irr(equityFlows),
    peakFundingGap,
    warnings,
  };
}
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
export function screening(input = reportCases.base, investment = 22_209_450) {
  const longRevenue = 98 * input.longRate * 12 * input.longOccupancy,
    rehabRevenue = 42 * input.rehabRate * 365 * input.rehabOccupancy,
    revenue = (longRevenue + rehabRevenue) * (1 + input.ancillary),
    ebitda = revenue * input.margin,
    maintenance = revenue * 0.02,
    cash = ebitda - maintenance;
  return {
    longRevenue,
    rehabRevenue,
    revenue,
    ebitda,
    maintenance,
    cash,
    investment,
    yield: investment > 0 ? cash / investment : null,
    payback: cash > 0 ? investment / cash : null,
  };
}
export function stressModel(
  m: DevelopmentModel,
  stress: {
    delay: number;
    capex: number;
    wages: number;
    prices: number;
    occupancy: number;
    withdrawalMonth: number | null;
  },
): DevelopmentModel {
  const n = structuredClone(m);
  n.name = `${m.name} — downside`;
  n.phases = n.phases.map((p) => ({
    ...p,
    openingMonth: p.openingMonth + stress.delay,
  }));
  n.development.direct = n.development.direct.map((c) => ({
    ...c,
    total: c.total === null ? null : c.total * (1 + stress.capex),
  }));
  if (n.loadedAnnualWage !== null) n.loadedAnnualWage *= 1 + stress.wages;
  n.services = n.services.map((s) => ({
    ...s,
    rate: s.rate === null ? null : s.rate * (1 + stress.prices),
    occupancy:
      s.occupancy?.map((x, i) =>
        stress.withdrawalMonth !== null && i >= stress.withdrawalMonth
          ? 0
          : Math.max(0, Math.min(1, x * (1 + stress.occupancy))),
      ) ?? null,
  }));
  return n;
}
