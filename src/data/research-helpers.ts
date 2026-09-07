import type { ResearchDate, SourcedValue } from "@/types/evidence";
import type { LocalizedText } from "@/types/property";
export const RESEARCH_AS_OF = "2026-09-07";
export const text3 = (en: string, de: string, ka: string): LocalizedText => ({ en, de, ka });
export function date(value: string): ResearchDate {
  return { precision: value.length === 4 ? "year" : value.length === 7 ? "month" : "day", value };
}
export const unknown = <T>(): SourcedValue<T> => ({ status: "unknown", value: null, evidenceIds: [] });
export const known = <T>(value: T, id: string): SourcedValue<T> => ({ status: "known", value, evidenceIds: [id] });
