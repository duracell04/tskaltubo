export type RecordKind =
  "property" | "concept" | "claim" | "source" | "risk" | "question" | "topic";
export interface ResearchRecord {
  id: string;
  kind: RecordKind;
  title: string;
  body: Record<string, unknown>;
}
