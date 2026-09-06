# Static memo verification

Refactor verification, 6 September 2026.

- Full prototype archived at `archive/full-workspace-prototype` (`b6eb5f2`); secrets and provider state excluded.
- Static Next.js export produces the three locales, all eleven property details and research pages.
- Annual model and source integrity tests pass, including report reconciliation and financial edge cases.
- TypeScript and ESLint pass.
- Local static HTTP verification passes all 57 page/locale combinations, seven removed/invalid routes, six legacy redirects and the static data export.
- Browser check: renovation-cost change updates investment while report reference stays fixed; reset restores base. No API/Supabase resource requests or browser storage keys observed.

Final clean-checkout build, production deployment identity and hosted interaction checks are recorded in the release report and Netlify deployment metadata. Google OAuth is intentionally removed; no onboarding or administrator activation is required.

The clean checkout passed typecheck, lint, all 17 tests and the complete static build without environment files. An isolated Netlify preview passed all 57 routes and every removed API/auth URL returned 404. Archived local Netlify cache was excluded after the initial preview exposed old functions. Browser checks cover historical property input copying, report/source navigation, property/concept comparison, report search, keyboard skip-link focus, mobile overflow, calculator changes/reset and absent service/storage activity. A print test PDF generated successfully.
