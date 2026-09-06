# Deployment and free service setup

Target: Netlify Free hosting, Supabase Free database/auth/storage, Google OAuth. No paid upgrades, custom domain purchases, automatic recharge or outgoing invitations are required.

Public deployment: https://tskaltubo-partners.netlify.app. See [verification](verification.md) for deployment IDs, completed checks and the remaining Google OAuth dependency.

## Local setup

1. Install dependencies with Node 22.13+ (`npm ci`).
2. Copy `.env.example` to `.env.local` and fill the values from the **Tskaltubo** Supabase project. Never commit service-role credentials.
3. Apply `supabase/migrations` to the new project's database (`supabase link --project-ref <ref>` then `supabase db push`). For local development, Docker plus `supabase start` uses `supabase/config.toml`.
4. Run `npm run seed`. It inserts missing original-source records and preserves existing edits.
5. Configure Google OAuth in the Supabase project. Create a Google Web OAuth client, add the project's Supabase Auth callback URL, and store its client ID/secret in Supabase Auth provider settings. Set the authorized app origins and callbacks for local and hosted use. Do not put the OAuth secret in a browser environment variable.
6. Sign in once as the owner, then run `node --env-file=.env.local scripts/bootstrap-admin.mjs <verified-owner-email>`. This grants only the explicitly named verified account administrator access and sends no message.

## Netlify

Use the Free plan and default `netlify.app` hostname. `netlify.toml` configures the Next.js build and Node 22. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, server-only `SUPABASE_SERVICE_ROLE_KEY` and the final `NEXT_PUBLIC_SITE_URL` through Netlify environment settings. Netlify supports Next.js through its OpenNext adapter. Deploy a preview, verify it, then publish production.

Public environment variables are embedded at build time; rebuild after changing them. Service-role credentials are server-only and must never use a `NEXT_PUBLIC_` prefix. Configure the final production origin and exact callback allowlist in Supabase, including `/auth/callback` and the locale query variants. Disable any paid add-ons and automatic credit recharge. Keep projects on their free plans.

## Release checks

- `npm run check`, `npm test`, `npm run build`.
- `node scripts/verify-http.mjs <base-url>` checks all 33 locale/page combinations, 404s, public export and anonymous/origin mutation boundaries.
- Desktop/mobile browser verification of search, compare, case calculations, missing-input states and localized navigation.
- Google sign-in and invited-role recognition; revoked accounts cannot write.
- Contributor creates a draft and uploads a private file; anonymous readers cannot access either.
- Administrator reviews and publishes; all readers see the same published finding.
- A stale proposal fails with conflict; a gate without published evidence cannot be approved.
- Save/reload a model and verify it reproduces its input version and output; download published evidence.

No authentication or upload success should be claimed until those provider-backed flows have actually been exercised. The dated snapshot is intentionally usable before credentials exist.

## Recovery and limits

Keep database exports and evidence objects together in a private backup. The public export excludes private drafts and identity details. Use free provider dashboards to monitor usage. Free services can pause or exhaust quotas; the app displays a dated snapshot and does not pretend that offline writes succeeded. See [operations](workspace-operations.md) for publication and recovery details.

Quota snapshot checked 6 September 2026: [Netlify Free](https://www.netlify.com/pricing/) includes 300 credits/month; production deploys use 15 credits, compute 10 credits/GB-hour, bandwidth 20 credits/GB and requests 2 credits/10,000. Automatic recharge is disabled. [Supabase Free](https://supabase.com/pricing) includes a 500 MB database, 1 GB file storage, 5 GB egress plus 5 GB cached egress, and 50,000 monthly active users. Projects can pause after one week of inactivity; automatic backups are not included. Monitor actual dashboards because quotas can change. If hosting itself is paused, the in-app fallback cannot run: use the retained local source and exports until service resumes.

The storage project ceiling is 50 MiB; the application's private evidence bucket independently caps each file at 10 MB. Avoid changing storage settings through CLI versions that try to enable paid vector buckets. Preview config differences before pushing provider settings, especially after configuring Google OAuth.
