import { sameOrigin } from "@/lib/request-origin";
import { NextResponse } from "next/server";
import { z } from "zod";
import { identity } from "@/lib/supabase/server";
import { validateFile } from "@/lib/uploads";
const schema = z.object({
  name: z.string().min(1).max(180),
  mime: z.string(),
  size: z.number().int(),
  title: z.string().min(1).max(300),
  rationale: z.string().min(8).max(3000),
  issueId: z.string().max(180),
});
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const { client, user, member } = await identity();
  if (!client || !user || !member)
    return NextResponse.json(
      { error: "Invited account required; nothing uploaded" },
      { status: 401 },
    );
  try {
    const b = schema.parse(await req.json()),
      ext = validateFile(b.name, b.size, b.mime),
      id = crypto.randomUUID(),
      path = `${user.id}/${id}.${ext}`;
    const { data, error } = await client.storage
      .from("evidence")
      .createSignedUploadUrl(path);
    if (error) throw error;
    const { error: recordError } = await client.rpc("create_record", {
      p_id: id,
      p_kind: "document",
      p_title: b.title,
      p_body: {
        path,
        name: b.name,
        mime: b.mime,
        size: b.size,
        issueId: b.issueId,
        classification: "market_field",
        verification: "unverified",
      },
      p_rationale: b.rationale,
    });
    if (recordError) throw recordError;
    return NextResponse.json({ id, path, token: data.token });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Upload initialization failed",
      },
      { status: 400 },
    );
  }
}
