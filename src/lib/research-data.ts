import seed from "@/data/research.json";
export { seed };
export const projectName = "Tskaltubo Senior Living & Care Development";
export const germanTitle =
  "Tskaltubo: Entwicklung eines deutschsprachigen Angebots für Seniorenwohnen, Langzeitpflege und Rehabilitation";
export const expertiseLabels: Record<string, string> = {
  operating: "Operating & quality",
  clinical: "Clinical & workforce",
  real_estate: "Real estate",
  engineering: "Engineering & construction",
  legal: "Legal & regulatory",
  demand: "Demand & referrals",
  financing: "Financing & tax",
};

import type { ResearchRecord, RecordKind } from "@/types/research";
export function researchRecords(): ResearchRecord[] {
  const collections: [RecordKind, readonly { id: string }[]][] = [
    ["property", seed.assets],
    ["concept", seed.concepts],
    ["source", seed.sources],
    ["claim", seed.claims],
    ["risk", seed.risks],
    ["question", seed.decisions],
    ["topic", seed.tasks],
  ];
  return collections.flatMap(([kind, rows]) =>
    rows.map((row) => {
      const body = row as unknown as Record<string, unknown>;
      return {
        id: row.id,
        kind,
        title: String(body.title ?? body.name ?? row.id),
        body,
      };
    }),
  );
}
