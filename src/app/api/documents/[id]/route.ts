import { NextResponse } from "next/server";
import { adminClient, publicClient } from "@/lib/supabase/server";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params,
    client = publicClient();
  if (!client)
    return NextResponse.json(
      { error: "Documents unavailable" },
      { status: 503 },
    );
  const { data: r } = await client
    .from("records")
    .select("*")
    .eq("id", id)
    .eq("kind", "document")
    .eq("status", "published")
    .single();
  if (!r || r.body.fileChecked !== true)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const { data, error } = await adminClient()
      .storage.from("evidence")
      .download(r.body.path);
    if (error || !data) throw error;
    return new Response(data, {
      headers: {
        "Content-Type": r.body.mime,
        "Content-Disposition": `attachment; filename="${String(r.body.name).replace(/[^a-zA-Z0-9._-]/g, "_")}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "File unavailable" }, { status: 503 });
  }
}
