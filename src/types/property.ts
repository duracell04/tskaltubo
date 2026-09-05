import type { Locale } from "@/lib/constants";
import type { ResearchDate, SourcedValue } from "./evidence";

export interface SourceMoney {
  amount: number;
  currency: "GEL" | "EUR" | "CHF" | "USD";
}

export interface PropertyMedia {
  src: string;
  sourceId: string;
  attribution: string;
  license: string;
  capturedAt: ResearchDate | null;
}

export interface HistoricalPrice {
  kind: "asking" | "auction_reserve" | "transaction";
  price: SourcedValue<SourceMoney>;
  effectiveAt: ResearchDate | null;
}

/** Physical asset only: no preferred care model or financial assumptions. */
export interface Property {
  id: string;
  slug: string;
  canonicalName: string;
  alternativeNames: readonly string[];
  coordinates: SourcedValue<{ lat: number; lng: number }>;
  cadastralIds: SourcedValue<readonly string[]>;
  ownership: SourcedValue<{ kind: "state" | "private" | "mixed"; ownerName: string | null }>;
  plotAreaM2: SourcedValue<number>;
  grossBuildingAreaM2: SourcedValue<number>;
  usableBuildingAreaM2: SourcedValue<number>;
  condition: SourcedValue<"operational" | "requires_rehabilitation" | "ruin">;
  occupancy: SourcedValue<"vacant" | "occupied" | "partially_occupied">;
  historicalPrices: readonly HistoricalPrice[];
  media: readonly PropertyMedia[];
}

/** Narrative text references facts; it must not duplicate factual values. */
export interface PropertyNarrative {
  propertyId: string;
  locale: Locale;
  summary: string;
  legalStatus: string;
  building: string;
  possibleUses: string;
  mediaAlt: Readonly<Record<string, string>>;
  translationStatus: "draft" | "reviewed";
}
