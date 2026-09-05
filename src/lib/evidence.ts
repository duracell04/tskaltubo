import type { Evidence, Source } from "@/types/evidence";

/** Unresolved IDs stay absent; they never become fabricated source records. */
export function resolveSources(evidence: Evidence, sources: readonly Source[]) {
  return evidence.sourceIds.map((id) => ({
    id,
    source: sources.find((source) => source.id === id) ?? null,
  }));
}
