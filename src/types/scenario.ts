import type { Locale } from "@/lib/constants";
import type { AnnualInput } from "./annual-finance";

export type ServiceModel =
  | "independent_living"
  | "assisted_living"
  | "long_term_nursing"
  | "dementia_care"
  | "rehabilitation"
  | "health_resort";

export interface TargetMarket {
  id: string;
  regions: readonly string[];
  residentLanguages: readonly string[];
}

export interface BusinessConcept {
  id: string;
  serviceModels: readonly ServiceModel[];
  targetMarketIds: readonly string[];
}

export interface Scenario {
  id: string;
  conceptId: string;
  /** A scenario can exist independently of a property. */
  propertyId: string | null;
  assumptions: AnnualInput;
}

export interface ConceptNarrative {
  conceptId: string;
  locale: Locale;
  title: string;
  description: string;
  buildingRequirements: string;
  regulatoryQuestions: string;
}
