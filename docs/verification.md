# Static memo verification

## Mobile layout correction, 7 September 2026

- Chromium checks cover all 57 routes in English, German and Georgian at 320, 360, 390, 412 and 768px: 285 viewport checks and 570 closed/expanded states. Every state satisfies `document.documentElement.scrollWidth === document.documentElement.clientWidth`; no clipped cards, multi-column card/input groups or undersized form controls were detected.
- Native menu keyboard activation, visible focus, active-page indication, closing after navigation, and language switching with the current route/query/fragment were verified. Calculator renovation edits change results without changing the report reference; reset restores the baseline. Wide tables scroll independently with the keyboard.
- Full-page desktop overview screenshots at 1280px and 1440px are pixel-identical before and after the correction. Phone screenshots cover Overview, Intouristi property detail and Calculator in all three locales.
- Financial table cells retain normal word wrapping so amounts remain readable inside their horizontal scroll container. A separate final table check covers comparison, calculator and appendix in all three locales at all five widths.
- Evidence is saved under the ignored `.verification/mobile/` directory: browser matrices, interaction results, desktop comparison and screenshots. Production deployment identity and hosted checks belong to the release report; these local results alone do not certify deployment.

## Static simplification

Refactor verification, 6 September 2026.

- Full prototype archived at `archive/full-workspace-prototype` (`b6eb5f2`); secrets and provider state excluded.
- Static Next.js export produces the three locales, all eleven property details and research pages.
- Annual model and source integrity tests pass, including report reconciliation and financial edge cases.
- TypeScript and ESLint pass.
- Local static HTTP verification passes all 57 page/locale combinations, seven removed/invalid routes, six legacy redirects and the static data export.
- Browser check: renovation-cost change updates investment while report reference stays fixed; reset restores base. No API/Supabase resource requests or browser storage keys observed.

Final clean-checkout build, production deployment identity and hosted interaction checks are recorded in the release report and Netlify deployment metadata. Google OAuth is intentionally removed; no onboarding or administrator activation is required.

The clean checkout passed typecheck, lint, all 17 tests and the complete static build without environment files. An isolated Netlify preview passed all 57 routes and every removed API/auth URL returned 404. Archived local Netlify cache was excluded after the initial preview exposed old functions. Browser checks cover historical property input copying, report/source navigation, property/concept comparison, report search, keyboard skip-link focus, mobile overflow, calculator changes/reset and absent service/storage activity. A print test PDF generated successfully.
