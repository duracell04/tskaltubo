# Partner workspace operations

The same published findings are available to anonymous visitors and signed-in partners. Drafts are publication workflow, not a separate substantive internal project narrative. Identity records and unpublished attachments are private.

## Roles and publication

Anonymous visitors can read, compare, calculate in their browser, and export published data. Contributors can create drafts and immutable model variants, upload evidence, and update tasks assigned to them. Administrators can assign tasks, authorize or revoke accounts, review drafts, and make explicit gate decisions. The application never sends invitation email or outreach messages.

Every write requires a rationale. PostgreSQL functions enforce permissions and version comparisons; direct client table mutations are denied. A proposed correction records its parent and base version. Publication rejects stale proposals rather than replacing newer information. Model inputs are immutable: load and edit a model to save another version.

Gate approval requires a published proposal with `status: "approved"` and `evidenceIds` referencing published evidence. This records an administrator's decision; it is not automated regulatory or clinical approval.

## Source discipline

The original audit is retained byte-for-byte under `research/sources/2026-09-06-integrated-audit.md`. Its SHA-256 is recorded in the generated dataset. Re-import with `npm run import:report`; the script asserts the expected number of sections, assets, concepts and gates. Only the initial import accepts an external source path. Changes to a retained source should be a new version, not a replacement of the original.

The initial 108 records are unverified report/strategy assertions. The report's citations are references, not a claim that their underlying documents were obtained or independently reviewed. Current title, transaction availability and coordinates remain unknown.

Published corrections overlay the current record in live views; the historical full report remains the original source. Source metadata should include publisher, URL or retained file, exact locator, publication/access/verification dates, and limitations. Only administrators confirm verification. A verified status must cite the dated evidence and how it was checked.

German and Georgian navigation, overview and concept summaries are localized. Research excerpts and detailed specialist forms remain English, with a visible draft-translation notice. Native review remains outstanding; the app does not claim professional translation.

## Attachments

The private `evidence` bucket allows PDF, PNG, JPEG, CSV, XLSX and XLS up to 10 MB. Browser uploads use short-lived signed upload tokens, avoiding host function body-size limits. The server checks ownership, actual size, MIME and file signature before publication. A client cannot set the trusted validation flag through the database function. Signature checking does not constitute a malware scan; files are delivered as attachments with `nosniff`, never executed or rendered as HTML.

An upload interrupted after metadata creation remains a private draft and fails publication until the file exists. To retry, upload a fresh record. Periodically remove abandoned upload drafts and orphan files using an administrator maintenance session after checking their ownership and publication status. No resident health records belong in this development workspace.

## Availability, exports and recovery

When services are absent or unavailable, the source snapshot is labeled with its date and saving is not presented as successful. Published records are fetched per request; there is no permanent build-time cache of collaborative changes.

`/api/export` downloads published structured records and the original report sections. Financial exports contain versioned input and calculated output; monthly CSV leaves unknown cells empty. Public exports intentionally omit accounts and private drafts.

For a full operational backup, export PostgreSQL with the Supabase CLI/database tools and download the private evidence bucket separately. Store backups privately; database backups contain account IDs and unpublished material. Restore migrations first, then records/revisions/memberships and objects, preserving record IDs and object paths. Re-test row-level access and sample published downloads. The original repo seed is a recovery baseline, not a backup of collaborator changes.

Monitor provider usage and outages through free dashboards. Do not enable paid upgrades or automatic recharge. Free-tier quota exhaustion can make live collaboration unavailable; the snapshot fallback is dated and does not imply that later records were lost or successfully saved.
