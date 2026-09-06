# Verification and rollout record

Implementation verification, 6 September 2026.

- TypeScript and ESLint pass.
- 30 automated tests pass: source integrity/counts; report arithmetic; monthly timing, staffing, FX, debt, tax, deposits, consolidation and IRR; actual PostgreSQL permissions, invitations, revisions, gate decisions and upload validation.
- HTTP verification passes all 33 locale/page combinations, three invalid-route cases, public export, anonymous mutation denial and cross-origin denial.
- Desktop browser confirms the overview and financial lab. Base and conservative calculations update to the expected figures. Mobile property view contains all 11 assets without horizontal page overflow. Live workspace renders without a framework error overlay.
- Live Supabase integration verifies 18 boundaries: uninvited denial, administrator authorization, verified invitation acceptance, draft creation/privacy, contributor publication denial, administrator publication, public visibility, stale conflict, saved-model reproducibility, signed upload, private attachment denial, validated publication/download, revocation and immediate denied writes.
- Temporary live test accounts, records and evidence objects were removed after verification. No partner invitations or messages were sent.

## Provisioned services

- Supabase organization: **Tskaltubo**, ID `crgogymergycymwqjqna`, created on the default free plan.
- Project: **tskaltubo**, ref `dszvyujjfvwjlohslupg`, region `eu-central-2`.
- Both migrations applied; all 108 initial records seeded. Keys/password are in ignored `.env.local`, never committed.
- Dashboard: https://supabase.com/dashboard/project/dszvyujjfvwjlohslupg
- Netlify production: https://tskaltubo-partners.netlify.app. Site `20513c03-5014-4dbb-8933-6b15dac15ef5`, published deployment `6a9d577031ed740650154d8d`.
- Netlify account API confirmed Free (`credit-free`), automatic top-ups disabled and no payment method. Only this project's default visitor login wall was disabled to allow public reading.
- Production passed the 33-route HTTP suite and all 18 live contribution/publication checks. Test identities and files were removed. The hosted financial lab was also checked in the browser.
- Hosted Georgian property view verified at 390 × 844: all 11 cards, no horizontal page overflow or framework error overlay. Hosted conservative screening revenue updates correctly. Scanned 41 public build assets: no service-role key present. ESLint excludes generated Netlify bundles and passes after deployment.
- Supabase production site URL and local/production OAuth callback allowlist configured. Email confirmation and TOTP defaults preserved. The private evidence bucket enforces 10 MB; the project-wide storage ceiling remains 50 MiB because the CLI's attempt to change it returned a paid-vector-bucket error. No upgrade was made.

## Remaining external dependencies

- Google OAuth is disabled in the new Supabase project until a Google Web OAuth client is configured. Supabase callback: `https://dszvyujjfvwjlohslupg.supabase.co/auth/v1/callback`.
- The sponsor must sign in through Google once before the explicit administrator bootstrap can bind that verified identity.
- Actual Google OAuth sign-in remains a release check. The successful live permission tests used temporary test identities, not a completed Google OAuth journey. The public workspace is published; real collaborator onboarding remains pending.
- Native review of German/Georgian draft translations and independent verification of historical project claims remain project diligence, not fabricated completed work.
