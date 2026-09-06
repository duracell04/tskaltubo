import { publicRecords } from "@/lib/repository";
import { seed } from "@/lib/workspace-data";
export async function GET() {
  const data = await publicRecords();
  return Response.json(
    {
      exportedAt: new Date().toISOString(),
      ...data,
      sourceDate: seed.asOf,
      reportSha256: seed.reportSha256,
      sections: seed.sections,
    },
    {
      headers: {
        "Content-Disposition":
          'attachment; filename="tskaltubo-public-workspace.json"',
        "Cache-Control": "no-store",
      },
    },
  );
}
