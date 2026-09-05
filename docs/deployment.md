# Deployment — deferred

Phase 1 is local only. No Vercel project, GitHub integration, preview or production deployment is created. No environment variables are required.

## Local verification

Use `npm ci`, `npm run check`, `npm run build`, then `npm start` to inspect production output locally. Use `npm run dev` for development. The root redirects to `/de`; section routes exist in DE, EN and KA. Unknown locales and property slugs return not found.

## Future release

After content, modelling, translations and full validation:

1. Connect GitHub to Vercel with the Next.js defaults.
2. Configure branches/pull requests for Preview and `main` for Production.
3. Verify the content-complete preview across routes and locales.
4. Merge the validated release to `main` for production; verify again.

Avoid connecting unfinished `main` in a way that publishes the skeleton. No `vercel.json` is needed. Review temporary `noindex` metadata at the eventual publication gate.
