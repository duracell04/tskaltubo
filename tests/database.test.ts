import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, it, expect } from "vitest";
let db: PGlite;
const admin = "00000000-0000-4000-8000-000000000001",
  member = "00000000-0000-4000-8000-000000000002",
  outsider = "00000000-0000-4000-8000-000000000003";
async function asUser(id: string | null, role = "authenticated") {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
    id ?? "",
  ]);
  await db.exec(`set role ${role}`);
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`,
  );
  await db.exec(
    readFileSync("supabase/migrations/202609060001_workspace.sql", "utf8"),
  );
  await db.query(
    "insert into auth.users values($1,'admin@example.test',now()),($2,'member@example.test',now()),($3,'outsider@example.test',now())",
    [admin, member, outsider],
  );
  await db.query(
    "insert into memberships(user_id,role) values($1,'admin'),($2,'contributor')",
    [admin, member],
  );
  await db.exec(
    "insert into records(id,kind,title,body,status,rationale) values('task-1','task','Inspect title','{\"status\":\"not_started\"}','published','Seed source record'),('gate-0','gate','Product gate','{\"status\":\"not_approved\"}','published','Seed source record'),('source-1','source','Published source','{}','published','Seed source record');",
  );
});
afterAll(async () => {
  await db.close();
});
it("anonymous users see published content and cannot write", async () => {
  await asUser(null, "anon");
  expect((await db.query("select * from records")).rows).toHaveLength(3);
  await expect(
    db.exec(
      "insert into records(id,kind,title,rationale) values('bad','claim','Bad','Not authorized')",
    ),
  ).rejects.toThrow();
});
it("signed-in outsiders cannot create records", async () => {
  await asUser(outsider);
  await expect(
    db.query("select create_record('bad','claim','Bad','{}','Not authorized')"),
  ).rejects.toThrow(/Invitation/);
});
it("contributors create private drafts; other readers cannot see them", async () => {
  await asUser(member);
  await db.query(
    "select create_record('draft-1','contribution','Field observation','{}','Observed in person')",
  );
  expect(
    (await db.query("select * from records where id='draft-1'")).rows,
  ).toHaveLength(1);
  await asUser(null, "anon");
  expect(
    (await db.query("select * from records where id='draft-1'")).rows,
  ).toHaveLength(0);
});
it("contributors cannot publish, assign or alter another task", async () => {
  await asUser(member);
  await expect(
    db.exec("select publish_record('draft-1',1,'Review complete')"),
  ).rejects.toThrow(/Administrator/);
  await expect(
    db.exec("select update_task('task-1',1,'done','Inspection complete')"),
  ).rejects.toThrow(/Assigned/);
  await expect(
    db.query("select assign_task('task-1',1,$1,'Assign expert')", [member]),
  ).rejects.toThrow(/Administrator/);
});
it("assigned task updates enforce optimistic concurrency", async () => {
  await asUser(admin);
  await db.query("select assign_task('task-1',1,$1,'Assign expert')", [member]);
  await asUser(member);
  await db.exec(
    "select update_task('task-1',2,'in_progress','Inspection scheduled')",
  );
  await expect(
    db.exec("select update_task('task-1',2,'done','Stale update attempt')"),
  ).rejects.toThrow(/conflict/);
});
it("gate publication requires administrator decision and published evidence", async () => {
  await asUser(admin);
  await db.exec(
    "select create_record('gate-draft','gate','Product gate','{\"status\":\"approved\"}','Decision proposal','gate-0',1)",
  );
  await expect(
    db.exec("select publish_record('gate-draft',1,'Approve the gate')"),
  ).rejects.toThrow(/evidence/);
  await db.exec(
    "select create_record('gate-valid','gate','Product gate','{\"status\":\"approved\",\"evidenceIds\":[\"source-1\"]}','Evidence reviewed','gate-0',1)",
  );
  await db.exec(
    "select publish_record('gate-valid',1,'Explicit sponsor decision')",
  );
  const r = await db.query<{ body: { status: string } }>(
    "select body from records where id='gate-0'",
  );
  expect(r.rows[0]!.body.status).toBe("approved");
  await expect(
    db.exec("select publish_record('gate-draft',1,'Stale gate proposal')"),
  ).rejects.toThrow();
});
it("file validation marker cannot be forged through client RPC", async () => {
  await asUser(member);
  await db.exec(
    "select create_record('file-1','document','Uploaded file','{\"fileChecked\":true}','Evidence uploaded')",
  );
  const r = await db.query<{ body: Record<string, unknown> }>(
    "select body from records where id='file-1'",
  );
  expect(r.rows[0]!.body.fileChecked).toBeUndefined();
  await asUser(admin);
  await expect(
    db.exec("select publish_record('file-1',1,'Reviewed evidence file')"),
  ).rejects.toThrow(/validation/);
});
it("verified identity matching governs invitations and revocation", async () => {
  await asUser(admin);
  await db.exec(
    "select manage_invitation('outsider@example.test','contributor',false)",
  );
  await asUser(member);
  expect(
    (
      await db.query<{ accept_invitation: boolean }>(
        "select accept_invitation()",
      )
    ).rows[0]!.accept_invitation,
  ).toBe(false);
  await asUser(outsider);
  expect(
    (
      await db.query<{ accept_invitation: boolean }>(
        "select accept_invitation()",
      )
    ).rows[0]!.accept_invitation,
  ).toBe(true);
  await asUser(admin);
  await db.exec(
    "select manage_invitation('outsider@example.test','contributor',true)",
  );
  await asUser(outsider);
  await expect(
    db.exec(
      "select create_record('revoked','contribution','New','{}','Revoked identity')",
    ),
  ).rejects.toThrow(/Invitation/);
});
it("administrator publication creates auditable revisions", async () => {
  await asUser(admin);
  await db.exec("select publish_record('draft-1',1,'Publish field evidence')");
  const r = await db.query("select * from revisions where record_id='draft-1'");
  expect(r.rows).toHaveLength(2);
  await asUser(null, "anon");
  expect(
    (await db.query("select * from records where id='draft-1'")).rows,
  ).toHaveLength(1);
});
