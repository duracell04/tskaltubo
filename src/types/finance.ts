import type { ResearchDate } from "./evidence";
import type { ServiceModel } from "./scenario";

/** No defaults: parameters must be supplied explicitly in a later phase. */
export interface Assumption<T> {
  value: T;
  category: "assumption";
  evidenceIds: readonly string[];
  asOf: ResearchDate | null;
}

export type ModelYear = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type OperatingYear = Exclude<ModelYear, 0>;
export type AnnualSchedule<T> = Readonly<Record<OperatingYear, T>>;

export interface FxAssumption {
  currency: "CHF" | "GEL";
  /** EUR per one unit of the foreign currency. */
  eurPerUnit: Assumption<number>;
}

export interface ModelPrice {
  amount: Assumption<number>;
  currency: "EUR" | "CHF" | "GEL";
}

export interface OpeningPhase {
  id: string;
  openingYear: OperatingYear;
  capacity: Assumption<number>;
  grossAreaM2: Assumption<number>;
}

export interface ServiceLine {
  id: string;
  serviceModel: ServiceModel;
  capacityShare: Assumption<number>;
  rate: ModelPrice;
  ratePeriod: "month" | "day";
  occupancy: AnnualSchedule<Assumption<number>>;
  personnelPerOccupiedUnitEur: Assumption<number>;
  variableCostPerOccupiedUnitEur: Assumption<number>;
}

export interface StaffingEstimate {
  group: "nursing_care" | "medical_therapy" | "hospitality" | "management_administration" | "technical_support";
  fte: Assumption<number>;
  loadedAnnualCostPerFteEur: Assumption<number>;
}

export type OperatingCosts =
  | { mode: "derived"; fixedAnnualOpexEur: Assumption<number> }
  | { mode: "margin"; ebitdaMargin: Assumption<number> };

export interface FinanceInput {
  scenarioId: string;
  propertyId: string | null;
  baseCurrency: "EUR";
  fx: readonly FxAssumption[];
  acquisition: ModelPrice;
  transactionCostsEur: Assumption<number>;
  grossBuildingAreaM2: Assumption<number>;
  usableAreaM2: Assumption<number> | null;
  renovationPerM2Eur: Assumption<number>;
  capacity: Assumption<number>;
  ffePerUnitEur: Assumption<number>;
  medicalEquipmentEur: Assumption<number>;
  balneologyInvestmentEur: Assumption<number>;
  softCostsRate: Assumption<number>;
  contingencyRate: Assumption<number>;
  preOpeningEur: Assumption<number>;
  workingCapitalEur: Assumption<number>;
  phases: readonly [OpeningPhase] | readonly [OpeningPhase, OpeningPhase] | readonly [OpeningPhase, OpeningPhase, OpeningPhase];
  developmentSpendingShares: Readonly<Record<ModelYear, Assumption<number>>>;
  serviceLines: readonly ServiceLine[];
  ancillaryRevenueRate: Assumption<number>;
  operatingCosts: OperatingCosts;
  maintenanceCapexRate: Assumption<number>;
  staffingCheck: readonly StaffingEstimate[];
}

export interface AnnualFinanceResult {
  year: ModelYear;
  acquisitionExpenditureEur: number;
  developmentExpenditureEur: number;
  openingCapacity: number;
  occupiedUnits: number;
  revenueEur: number;
  opexEur: number;
  ebitdaEur: number;
  ebitdaMargin: number | null;
  maintenanceCapexEur: number;
  operatingCashFlowEur: number;
  projectCashFlowEur: number;
  cumulativeCashFlowEur: number;
  cashYield: number | null;
}

export type TimingResult =
  | { status: "reached"; year: OperatingYear }
  | { status: "notReachedWithinHorizon" };

export type IrrResult =
  | { status: "available"; rate: number }
  | { status: "unavailable" | "ambiguous"; reason: string };

export interface FinanceResult {
  totalAcquisitionEur: number;
  developmentCapexEur: number;
  totalInvestmentEur: number;
  investmentPerUnitEur: number | null;
  annual: readonly AnnualFinanceResult[];
  operatingBreakEven: TimingResult;
  cashFlowBreakEven: TimingResult;
  investmentPayback: TimingResult;
  simpleRoi: number | null;
  projectIrr: IrrResult;
}

export type FinanceCalculation =
  | { status: "notImplemented" }
  | { status: "invalidInput"; issues: readonly string[] }
  | { status: "calculated"; result: FinanceResult };
