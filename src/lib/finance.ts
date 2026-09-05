import type { FinanceCalculation, FinanceInput } from "@/types/finance";

export type FinanceCalculator = (input: FinanceInput) => FinanceCalculation;

/** Phase 1 contract only. No calculations or financial defaults exist yet. */
export const calculateFinance: FinanceCalculator = () => ({ status: "notImplemented" });
