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
  scope: LocalizedText;
  taxTreatment: "unknown" | "excluding_vat" | "including_vat";
}

export type LocalizedText = Readonly<Record<Locale, string>>;
export type DevelopmentStage = "announced" | "preparation" | "construction" | "requires_rehabilitation" | "completed";
export type AvailabilityKind = "live_auction" | "private_sale" | "historical_offer" | "inquiry_required" | "unknown";
export interface PropertyEvent {
  id: string;
  kind: "ownership" | "development" | "offer" | "forecast";
  at: ResearchDate | null;
  evidenceIds: readonly string[];
  description: LocalizedText;
}
export interface DevelopmentObligation {
  evidenceIds: readonly string[];
  effectiveAt: ResearchDate | null;
  minimumInvestment: SourceMoney | null;
  investmentComparison: "at_least" | "more_than";
  capacity: { value: number; unit: "rooms" | "beds" | "people" } | null;
  requiredUse: LocalizedText;
  deadline: LocalizedText | null;
  conditions: LocalizedText | null;
  taxTreatment: "unknown" | "excluding_vat" | "including_vat";
}
export interface PropertyQuestion {
  id: string;
  question: LocalizedText;
  action: LocalizedText;
  evidenceIds: readonly string[];
}

/** Physical asset only: no preferred care model or financial assumptions. */
export interface Property {
  id: string;
  slug: string;
  canonicalName: string;
  georgianName: string;
  identityEvidenceIds: readonly string[];
  assetType: "sanatorium" | "hotel" | "military_complex";
  address: SourcedValue<LocalizedText>;
  alternativeNames: readonly string[];
  coordinates: SourcedValue<{ lat: number; lng: number }>;
  cadastralIds: SourcedValue<readonly string[]>;
  ownership: SourcedValue<{ kind: "state" | "private" | "mixed"; ownerName: string | null }>;
  ownershipVerification: "registry_verified" | "official_historical" | "reported" | "unknown";
  roles: readonly { role: "historical_buyer" | "reported_owner" | "developer" | "operator" | "shareholder"; name: string; evidenceIds: readonly string[] }[];
  development: SourcedValue<DevelopmentStage>;
  operatingStatus: SourcedValue<"operating" | "partially_operating" | "not_operating">;
  observedScope: LocalizedText | null;
  availability: { kind: AvailabilityKind; evidenceIds: readonly string[]; confirmedAt: ResearchDate | null; validUntil: ResearchDate | null; authorizedParty: string | null };
  memberships: readonly { portfolioId: string; evidenceIds: readonly string[]; at: ResearchDate }[];
  obligations: readonly DevelopmentObligation[];
  events: readonly PropertyEvent[];
  questions: readonly PropertyQuestion[];
  inquiryRoute: "nasp" | "registry_then_owner";
  plotAreaM2: SourcedValue<number>;
  grossBuildingAreaM2: SourcedValue<number>;
  usableBuildingAreaM2: SourcedValue<number>;
  condition: SourcedValue<"operational" | "requires_rehabilitation" | "ruin">;
  occupancy: SourcedValue<"vacant" | "occupied" | "partially_occupied">;
  historicalPrices: readonly HistoricalPrice[];
  media: readonly PropertyMedia[];
}

export interface PropertyNews {
  id: string;
  propertyIds: readonly string[];
  sourceId: string;
  publishedAt: ResearchDate;
  eventAt: ResearchDate | null;
  title: LocalizedText;
  summary: LocalizedText;
  evidenceIds: readonly string[];
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
