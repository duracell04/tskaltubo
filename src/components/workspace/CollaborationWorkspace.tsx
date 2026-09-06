"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LogIn, Upload, Send, CheckCircle2 } from "lucide-react";
import type { Locale } from "@/lib/constants";
import type { WorkspaceRecord, Membership } from "@/types/workspace";
import { browserClient } from "@/lib/supabase/browser";
import { validateFile, uploadTypes } from "@/lib/uploads";
import { expertiseLabels } from "@/lib/workspace-data";
type State = {
  records: WorkspaceRecord[];
  drafts: WorkspaceRecord[];
  member: Membership | null;
  members: Membership[];
  mode: string;
  googleEnabled:boolean;
};
export function CollaborationWorkspace({
  locale,
  initialRecords,
  issueId,
}: {
  locale: Locale;
  initialRecords: WorkspaceRecord[];
  issueId: string;
}) {
  const [state, setState] = useState<State>({
      records: initialRecords,
      drafts: [],
      member: null,
      members: [],
      mode: "snapshot",
      googleEnabled:false,
    }),
    [issue, setIssue] = useState(issueId),
    [title, setTitle] = useState(""),
    [note, setNote] = useState(""),
    [expertise, setExpertise] = useState("operating"),
    [url, setUrl] = useState(""),
    [type, setType] = useState("expertise"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [file, setFile] = useState<File | null>(null),
    [email, setEmail] = useState(""),
    [inviteRole, setInviteRole] = useState("contributor"),
    [revision, setRevision] = useState<WorkspaceRecord | null>(null),
    [body, setBody] = useState(""),
    [rationale, setRationale] = useState("");
  const refresh = async () => {
    const r = await fetch("/api/workspace", { cache: "no-store" });
    if (!r.ok) throw new Error("Workspace connection failed");
    setState(await r.json());
  };
  useEffect(() => {
    let live = true;
    fetch("/api/workspace", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (live) setState(d);
      })
      .catch(() => {
        if (live)
          setMessage(
            "Live workspace unavailable. The public source snapshot remains readable.",
          );
      });
    return () => {
      live = false;
    };
  }, []);
  async function command(data: unknown) {
    setBusy(true);
    setMessage("Saving…");
    try {
      const response = await fetch("/api/workspace", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
        r = await response.json();
      if (!response.ok) throw new Error(r.error);
      await refresh();
      setMessage(
        "Saved. Publication and gate approval remain separate administrator decisions.",
      );
      return true;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Nothing saved");
      return false;
    } finally {
      setBusy(false);
    }
  }
  const signIn = async () => {
    if(!state.googleEnabled){setMessage('Google sign-in is awaiting provider activation. Public exploration remains available; no account changes were made.');return;}
    const c = browserClient();
    if (!c) {
      setMessage(
        "Authentication is not connected. The dated public workspace is available; nothing can be saved yet.",
      );
      return;
    }
    const { error } = await c.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?locale=${locale}`,
      },
    });
    if (error) setMessage(error.message);
  };
  const upload = async () => {
    if (!file) return;
    setBusy(true);
    setMessage("Preparing private evidence upload…");
    try {
      const mime =
        file.type ||
        uploadTypes[file.name.split(".").pop()?.toLowerCase() ?? ""] ||
        "";
      validateFile(file.name, file.size, mime);
      const r = await fetch("/api/uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            mime,
            size: file.size,
            title: title || file.name,
            rationale: note,
            issueId: issue,
          }),
        }),
        d = await r.json();
      if (!r.ok) throw new Error(d.error);
      const c = browserClient();
      if (!c) throw new Error("Storage unavailable");
      const { error } = await c.storage
        .from("evidence")
        .uploadToSignedUrl(d.path, d.token, file, { contentType: mime });
      if (error) throw error;
      await refresh();
      setMessage(
        "Uploaded privately for publication review. The file is not publicly accessible yet.",
      );
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Upload failed; no file published",
      );
    } finally {
      setBusy(false);
    }
  };
  const canEdit = Boolean(state.member) && state.mode === "live",
    admin = state.member?.role === "admin";
  return (
    <>
      <section className="panel auth-panel">
        <div>
          <h2>
            {state.member
              ? `Welcome, ${state.member.display_name}`
              : "Contribute to a specific open question"}
          </h2>
          <p>
            {state.member
              ? `Your role: ${state.member.role}. All readers see the same published project findings.`
              : "Public access needs no account. Invited collaborators can submit evidence, save scenarios and update assigned work."}
          </p>
        </div>
        {state.member ? (
          <button
            className="button secondary"
            onClick={async () => {
              await browserClient()?.auth.signOut();
              await refresh();
            }}
          >
            Sign out
          </button>
        ) : (
          <button className="button" onClick={signIn}>
            <LogIn size={17} />
            Sign in with Google
          </button>
        )}
      </section>
      {state.mode === "snapshot" && (
        <div className="notice">
          Read-only source snapshot. Account, database and storage services are
          not connected or available. Saving controls stay disabled; no success
          is simulated.
        </div>
      )}
      <p role="status" className="operation-status">
        {message}
      </p>
      <div className="workspace-columns">
        <section className="panel">
          <h2>Your contribution</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await command({
                action: "create",
                kind: "contribution",
                title,
                body: {
                  issueId: issue,
                  type,
                  expertise,
                  note,
                  url,
                  classification: "market_field",
                  verification: "unverified",
                },
                rationale: note,
              });
            }}
          >
            <fieldset disabled={!canEdit || busy}>
              <label>
                Related question or asset
                <select
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                >
                  <option value="">General project contribution</option>
                  {state.records
                    .filter((r) =>
                      [
                        "task",
                        "risk",
                        "decision",
                        "gate",
                        "property",
                        "concept",
                      ].includes(r.kind),
                    )
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.kind.toUpperCase()} · {r.title}
                      </option>
                    ))}
                </select>
              </label>
              <div className="input-grid">
                <label>
                  Contribution type
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="expertise">
                      Expertise / capacity / interest
                    </option>
                    <option value="evidence">Evidence or field finding</option>
                    <option value="correction">
                      Correction or negative finding
                    </option>
                  </select>
                </label>
                <label>
                  Capability
                  <select
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                  >
                    {Object.entries(expertiseLabels).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Title
                <input
                  required
                  maxLength={300}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label>
                Finding, offer of expertise, and limitations
                <textarea
                  required
                  minLength={8}
                  rows={5}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              <label>
                Source URL (optional)
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </label>
              <button type="submit" className="button">
                <Send size={15} />
                Submit for publication review
              </button>
              <hr />
              <h3>Attach supporting evidence</h3>
              <p className="small muted">
                PDF, PNG, JPEG, CSV, XLSX or XLS · maximum 10 MB. Use project
                evidence, not resident health records.
              </p>
              <input
                aria-label="Evidence file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                className="button secondary"
                disabled={!file || note.length < 8}
                onClick={upload}
              >
                <Upload size={16} />
                Upload privately for review
              </button>
            </fieldset>
          </form>
        </section>
        <section className="panel">
          <h2>Assigned work</h2>
          {state.records
            .filter(
              (r) =>
                r.kind === "task" &&
                (admin || r.assigned_to === state.member?.user_id),
            )
            .map((r) => (
              <div className="task-control" key={r.id}>
                <h3>{r.title}</h3>
                <p className="small muted">
                  Version {r.version} ·{" "}
                  {String(r.body.status).replaceAll("_", " ")}
                </p>
                <label>
                  Update rationale
                  <input
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                  />
                </label>
                <select
                  aria-label={`Status: ${r.title}`}
                  disabled={!canEdit || busy || rationale.length < 8}
                  value={String(r.body.status)}
                  onChange={(e) =>
                    command({
                      action: "task",
                      id: r.id,
                      version: r.version,
                      status: e.target.value,
                      rationale,
                    })
                  }
                >
                  {["not_started", "in_progress", "blocked", "done"].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s.replaceAll("_", " ")}
                      </option>
                    ),
                  )}
                </select>
                {admin && (
                  <label>
                    Assign collaborator
                    <select
                      disabled={busy || rationale.length < 8}
                      value={r.assigned_to ?? ""}
                      onChange={(e) =>
                        command({
                          action: "assign",
                          id: r.id,
                          version: r.version,
                          userId: e.target.value || null,
                          rationale,
                        })
                      }
                    >
                      <option value="">Unassigned</option>
                      {state.members
                        .filter((m) => m.active)
                        .map((m) => (
                          <option value={m.user_id} key={m.user_id}>
                            {m.display_name} · {m.user_id.slice(0, 8)}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
              </div>
            ))}
          {!state.records.some(
            (r) =>
              r.kind === "task" &&
              (admin || r.assigned_to === state.member?.user_id),
          ) && (
            <p className="muted">
              No assigned work is visible for this account. Explore the
              diligence programme and identify where you can contribute.
            </p>
          )}
          <Link href={`/${locale}/diligence`}>Explore open work →</Link>
        </section>
      </div>
      <section className="panel">
        <h2>Published partner contributions</h2>
        {state.records
          .filter((r) => r.kind === "contribution")
          .map((r) => (
            <article className="issue" key={r.id}>
              <h3>{r.title}</h3>
              <p>{String(r.body.note ?? "")}</p>
              <p className="small muted">
                {String(r.body.expertise ?? "")} · Related issue:{" "}
                {String(r.body.issueId ?? "General")}
              </p>
            </article>
          ))}
        {!state.records.some((r) => r.kind === "contribution") && (
          <p>
            No partner contributions have been published yet. The project does
            not imply existing commitments, referrals or capital.
          </p>
        )}
      </section>
      {canEdit && (
        <section className="panel">
          <h2>Propose a correction</h2>
          <p>
            Corrections create a new draft against the current version. They
            never overwrite a published record directly.
          </p>
          <label>
            Published record
            <select
              value={revision?.id ?? ""}
              onChange={(e) => {
                const r =
                  state.records.find((x) => x.id === e.target.value) ?? null;
                setRevision(r);
                setBody(r ? JSON.stringify(r.body, null, 2) : "");
              }}
            >
              <option value="">Select a record</option>
              {state.records
                .filter((r) => r.kind !== "model")
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.kind} · {r.title}
                  </option>
                ))}
            </select>
          </label>
          {revision && (
            <>
              <label>
                Structured record
                <textarea
                  className="code-editor"
                  rows={12}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </label>
              <label>
                Change rationale
                <input
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                />
              </label>
              <button
                className="button"
                disabled={busy || rationale.length < 8}
                onClick={() => {
                  try {
                    command({
                      action: "create",
                      kind: revision.kind,
                      title: revision.title,
                      body: JSON.parse(body),
                      parent: revision.id,
                      baseVersion: revision.version,
                      rationale,
                    });
                  } catch {
                    setMessage("Invalid JSON; no correction submitted.");
                  }
                }}
              >
                Submit proposed revision
              </button>
              {revision.kind === "gate" && (
                <p className="small">
                  To approve a gate, an administrator must publish a proposal
                  with status “approved” and a nonempty evidenceIds list
                  referencing published source, claim or document records.
                </p>
              )}
            </>
          )}
        </section>
      )}
      {canEdit && (
        <section className="panel">
          <h2>{admin ? "Publication review" : "Your drafts"}</h2>
          {state.drafts.map((r) => (
            <article className="issue" key={r.id}>
              <span className="tag">
                {r.kind} · draft v{r.version}
              </span>
              <h3>{r.title}</h3>
              <p>{r.rationale}</p>
              <details>
                <summary>Inspect submitted information</summary>
                <pre>{JSON.stringify(r.body, null, 2)}</pre>
              </details>
              {admin && (
                <>
                  <label>
                    Publication decision rationale
                    <input
                      value={rationale}
                      onChange={(e) => setRationale(e.target.value)}
                    />
                  </label>
                  <button
                    className="button"
                    disabled={busy || rationale.length < 8}
                    onClick={() =>
                      command({
                        action: "publish",
                        id: r.id,
                        version: r.version,
                        rationale,
                      })
                    }
                  >
                    <CheckCircle2 size={16} />
                    Publish this revision
                  </button>
                </>
              )}
            </article>
          ))}
          {!state.drafts.length && <p>No pending drafts.</p>}
        </section>
      )}
      {admin && (
        <section className="panel">
          <h2>Manage collaborator access</h2>
          <p>
            Create or revoke access for a verified Google email. This control
            sends no email or message.
          </p>
          <div className="toolbar">
            <label>
              Google account email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Role
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                <option value="contributor">Contributor</option>
                <option value="admin">Administrator</option>
              </select>
            </label>
            <button
              className="button"
              disabled={busy || !email}
              onClick={() =>
                command({
                  action: "invite",
                  email,
                  role: inviteRole,
                  revoke: false,
                })
              }
            >
              Authorize account
            </button>
            <button
              className="button secondary"
              disabled={busy || !email}
              onClick={() =>
                command({
                  action: "invite",
                  email,
                  role: inviteRole,
                  revoke: true,
                })
              }
            >
              Revoke account
            </button>
          </div>
        </section>
      )}
    </>
  );
}
