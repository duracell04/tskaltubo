import { z } from "zod";
const amount = z.number().finite().min(0).nullable();
const fraction = z.number().finite().min(0).max(1).nullable();
const series = z.array(z.number().finite()).max(360).nullable();
const positiveSeries = z.array(z.number().finite().min(0)).max(360).nullable();
const currency = z.enum(["EUR", "GEL", "CHF", "USD"]);
export const modelSchema = z.object({
  schemaVersion: z.literal(2),
  name: z.string().min(1).max(180),
  conceptId: z.string().min(1).max(80),
  propertyId: z.string().nullable(),
  startDate: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-01$/),
  months: z.number().int().min(1).max(360),
  assumptions: z.record(
    z.string(),
    z.object({
      classification: z.enum([
        "assumption",
        "derived",
        "official",
        "market_field",
        "unknown",
      ]),
      sourceIds: z.array(z.string()),
      asOf: z.string().nullable(),
      note: z.string(),
    }),
  ),
  exclusions: z.array(z.string()),
  fx: z.object({ GEL: amount, CHF: amount, USD: amount }),
  phases: z
    .array(
      z.object({
        name: z.string(),
        openingMonth: z.number().int().min(0).max(359),
        capacity: amount,
      }),
    )
    .max(3),
  services: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        share: fraction,
        rate: amount,
        currency,
        period: z.enum(["month", "day", "session"]),
        occupancy: positiveSeries,
        outOfService: positiveSeries,
        sessions: positiveSeries,
        lengthOfStayDays: amount,
        discount: fraction,
        cancellations: fraction,
        badDebt: fraction,
        careHoursPerOccupiedDay: amount,
        variableCostPerOccupiedDay: amount,
      }),
    )
    .max(30),
  ancillaryRate: fraction,
  productiveHoursPerFte: amount,
  loadedAnnualWage: amount,
  wageCurrency: currency,
  minimumCoverageHoursPerDay: amount,
  germanSpeakersPerShift: amount,
  staffingMode: z.enum(["aggregate", "roster"]),
  staffingRoles: z
    .array(
      z.object({
        name: z.string(),
        careShare: fraction,
        productiveHoursPerFte: amount,
        loadedAnnualWage: amount,
        currency,
        shifts: z
          .array(
            z.object({
              name: z.string(),
              hours: amount,
              staff: amount,
              germanSpeakers: amount,
            }),
          )
          .max(3),
      }),
    )
    .max(30),
  departmentalCosts: z
    .array(z.object({ name: z.string(), monthly: amount, currency }))
    .max(50),
  managementFeeRate: fraction,
  development: z.object({
    direct: z
      .array(
        z.object({
          name: z.string(),
          total: amount,
          currency,
          entity: z.enum(["propco", "opco"]),
        }),
      )
      .max(50),
    softRate: fraction,
    contingencyRate: fraction,
    contingencyBase: z.enum(["direct", "direct_plus_soft"]),
    spendingShares: positiveSeries,
    acquisition: amount,
    acquisitionMonth: z.number().int().min(0).max(359),
    transaction: amount,
    preOpening: positiveSeries,
    sponsorCosts: positiveSeries,
    workingCapital: series,
  }),
  maintenanceRate: fraction,
  replacementCapex: positiveSeries,
  rent: positiveSeries,
  receivableDays: amount,
  payableDays: amount,
  depositMovement: series,
  continuityReserve: amount,
  tax: z.object({
    mode: z.enum(["unresolved", "explicit_exclusion", "configured"]),
    propcoRate: fraction,
    opcoRate: fraction,
    withholdingRate: fraction,
    depreciation: positiveSeries,
    vatCash: series,
    customsCash: positiveSeries,
    paymentLagMonths: z.number().int().min(0).max(24),
  }),
  debt: z.object({
    mode: z.enum(["unresolved", "none", "scheduled"]),
    openingBalance: amount,
    draws: positiveSeries,
    principal: positiveSeries,
    annualRate: amount,
    fees: positiveSeries,
    interestTreatment: z.enum(["paid", "capitalized_during_development"]),
    developmentMonths: z.number().int().min(0).max(359),
    minimumDscr: amount,
  }),
  equity: positiveSeries,
  discountRate: amount,
  exit: z.object({
    mode: z.enum(["unresolved", "none", "configured"]),
    month: z.number().int().min(0).max(359),
    grossValue: amount,
    costRate: fraction,
    taxCash: amount,
  }),
});
export type DevelopmentModel = z.infer<typeof modelSchema>;
export function emptyModel(conceptId = "TSK-S7"): DevelopmentModel {
  return {
    schemaVersion: 2,
    name: "Untitled development scenario",
    conceptId,
    propertyId: null,
    startDate: "2027-01-01",
    months: 120,
    assumptions: {},
    exclusions: [],
    fx: { GEL: null, CHF: null, USD: null },
    phases: [{ name: "Phase 1", openingMonth: 24, capacity: null }],
    services: [
      {
        id: "residential",
        name: "Residential service",
        share: 1,
        rate: null,
        currency: "EUR",
        period: "month",
        occupancy: null,
        outOfService: null,
        sessions: null,
        lengthOfStayDays: null,
        discount: null,
        cancellations: null,
        badDebt: null,
        careHoursPerOccupiedDay: null,
        variableCostPerOccupiedDay: null,
      },
    ],
    ancillaryRate: null,
    productiveHoursPerFte: null,
    loadedAnnualWage: null,
    wageCurrency: "GEL",
    minimumCoverageHoursPerDay: null,
    germanSpeakersPerShift: null,
    staffingMode: "roster",
    staffingRoles: [
      {
        name: "Nursing and care",
        careShare: 1,
        productiveHoursPerFte: null,
        loadedAnnualWage: null,
        currency: "GEL",
        shifts: [
          { name: "Day", hours: 8, staff: null, germanSpeakers: null },
          { name: "Evening", hours: 8, staff: null, germanSpeakers: null },
          { name: "Night", hours: 8, staff: null, germanSpeakers: null },
        ],
      },
    ],
    departmentalCosts: [
      {
        name: "Hospitality, utilities, clinical, insurance and administration",
        monthly: null,
        currency: "GEL",
      },
    ],
    managementFeeRate: null,
    development: {
      direct: [
        {
          name: "Building and fit-out",
          total: null,
          currency: "EUR",
          entity: "propco",
        },
      ],
      softRate: null,
      contingencyRate: null,
      contingencyBase: "direct",
      spendingShares: null,
      acquisition: null,
      acquisitionMonth: 0,
      transaction: null,
      preOpening: null,
      sponsorCosts: null,
      workingCapital: null,
    },
    maintenanceRate: null,
    replacementCapex: null,
    rent: null,
    receivableDays: null,
    payableDays: null,
    depositMovement: null,
    continuityReserve: null,
    tax: {
      mode: "unresolved",
      propcoRate: null,
      opcoRate: null,
      withholdingRate: null,
      depreciation: null,
      vatCash: null,
      customsCash: null,
      paymentLagMonths: 0,
    },
    debt: {
      mode: "unresolved",
      openingBalance: null,
      draws: null,
      principal: null,
      annualRate: null,
      fees: null,
      interestTreatment: "paid",
      developmentMonths: 24,
      minimumDscr: null,
    },
    equity: null,
    discountRate: null,
    exit: {
      mode: "unresolved",
      month: 119,
      grossValue: null,
      costRate: null,
      taxCash: null,
    },
  };
}
