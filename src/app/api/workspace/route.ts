import { sameOrigin } from "@/lib/request-origin";
import { NextResponse } from "next/server";
import { z } from "zod";
import { identity, adminClient } from "@/lib/supabase/server";
import { publicRecords } from "@/lib/repository";
import { calculateFinance } from "@/lib/finance";
import { modelSchema } from "@/lib/model-schema";
import { checkSignature, validateFile } from "@/lib/uploads";
const kind = z.enum([
  "property",
  "concept",
  "claim",
  "source",
  "risk",
  "decision",
  "gate",
  "task",
  "contribution",
  "model",
  "document",
]);
const command = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    kind,
    title: z.string().min(1).max(300),
    body: z.record(z.string(), z.unknown()),
    rationale: z.string().min(8).max(3000),
    parent: z.string().nullable().default(null),
    baseVersion: z.number().int().nullable().default(null),
  }),
  z.object({
    action: z.literal("publish"),
    id: z.string(),
    version: z.number().int(),
    rationale: z.string().min(8),
  }),
  z.object({
    action: z.literal("task"),
    id: z.string(),
    version: z.number().int(),
    status: z.enum(["not_started", "in_progress", "blocked", "done"]),
    rationale: z.string().min(8),
  }),
  z.object({
    action: z.literal("assign"),
    id: z.string(),
    version: z.number().int(),
    userId: z.string().uuid().nullable(),
    rationale: z.string().min(8),
  }),
  z.object({
    action: z.literal("invite"),
    email: z.string().email(),
    role: z.enum(["admin", "contributor"]),
    revoke: z.boolean().default(false),
  }),
]);
export async function GET() {
  const { client, user, member } = await identity();
  const result = await publicRecords();
  let googleEnabled=false;
  if(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY){try{const settings=await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`,{headers:{apikey:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY},signal:AbortSignal.timeout(5000)}).then(r=>r.json());googleEnabled=settings.external?.google===true;}catch{/* Keep unavailable sign-in explicitly disabled. */}}
  if (!client || !member)
    return NextResponse.json({
      ...result,
      googleEnabled,
      user: user ? { id: user.id } : null,
      member: null,
      drafts: [],
      members: [],
    });
  const { data: drafts } = await client
    .from("records")
    .select("*")
    .eq("status", "draft")
    .limit(500);
  const { data: members } = await client.from("memberships").select("*");
  return NextResponse.json(
    {
      ...result,
      googleEnabled,
      user: { id: user!.id },
      member,
      drafts: drafts ?? [],
      members: members ?? [],
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 1_000_000)
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  const { client, member } = await identity();
  if (!client || !member)
    return NextResponse.json(
      {
        error:
          "Sign in with an invited account to save changes. Nothing was saved.",
      },
      { status: 401 },
    );
  try {
    const text = await request.text();
    if (text.length > 1_000_000) throw new Error("Request too large");
    const c = command.parse(JSON.parse(text));
    let result;
    if (c.action === "create") {
      if (c.kind === "model") {
        const input = modelSchema.parse(c.body.input),
          calculation = calculateFinance(input);
        if (calculation.status === "invalid")
          throw new Error(calculation.issues.join("; "));
        c.body = {
          input,
          result: calculation,
          engineVersion: "2.0.0",
          classification: "derived",
          limitations:
            "Conditional on explicit inputs; not validated project economics",
        };
      }
      if (c.kind === "document")
        throw new Error("Use the evidence upload flow");
      if (
        c.body.verification === "verified" &&
        (!member || member.role !== "admin")
      )
        throw new Error("Only administrators may confirm verification");
      result = await client.rpc("create_record", {
        p_id: crypto.randomUUID(),
        p_kind: c.kind,
        p_title: c.title,
        p_body: c.body,
        p_rationale: c.rationale,
        p_parent: c.parent,
        p_base_version: c.baseVersion,
      });
    } else if (c.action === "publish") {
      if (member.role !== "admin") throw new Error("Administrator required");
      const { data: record } = await client
        .from("records")
        .select("*")
        .eq("id", c.id)
        .single();
      if (record?.kind === "document") {
        const b = record.body;
        if (
          typeof b.path !== "string" ||
          !b.path.startsWith(`${record.author_id}/`)
        )
          throw new Error("Invalid upload ownership");
        const service = adminClient();
        const { data: file, error } = await service.storage
          .from("evidence")
          .download(b.path);
        if (error || !file) throw new Error("Uploaded file unavailable");
        const ext = validateFile(b.name, file.size, b.mime);
        checkSignature(new Uint8Array(await file.arrayBuffer()), ext);
        const { error: updateError } = await service
          .from("records")
          .update({ body: { ...b, fileChecked: true } })
          .eq("id", c.id)
          .eq("version", c.version);
        if (updateError) throw updateError;
      }
      result = await client.rpc("publish_record", {
        p_id: c.id,
        p_version: c.version,
        p_rationale: c.rationale,
      });
    } else if (c.action === "task")
      result = await client.rpc("update_task", {
        p_id: c.id,
        p_version: c.version,
        p_status: c.status,
        p_rationale: c.rationale,
      });
    else if (c.action === "assign")
      result = await client.rpc("assign_task", {
        p_id: c.id,
        p_version: c.version,
        p_user: c.userId,
        p_rationale: c.rationale,
      });
    else
      result = await client.rpc("manage_invitation", {
        p_email: c.email.toLowerCase(),
        p_role: c.role,
        p_revoke: c.revoke,
      });
    if (result.error) throw result.error;
    return NextResponse.json({ ok: true, record: result.data });
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : typeof e === "object" && e && "message" in e
          ? String(e.message)
          : "Could not save";
    return NextResponse.json(
      { error: message },
      { status: /conflict/i.test(message) ? 409 : 400 },
    );
  }
}
