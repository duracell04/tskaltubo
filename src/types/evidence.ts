/** Precision is retained: a year must never become an invented January date. */
export type ResearchDate =
  | { precision: "year"; value: string }
  | { precision: "month"; value: string }
  | { precision: "day"; value: string };

export type EvidenceCategory =
  "official" | "market" | "field" | "assumption" | "derived" | "unknown";
export type EvidenceStatus =
  "current" | "historical" | "reported" | "unverified" | "unknown";

export interface Source {
  id: string;
  title: string;
  publisher: string | null;
  url: string | null;
  /** Repository-relative location of a retained document, if available. */
  documentPath: string | null;
  publishedAt: ResearchDate | null;
  accessedAt: ResearchDate | null;
}

interface EvidenceBase {
  id: string;
  category: EvidenceCategory;
  sourceIds: readonly string[];
  effectiveAt: ResearchDate | null;
  /** Page, section or other locator supporting the claim. */
  locator: string | null;
}

export type Evidence = EvidenceBase &
  (
    | {
        status: "current";
        verifiedAt: Extract<ResearchDate, { precision: "day" }>;
      }
    | {
        status: Exclude<EvidenceStatus, "current">;
        verifiedAt: ResearchDate | null;
      }
  );

/** Unknown is explicit; zero remains an actual measured or assumed value. */
export type SourcedValue<T> =
  | { status: "known"; value: T; evidenceIds: readonly [string, ...string[]] }
  | { status: "unknown"; value: null; evidenceIds: readonly string[] };
