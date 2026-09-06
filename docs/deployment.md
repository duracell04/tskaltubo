# Static deployment and rollback

Production: https://tskaltubo-partners.netlify.app
Netlify site: `20513c03-5014-4dbb-8933-6b15dac15ef5`.

## Build without services

Use a clean Git checkout, Node 22.13+, `npm ci`, then `npm run check`, `npm test`, and `npm run build`. Do not copy `.env` files. Next.js exports all pages into `out/`; there are no runtime functions or API routes. `npm start` is a local static verification server only. Any static host can serve `out/`, with equivalent redirects and a 404 page.

Netlify uses `publish = "out"` and skips its Next runtime adapter. Deploy the already-built directory from the exact committed revision using the authenticated Netlify CLI with `--dir out --no-build --skip-functions-cache`. Verify the preview before promoting it to production. Record the commit and deploy ID in the deployment message. Verify 57 routes, legacy reading redirects, removed endpoints and browser calculations after deployment.

Main routes are the same in DE/EN/KA. Legacy `/workspace` redirects to the locale overview; `/diligence` redirects to Evidence & risks. `/api/*` and authentication routes return 404. The root directs visitors to English; all locale links remain available.

## Credentials and services

The application needs no private or public environment variables. Remove obsolete app variables from this Netlify site only after the static replacement passes production verification. Leave the old Supabase project/data and ignored local credentials untouched pending separate cleanup. Do not add OAuth, functions, storage or paid upgrades.

## Limits and recovery

Netlify Free was confirmed with automatic recharge disabled. The 6 September 2026 [pricing snapshot](https://www.netlify.com/pricing/) lists 300 credits/month, production deploys at 15 credits, bandwidth at 20 credits/GB and requests at 2 credits/10,000. Check the dashboard for current usage; reaching the free quota may pause hosting. No backend usage remains.

Repository data and source files are the authoritative backup. Rebuild any committed revision and deploy its static output to restore or move hosts. The original report hash is checked by tests. There are no visitor calculations to restore because edits are intentionally transient. For an immediate rollback, promote the preceding verified static deploy in Netlify. The full platform archive is for code reference, not the default production rollback target.

Before the first static deployment, move any old `.netlify` runtime cache out of the repository root into an ignored archive. Netlify CLI can discover parent-directory cached function manifests even when deploying a clean Git worktree. Verify that removed API/auth URLs return 404 on the actual preview; an empty `required_functions` upload list alone does not prove that no cached functions were included. Do not promote a preview that retains old runtime routes.
