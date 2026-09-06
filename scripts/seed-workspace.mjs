import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
  key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key)
  throw new Error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY through the environment. Never pass secrets as arguments.",
  );
const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  }),
  seed = JSON.parse(fs.readFileSync("src/data/workspace.json", "utf8"));
const groups = {
  assets: "property",
  concepts: "concept",
  sources: "source",
  claims: "claim",
  risks: "risk",
  tasks: "task",
  decisions: "decision",
  gates: "gate",
};
for (const [collection, kind] of Object.entries(groups)) {
  const records = seed[collection].map((body) => ({
    id: body.id,
    kind,
    title: body.title ?? body.name ?? body.id,
    body,
    status: "published",
    version: 1,
    rationale:
      "Dated source import. Assertions have not been independently verified.",
    updated_at: "2026-09-06T00:00:00Z",
  }));
  const { error } = await db
    .from("records")
    .upsert(records, { onConflict: "id", ignoreDuplicates: true });
  if (error) throw error;
  console.log(
    `${collection}: ${records.length} seed records ensured; existing records preserved`,
  );
}
console.log(
  "Seed complete. Existing edits and model versions were not overwritten.",
);
