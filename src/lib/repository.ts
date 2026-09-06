import "server-only";
import { seed } from "./workspace-data";
import { publicClient } from "./supabase/server";
import type { WorkspaceRecord, RecordKind } from "@/types/workspace";
export function seedRecords(): WorkspaceRecord[] {
  const collections: [RecordKind, readonly { id: string }[]][] = [
    ["property", seed.assets],
    ["concept", seed.concepts],
    ["source", seed.sources],
    ["claim", seed.claims],
    ["risk", seed.risks],
    ["task", seed.tasks],
    ["decision", seed.decisions],
    ["gate", seed.gates],
  ];
  return collections.flatMap(([kind, rows]) =>
    rows.map((row) => {
      const body = row as unknown as Record<string, unknown>;
      return {
        id: row.id,
        kind,
        title: String(body.title ?? body.name ?? row.id),
        body,
        status: "published",
        version: 1,
        author_id: null,
        assigned_to: null,
        updated_at: "2026-09-06T00:00:00Z",
        rationale:
          "Imported from dated project source; not independently verified",
      };
    }),
  );
}
export async function publicRecords(): Promise<{
  records: WorkspaceRecord[];
  mode: "live" | "snapshot";
  error: string | null;
}> {
  const client = publicClient();
  if (!client) return { records: seedRecords(), mode: "snapshot", error: null };
  try {
    const { data, error } = await client
      .from("records")
      .select("*")
      .eq("status", "published")
      .is("parent_id", null)
      .limit(2000);
    if (error) throw error;
    if (!data?.length) throw new Error("Workspace has not been seeded");
    return { records: data as WorkspaceRecord[], mode: "live", error: null };
  } catch {
    return {
      records: seedRecords(),
      mode: "snapshot",
      error:
        "Live service unavailable. Showing the dated source snapshot; saving is unavailable.",
    };
  }
}
