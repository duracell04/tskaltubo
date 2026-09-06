export type Classification =
  "official" | "market_field" | "assumption" | "derived" | "unknown";
export type Verification =
  "unverified" | "verified" | "historical" | "contradicted";
export type RecordKind =
  | "property"
  | "concept"
  | "claim"
  | "source"
  | "risk"
  | "decision"
  | "gate"
  | "task"
  | "contribution"
  | "model"
  | "document";
export interface WorkspaceRecord {
  id: string;
  kind: RecordKind;
  title: string;
  body: Record<string, unknown>;
  status: "draft" | "published";
  version: number;
  author_id: string | null;
  updated_at: string;
  rationale: string;
  assigned_to: string | null;
}
export interface Membership {
  user_id: string;
  role: "admin" | "contributor";
  display_name: string;
  active: boolean;
}
